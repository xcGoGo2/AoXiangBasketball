import wx from './wx';
import {isObject} from "./util";
import {runInAction} from  "../mobx/mobx-2.6.2.umd";

function getFn(obj, path){
	var items = path.split(".");
	var fn = obj;
	for (var i=0; i<items.length; i++){
		if (items[i]){
			fn = fn[items[i]];
			if (!fn) break; 
		}else{
			fn=null;
			break;
		}
	}
	return fn;
}

//支持自定义事件的处理器是{{}}的情况
function evalCompid(page, compid){
	if (compid && (compid.slice(0, 2) == "{{") && (compid.slice(-2)=="}}")){
		compid = compid.substring(2, compid.length-2);
	    var o = page.$getObjectByPath(page.data, compid);
	    if (o && o.obj && o.key && o.obj[o.key]){
	    	return o.obj[o.key];
	    }
	}
	return compid;
}


export function doEventHandler(page, ownerComp, handlers, evt, isNative){
	runInAction(() => {
		try{//所有的异常延迟抛出，保证runInAction能完整执行
			var handlerList = handlers.split(",");
			for (var i=0; i<handlerList.length; i++){
				var handler = handlerList[i];
				if (handler){
					var compid = "";
					var fnPath = "";
					var items = handler.split(":");
					if (items.length==2){
						compid = items[0];
						fnPath = items[1];
					}else{
						compid = "";
						fnPath = items[0];
					}
					compid = evalCompid(page, compid);
					var comp = compid ? page.comp(compid) : page;
					if (!fnPath){
						throw new Error("'" + fnPath + "' is undefined!");
					}
					
					var fn = getFn(comp, fnPath);
					if (typeof fn === "function"){
						var context = {$page: page, params: page.params};
						if (ownerComp && ownerComp.getContext()){
							Object.assign(context, ownerComp.getContext().vars || {});
							ownerComp.getEventVars && Object.assign(context, ownerComp.getEventVars(evt) || {});
						}
						var newEvt = null;
						if (isNative){
							newEvt = Object.assign({context: Object.assign({}, context), source: ownerComp}, evt);
						}else{
							newEvt = Object.assign(evt||{}, {context: Object.assign({}, context), source: ownerComp});
						}
						var ret = null;
						if (fnPath.indexOf("$evtH") === 0){
							//调用操作
							context.$event = newEvt;
							ret = fn.call(null, context);
						}else{
							ret = fn.call(comp, newEvt);
						}
						//自定义事件只允许挂一个事件处理器
						if (!isNative) return ret;
					}else{
						throw new Error(fnPath + " is not a function");
					}
				}
			}
		}catch(e){
			let oldE = e;
			setTimeout(function(){throw oldE;},1);
		}
	});	
}

export default function createPageConfig(PageClass, template, methods, pageConfig){
	var ret = {
		onLoad: function(options){
			runInAction(() => {
				this.$pageOptions = getApp().$pageOptions || {};
	           	getApp().$pageOptions = null;
	           	this.$parseOptions(options);
	           	var params = options||{};  //只取url中的参数
				this.$page = new PageClass(this, this.props || {}, params);
				this.$page.basePath = this.basePath;
				this.$page.contextPath = this.contextPath;
	            this.$page.$init(template,  methods);
	            var eventData = {source: this.$page, params: params};
	            this.$page.fireEvent("beforeLoad", eventData);
	            this.$page.fireEvent("load", eventData);
	            this.$page.onLoad && this.$page.onLoad(params);
	            this.$page.fireEvent("afterLoad", eventData);
			});
		},
		
		$parseOptions: function(options){
			if (options){
				var params = null;
				for (var i=0; i<template.length; i++){
					var item = template[i];
					if (item && (item.cls === wx.comp.Page) && item.props && item.props.params){
						params = item.props.params;
						break;
					}
				}
				
				for (var k in params){
					if (options.hasOwnProperty(k) && params.hasOwnProperty(k)){
						options[k] = this.$parseParamValue(options[k], params[k]);
					}
				}
			}
		},
		
		$parseParamValue: function(value, type){
			var ret = value;
			try{
				if (value != ""){
					if (type === "Integer" || type == "Double" || type == "Decimal"){
						ret = Number(value); 
					}else if (type === "Boolean"){
						ret = "false"!==value;
					}else if (type === "DateTime"){
						ret = new Date(value);
						if ("Invalid Date" === String(ret)){
							ret = value;
						}
					}else if (type === "Object" || type === "Array"){
						ret = JSON.parse(value);
					}
				}
			}catch(e){
				ret = value;
			}
			return ret;
		},

		onReady: function(){
			runInAction(() => {
				this._fireEvent("ready");
				var loaded = false;
		        var items = [];
		        var compPromises = this.$page.$compPromises;
		        var noComps = [];
		        for (let name in compPromises){
		        	if (compPromises.hasOwnProperty(name) && compPromises[name]){
		        		items.push(compPromises[name]);
		        	}
		        	
		        	if (!this.$page.comp(name)){
		        		noComps.push(name);
		        	}
		        }
		        if (noComps.length > 0){
		        	console.error("组件[" + noComps.join(",") + "]不存在，“页面加载完成”事件将不会被触发！");
		        }
		        
		        Promise.all(items).then(() => {
		        	runInAction(() => {
		        		this._fireEvent("loaded");
		        		loaded = true;
		        	});	
		        });
		        
	            if (compPromises){
	            	setTimeout(() => {
	            		if (!loaded){
	            			let errorComps = [];
	            			for (let name in compPromises) {
	            				if (compPromises.hasOwnProperty(name) 
	            						&& compPromises[name]
	            						&& (compPromises[name].$status!="resolved")) {
	            					errorComps.push(name);
	            				}
	            			}
	            			if (errorComps.length > 0){
	            				console.warn("10s后组件没有初始化完成！可能的组件是：" + errorComps);
	            			}
	            		}
	                }, 10000);
	            }
			});
		},

		onShow: function(){
        	this._fireEvent("show");
		},

		onHide: function(){
        	this._fireEvent("hide");
		},

        onPullDownRefresh: function(){
        	this._fireEvent("pullDownRefresh");
        },

        onReachBottom: function(){
        	this._fireEvent("reachBottom");
        },

        onUnload: function(){
        	this._fireEvent("unload");
        },
        onShareAppMessageHandle: function(res){
        	var eventData = {source: this.$page, result: null, res: res};
        	var result;
        	runInAction(() => {        	
	            this.$page.fireEvent("beforeShareAppMessage", eventData);
	            this.$page.fireEvent("shareAppMessage", eventData);
	            result = eventData.result;
	            if (this.$page.onShareAppMessage){
	            	var result2 = this.$page.onShareAppMessage(res);
	            	if (result2){
	            		result = result2;
	            	}
	            }
	            this.$page.fireEvent("afterShareAppMessage", eventData);
        	});    
            return result;
        },
        onPageScroll: function(){
        	this._fireEvent("pageScroll");
        },
        
        _fireEvent: function(event, eventData){
        	eventData = eventData || {source: this.$page};
        	var suffix = event.charAt(0).toUpperCase() + event.substring(1);
        	runInAction(() => {
	            this.$page.fireEvent("before" + suffix, eventData);
	            this.$page.fireEvent(event, eventData);
	            this.$page["on" + suffix] && this.$page["on" + suffix]();
	            this.$page.fireEvent("after" + suffix, eventData);
        	});    
        	return eventData;
        },
        
        dispatchBind: function(evt){
        	this.dispatch(evt, "bind");
        },
				
				goHome: function() {
					wx.navigateTo({
						url: '/pages/index/index'
		})
				},

        debounceDispatchBind: function(evt){
        	var target = evt.currentTarget || evt.target;
        	var pageid = target.dataset.pageid;
            var page = this.getPage(pageid);
        	if (target.dataset.compid){
				var ownerComp = page.comp(target.dataset.compid);
				if(ownerComp.startDebounce){
					var timer = function(prevTimer,timeout){
						if(prevTimer){
							clearTimeout(prevTimer);
						}
						var timerId = setTimeout(function(){
							if(ownerComp){
								ownerComp.tapRunning = false;
								if(ownerComp.stopDebounce){
					        		ownerComp.stopDebounce();
					        	}
							}
							wx.request.off("requestSuccess",endRequestFn);
					        wx.request.off("requestError",endRequestFn);
					        wx.request.off("requestSend",sendRequestFn);
						},timeout);
						return timerId;
					};
					var endRequestFn = function(){
						ownerComp.tapTimerId = timer(ownerComp.tapTimerId,0);
			    	};
			    	var sendRequestFn = function(){
			    		if(ownerComp && ownerComp.startDebounce){
			        		ownerComp.startDebounce();
			        	}
			        	ownerComp.tapTimerId = timer(ownerComp.tapTimerId,5000);
			    	}; 
					wx.request.on("requestSuccess",endRequestFn);
			        wx.request.on("requestError",endRequestFn);
			        wx.request.on("requestSend",sendRequestFn);
			        ownerComp.tapTimerId = timer(ownerComp.tapTimerId,300);
			        if(!ownerComp.tapRunning){
			    		ownerComp.tapRunning = true;
			    		this.dispatchBind(evt, "bind");
			    	}
				}
				return;
			}
        	this.dispatchBind(evt, "bind");
        },

        dispatchCatch: function(evt){
        	this.dispatch(evt, "catch");
        },
        
        dispatchCaptureBind: function(evt){
        	this.dispatch(evt, "captureBind");
        },
        
        dispatchCaptureCatch: function(evt){
        	this.dispatch(evt, "captureCatch");
        },

		dispatch: function(evt, prefix){
			var target = evt.currentTarget || evt.target; //小程序中有些事件没有currentTarget, 和文档不一致
			var pageid = target.dataset.pageid;
			var page = this.getPage(pageid);
			//handler格式: "compid:fn"
			// 特殊处理地图组件  bindregionchange 视野发生变化事件，由于bindregionchange的type是 end 和 begin。如果遇到这个事件，硬性转换成regionchange
			var type = evt.type == "begin" || evt.type =="end" ? "regionchange" : evt.type;
			var handler = target.dataset[prefix + type];
			if (!handler){
				return;
			}
			var ownerComp = null;
			if (target.dataset.compid){
				ownerComp = page.comp(target.dataset.compid);
			}
			
			//解决textarea的bindblur在bindtap之后执行的问题, 将input上的值更新到data中
			if ((evt.type === "tap") && page.$lastInput){
				page.$lastInput.$updateValue();
			}
			doEventHandler(page, ownerComp, handler, evt, true);	
		},

		getPage: function(pageid){
			var result = this.$page;
			if (pageid){
				var ids = pageid.split(";");
				for (var i=0; i<ids.length; i++){
					if (ids[i]){
						//取出的是pageComp组件
						var comp = result.comp(ids[i]);
						if (!comp){
							throw new Error("find page by pageid is null! pageid: " + pageid + ", error id: " + ids[i]);
						}
						result = comp.innerPage;
					}
				}
			}
			return result;
		},
		
    	/*优化性能, 不走模板机制
        updateData: function(data){
        	var config = {};
        	for (let key in data){
        		if (data.hasOwnProperty(key))
        		config["data." + key] = data[key];
        	}
        	this.$setDataProxy(config);
        	
            //var wxpatch = this.toWXPatch({data: data});
            //console.log(JSON.stringify(wxpatch));
            //if (wxpatch){
            //  this.$setDataProxy(wxpatch);
            //}
          
        }
        */
		
		/*
        toWXPatch(data){
            data = data || {};
            var patchs = jsonpatch.compare(this.oldData || {}, data);
            if (patchs.length == 0){
              return null;
            }


            var ret = {};
            var loaded = [];
            for (let i = 0; i < patchs.length; i++) {
              let patch = patchs[i];
              if (this.isLoadedPath(patch.path, loaded)){
            	  continue;
              }
              let path = this.toWXPath(patch.path);
              if (patch.op == "add" || patch.op == "replace") {
                  ret[path] = patch.value;
              } else if (patch.op == "remove") {
            	  if (path.indexOf(".") != -1){
            		  let parent = path.substring(0, path.lastIndexOf("."));
            		  loaded.push(patch.path);
            		  ret[parent] = getObjectByPath(data, parent).obj;
            	  }else{
            		  throw new Error("unsupport " + JSON.stringify(patch));
            	  }
                  //ret[path] = null; //TODO 简单处理
              } else {
                throw new Error("unsupport " + JSON.stringify(patch));
              }
            }


            this.oldData =  JSON.parse(JSON.stringify(data)); 
            return ret;
          },
          
          isLoadedPath(path, loadeds){
        	  for (let i=0; i<loadeds.length; i++){
        		  if (loadeds[i].indexOf(path) == 0)
        			  return true;
        	  }
        	  
        	  return false;
        	  
          },

          toWXPath(path){
            var ret = "";
            var items = path.split("/");
            for (var i=0; i<items.length; i++){
              if ("0" <= items[i] && "9" >= items[i]){
                ret = ret + "[" + items[i] + "]";
              }else{
                if (ret) ret +=  ".";
                ret += items[i];
              }
            }
            return ret;
          }
		*/	
	}

	pageConfig = pageConfig || {};
	var onHeadOptionRender = null;
	if (pageConfig.disableMenuButton){
		onHeadOptionRender = "";
	}else{
		if (pageConfig.menuButtonImg){
			onHeadOptionRender = "<div><image src='"+ pageConfig.menuButtonImg +"'/></div>";
		}
	}
	if (onHeadOptionRender !== null){
		ret.onHeadOptionRender = function(){
			return onHeadOptionRender;
		}
	}
	return ret;
	
	

}

