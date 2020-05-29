import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import Util from "../../lib/base/util";
import minioUtil from "../image/util/minioUtil";
import {observable,toJS,autorun, untracked} from '../../lib/mobx/mobx-2.6.2.umd';

export default class Share extends Component{
    constructor(page, id, props, context){
        super(page, id, props, context);
        this.imageUrl = observable("");
        this.actionUrl = wx.App.baseUrl + (this.props.actionUrl || "/storage");
        var self = this;
        autorun(() => {
        	if (self.props.$imageUrlFn && (typeof self.page[self.props.$imageUrlFn]==="function")){
       		 var imageUrlResult = self.page[self.props.$imageUrlFn](self.context.vars);
       		 untracked(() => {        			 
       			 if(imageUrlResult && imageUrlResult.indexOf("[{\"storeFileName\"") == 0){
       				 imageUrlResult = JSON.parse(imageUrlResult);
       				 for(var i = 0 ; i < imageUrlResult.length ; i ++){
       				 var imageUrlName = imageUrlResult[i].realFileName;
       				 var imageUrlType = imageUrlName.substring(imageUrlName.lastIndexOf("."),imageUrlName.length).toLocaleLowerCase();
       				 var imageUrlStoreFileName = imageUrlResult[i].storeFileName;
       					if(imageUrlStoreFileName.indexOf("anoy_") == 0){
       						minioUtil.getFileUrl(self.actionUrl,imageUrlStoreFileName).then(function(data){
       							self.imageUrl.set(data+imageUrlStoreFileName);
       						})
       					}else{     	    					
       						wx.request({
       							url: this.actionUrl + '/presignedGetObject',
       							data: {
       								objectName: imageUrlStoreFileName
       							},
       						    header: {
       								'content-type': 'application/json'
       							},
       							success: function (res) {
       								self.imageUrl.set(res.data);
       							}
       						})
       					}
       					break;
       				}
       			 }else{
       				 self.imageUrl.set(imageUrlResult);
       			 }
       		 })
           }
        })
        this.bindEvent();
     }
    
    buildState(context){
     	 var state = super.buildState(context);
     	 state.imageUrl = this.imageUrl.get();
     	 return state;
   }
   
    destroy(){
    	this.shareAppMessageHandle && this.page.off("shareAppMessage",this.shareAppMessageHandle);
    	super.destroy();
    }
    
    showShareMenu(){
    	var self = this;
    	var ret = wx.showShareMenu({});
    	ret.catch(function(res){
    		console.error('显示分享菜单失败');
    	});
    	return ret;
    }

    hideShareMenu(){
		var ret = wx.hideShareMenu({});
		ret.catch(function(res){
			console.error('隐藏分享菜单失败');
		});
		return ret;
    }
    
    bindEvent(){
    	// var eventData = {source: this.$page, result: null, res: res};
    	this.shareAppMessageHandle = (evt)=>{
    		if(!evt.res){
    			evt.res = {
    					from : 'menu'
    			}
    		}
    		evt.result = this.doShareAppMessage(evt.res);
    	};
    	this.page.on("shareAppMessage",this.shareAppMessageHandle);
    }
    
    processPath(path){
    	if(typeof(path)==='string'){
    		if(path.endsWith('.w') || path.endsWith('.W'))
    			path = Util.toResUrl(path);
    	}
		return path;
    }
    
    doShareAppMessage(res){
    	if(res){
    		/*
			 * title 转发标题 当前小程序名称 path 转发路径 当前页面 path ，必须是以 / 开头的完整路径 imageUrl
			 * 自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl
			 * 则使用默认截图。iOS 显示图片长宽比是 5:4，Android 显示图片长宽比是
			 * 215:168。高度超出部分会从底部裁剪。推荐使用 Android 图片长宽比，可保证图片在两个平台都完整显示，其中 iOS
			 * 底部会出现一小段白色
			 */
    		let self = this;
    		let pages = getCurrentPages();
			let curPage = pages[pages.length-1];
			let path = this.props.path;
			if(path) {
				path = this.processPath(path);
			}else{
				//lzg 代码统一，slm说逻辑是一致的
				//if(wx.Device.isX5App()){
				//	path = location.pathname + location.hash
				//}else{ 
					path = "/"+curPage.route;
				//}
			}
			var imageUrl = "";
			if(this.props.imageUrl){
				if(this.props.imageUrl.indexOf(".current.") == -1){
					imageUrl = Util.toResUrl(this.props.imageUrl);
				}else{
					imageUrl = this.imageUrl.get()
				}
			}
			let defaultParams = {
					success:function(res){
						self.fireEvent('success',{source:self});
					},
					fail:function(err){
						self.fireEvent('fail',{source:self});
					},
					title:'',
					path:path,
					imageUrl: imageUrl
			};
    		let userParams = this.page[this.props.$execute_paramExpr]?(this.page[this.props.$execute_paramExpr](this.context.vars) || {}):{};
    		userParams.path && (userParams.path = this.processPath(userParams.path));
    		if(userParams.params){
    			let p = [];
    			let params = userParams.params;
    			for(let k in params){
    				p.push(k+"="+params[k]);
    			}
    			let url = (userParams.path || defaultParams.path);
    			if(p.length>0) userParams.path = url + (url.indexOf('?')<0?'?':'&') + p.join('&');
    		}
    		return Object.assign(defaultParams, userParams);// 合并
    	}
    }
    
    initOperation(){
    	 super.initOperation();
	   	 this.defineOperation('showShareMenu', {
	   		 label : "显示分享菜单",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : [],
	   		 method : function(args) {
	   			 return this.owner.showShareMenu();
	   		 }
	   	 });
	   	 this.defineOperation('hideShareMenu', {
	   		 label : "隐藏分享菜单",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : [],
	   		 method : function(args) {
	   			 return this.owner.hideShareMenu();
	   		 }
	   	 });
     }
};

wx.comp = wx.comp || {};
wx.comp.Share = Share;
