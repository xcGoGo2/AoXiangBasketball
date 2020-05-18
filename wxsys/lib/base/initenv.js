import wx from './wx';
import {request, setConfig} from "../reqPromise/wx-promise-request.min";
import UUID from "./uuid";
import Util from "./util";
import Base64 from "./base64";
import _Date from "./date";
import _String from "./string";
import _Number from "./number";
import _CommonUtilFn from "../fn/commonUtilFn";
import _DateTimeUtilFn from "../fn/dateTimeUtilFn";
import _EncryptUtilFn from "../fn/encryptUtilFn";
import _MathUtilFn from "../fn/mathUtilFn";
import _RandomUtilFn from "../fn/randomUtilFn";
import _StringUtilFn from "../fn/stringUtilFn";
import _UrlUtilFn from "../fn/urlUtilFn";
import _CollectionUtilFn from "../fn/collectionUtilFn";
import {runInAction} from  "../mobx/mobx-2.6.2.umd";
import _ShareData from "./shareData";
import Eventable from "./eventable";
import Device from "./device";
import StringCheck from "./stringCheck";




wx.Device = Device;
wx.UUID = UUID;
wx.Util = Util;
wx.Base64 = Base64;
wx.Date = _Date;
wx.String = _String;
wx.Number = _Number;
wx.ShareData = _ShareData;
wx.CommonUtilFn=_CommonUtilFn
wx.DateTimeUtilFn=_DateTimeUtilFn
wx.EncryptUtilFn=_EncryptUtilFn
wx.MathUtilFn=_MathUtilFn
wx.RandomUtilFn=_RandomUtilFn
wx.StringUtilFn =_StringUtilFn 
wx.UrlUtilFn=_UrlUtilFn
wx.CollectionUtilFn=_CollectionUtilFn
wx.StringCheck = StringCheck


wx.compClass = function(url){
	if (!url) return null;
	if (wx.comp[url]){
		return wx.comp[url];
	}else {
		var items = url.split("/");
		var name = items[items.length-1];
		if (name){
			name = name.substr(0, 1).toUpperCase() + name.substr(1);
			return wx.comp[name];
		}
	}
	return null;
};


//操作特殊的Promise: 同步结果同步执行，异步的异步执行
function OperationPromise(data){
    this.data = data;
    this.then = function (fn) {
      var value = undefined;
      if (fn) value = fn(this.data);
      if (typeof value === "object" && value.then) {
        return value;
      } else {
        return new OperationPromise(value);
      }
    };
};
OperationPromise.resolve = function(value){
  if (typeof value === "object" && value.then) {
    return Promise.resolve(value);
  } else {
    return new OperationPromise(value);
  }
};

wx.OperationPromise = OperationPromise;


function callFns(fn1, fn2, params){
	var ex = null;
	runInAction(() => {
		try{
			fn1 && fn1(params);
		}catch(e){
			ex=e;
		}
	});	
	if (fn2){
		setTimeout(function(){
			runInAction(() => {
				fn2(params);
			});
	    });
	}
	if (ex != null){
		console.error(ex);
		throw ex;
	}
}

function requestWrapper(){
	var wxRequest = wx.request;
	setConfig({request: wxRequest, concurrency: 5}); //为了支持没有appid的测试模式 , 允许的并发数为5
	wx.request = function (params) {
		if (params.url){
			params.url = encodeURI(params.url);
			//默认/是相对后台域名
			if (params.url.indexOf("/") == 0){
				params.url = (wx.App.baseUrl || "") + params.url;
			}
		}
		
		var success = params.success;
	    var fail = params.fail;
	    var complete = params.complete;
	    var result = request(params);
	    result.then(function (res) {
	    	setTimeout(function(){
		    	if ((res.statusCode >= 200) && (res.statusCode < 300)){
		    		callFns(success, complete, res);
		    	}else{
		    		callFns(fail, complete, res);
		    	}
	    	}, 1);
	    }, function (err) {
	    	setTimeout(function(){
	    		callFns(fail, complete, err);	
	    	}, 1);
	    });
	    return result;
	};
}

// 特别指定的wx对象中不进行Promise封装的方法
const noPromiseMethods = {
  clearStorage: 1,
  hideToast: 1,
  showNavigationBarLoading: 1,
  hideNavigationBarLoading: 1,
  drawCanvas: 1,
  canvasToTempFilePath: 1,
  hideKeyboard: 1,
  request: 1,
  getRecorderManager: 1,
  compClass: 1,
};

function promisifyApi() {
  Object.keys(wx).forEach((key) => {
	 if(typeof wx[key] === "function"){
		 if (!(noPromiseMethods[key]                        // 特别指定的方法
		 		  || (key.length>0 && /^[A-Z]/.test(key.substr(0, 1)))  //首字母大写不需要
			      || /^(on|create|stop|pause|close)/.test(key) // 以on* create* stop* pause* close* 开头的方法
			      || /\w+Sync$/.test(key)                      // 以Sync结尾的方法
			      )) {
		      let _temp = wx[key];
		      wx[key] = function (obj) {
		        obj = obj || {};
		        if(obj.success || obj.fail || obj.complete){
		          let fn = obj.fail;
		          obj.fail = function(res){
		                errMsgFn(res);
		                fn && fn(res);
		              }
		          return _temp.call(wx,obj);
		        }else{
		          return new Promise((resolve, reject) => {
		            obj.success = resolve;
		            obj.fail = (res) => {
		              errMsgFn(res);
		              reject(res);
		            };
		            _temp.call(wx,obj);
		          });
		        }
		      }
	    }	
	 } 
    
  });
}

//部分错误信息转中文特殊处理 ghc 2018-12
function errMsgFn(ret) {  
	  if (ret.errMsg == "switchTab:fail can not switch to no-tabBar page") {
	    ret.errMsg = "只允许跳转到 tabBar 页面";
	  } else if (ret.errMsg == "navigateTo:fail can not navigateTo a tabbar page") {
	    ret.errMsg = "不允许跳转到 tabBar 页面";
	  } else if (ret.errMsg == "redirectTo:fail can not redirectTo a tabbar page") {
	    ret.errMsg = "不允许跳转到 tabBar 页面";
	  }
	}

function addParamsToUrl(url, params){
	if (!url) return url;
	for (var key in params){
		if (params.hasOwnProperty(key)){
			var value = params[key];
			if (value===null || value===undefined)
				continue;
			if (value instanceof Date){
				value = value.toJSON();
			}else if (Util.isArray(value) || Util.isObject(value)){
				value = JSON.stringify(value);
			}

			url += (url.indexOf("?") != -1) ? "&" : "?";
			url += key + "=" + value;
		}
	}
	return url;
}

//规范：{params: 传递的参数, onClose: 子页面关闭时调用的函数, 里面带有传递的数据}
function navigateWrapper(){
	var keys = ["switchTab", "navigateTo", "redirectTo", "navigateBack", "reLaunch"];
	for (var i=0; i<keys.length; i++){
		let key = keys[i];
		let oldFn = wx[key];
		wx[key] = function(obj){
			obj = obj || {};
			if (!obj.url && (key !='navigateBack')){
				throw new Error("参数url不允许为空！");
		    }
			if (obj.url && (obj.url.indexOf(".w") != -1)) obj.url = Util.toResUrl(obj.url);
			let params = obj.params || {};
			 if (key !== "switchTab"){
				 obj.url = addParamsToUrl(obj.url, params); //解决分享时, 没有带参数的问题	 
			 }
			
			
			delete obj.params;
			if (key === "navigateBack"){
				//TODO 要求必须原路返回, 否则会有问题
				var page = getCurrentPages()[getCurrentPages().length-1];
				if (page.$pageOptions && page.$pageOptions.onClose)
					page.$pageOptions.onClose({data: params});
			}else{
				//参数统一走url的方式
				getApp().$pageOptions = {
					onClose: obj.onClose || null
				}
			}
			getApp().pageOptions = getApp().pageOptions || {};
			getApp().pageOptions.action = key;
			
			oldFn.call(wx, obj);
		}
	}
}

function initBaseUrl(){
	if (!wx.App.baseUrl && window && window.location && window.location.origin){
		//如果是H5的话, 默认设置为当前域名
		wx.App.baseUrl = window.location.origin;
		if (window.location.pathname.split("/").length > 1){
			//默认第一级+第二级是应用名
			wx.App.resPath = window.location.origin + "/" + window.location.pathname.split("/")[1] + "/" + window.location.pathname.split("/")[2];
		}
	}
}

function supportRequestCookie() {
    let oldRequest = wx.request;
    wx.request = function (obj) {
        let cookie = wx.getStorageSync('Cookie');
        if (cookie) {
            let cookieValue = "";
            for(let key in cookie){
                cookieValue +=  ";";
                cookieValue += (key + "=" + cookie[key]);
            }
            obj.header = obj.header || {};
            obj.header.Cookie = cookieValue;
        }
        let result = oldRequest.call(wx, obj);
        result.then(function (res) {
            let header = res.header;
            let cookie = header['Set-Cookie'];
            if(cookie && cookie.indexOf(';')!=-1){
                cookie = cookie.split(";")[0];
            }
            if(cookie.indexOf('=') !=-1){
                let key = cookie.split("=")[0];
                let value = cookie.split("=")[1];
                let storeCookie = wx.getStorageSync('Cookie') || {};
                storeCookie[key] = value;
                wx.setStorageSync('Cookie', storeCookie);
            }
        }).catch(function (res) {
        });
        return result;
    }
}

class EventableRequest extends Eventable{
	constructor(){
		super();
		this.oldRequest = wx.request;
	}
	
	request(obj){
		this.fireEvent("requestSend",{
			data:obj
		});
        let result = this.oldRequest.call(wx, obj);
        let self = this;
        result.then(function (res) {
        	self.fireEvent("requestSuccess",{
    			data:res
    		});
        }).catch(function (res) {
        	self.fireEvent("requestError",{
    			data:res
    		});
        });
        return result;
    }
}

function supportRequestEvent(){
	let eventableRequest = new EventableRequest();
	wx.request = function(obj){
		return eventableRequest.request(obj);
	};
	
	wx.request.on = function(name,func){
		eventableRequest.on(name,func);
	};
	
	wx.request.off = function(name,func){
		eventableRequest.off(name,func);
	};
}

export function initenv(){
	initBaseUrl();
	navigateWrapper();
	requestWrapper();
    promisifyApi();
    supportRequestCookie();
    supportRequestEvent();
    wx.Date.initServerDate();
}
