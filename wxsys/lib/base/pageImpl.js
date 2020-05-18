import wx from './wx';
import {isObject} from "./util";
import renderComponent from "./renderComponent";
import {observable, autorun, computed, toJS, extendObservable} from  "../mobx/mobx-2.6.2.umd";
import Eventable from "./eventable";
import _Date from "./date";


export function parsePath(path, isDataPath) {
	var result = [];
	var item = "";
	var isArray = false;
	var isNumber = false;
    for (var length = path.length, i = 0, c = 0; c < length; c++) {
        var s = path[c];
        if ("\\" === s){
			if (c + 1 < length && ("." === path[c + 1] || "[" === path[c + 1] || "]" === path[c + 1])){
				item += path[c + 1];
				c++;
			}else{
				item += "\\";
			}
        }else if ("." === s){
			if (item){
				result.push(item);
				item = "";
			}
        }else if ("[" === s) {
			if (item){
				result.push(item);
				item = "";
			}
            if (0 === result.length)
            	Reporter.error("path can not start with []: " + path);
            isNumber= true;
            isArray = false;
        } else if ("]" === s) {
            if (!isArray)
            	Reporter.error("must have number in []: " + path);
            isNumber= false;
            if (isDataPath){
            	result.push(item);
            	item = "";
            }else{
                result.push(i);
                i = 0;
            }
        } else if (isNumber) {
        	if (isDataPath){
        		item += s;
        		isArray = true;
        	}else{
                if (s < "0" || s > "9")
                	Reporter.error("only number 0-9 could inside []: " + path);
                isArray = true;
                i = 10 * i + s.charCodeAt(0) - 48;
        	}
        } else
            item += s;
    }

	if (item){
		result.push(item)
	}

    if (0 === result.length)
    	Reporter.error("path can not be empty");
    return result
}

function deepCopy(obj) {
	if ((obj===undefined) || (obj===null)) 
		return obj;
	else
		return JSON.parse(JSON.stringify(obj))
}

function getDataType(obj){
	return Object.prototype.toString.call(obj).split(" ")[1].split("]")[0]
}



function isPlainObject(obj){
	return obj && (Object.prototype.toString.call(obj)==="[object Object]");
}


function processShareAppMessageEvent(page){
	if(page && page.owner){
		if(page.onShareAppMessage || page.hasListener("shareAppMessage")){
			page.owner.onShareAppMessage = page.owner.onShareAppMessageHandle;
			wx.showShareMenu();
		}
	}
}

export default class PageImpl extends Eventable{
    constructor(owner, props, params){
    	super();
        this.owner = owner;
        this.$compRefs = {};
        this.props = props || {};
        this.params = params || {};
        //支持props传Mobx对象, 需要解析成json
        this.data = {props: this.$generateProps(toJS(this.props)), params: this.$cloneNoFn(this.params)};
        this.$compPromises = {};
    }
    
    $isReadonlyMode(){
		return ("readonly" === this.params["_pagePattern"]) 
					|| ("detail"==this.params["activity-pattern"])
					|| ("true"==this.params["readonly"]);
    }
    
    onLoad(options){}
    onReady(){}
    onShow(){}
    onHide(){}
    onUnload(){
        //如果子类重载了此方法, 需要调用父类的这个方法
        this.$onUnload && this.$onUnload();
        var self = this;
        setTimeout(function(){
            if (self.$autorunDisposes) {
              for (var name in self.$autorunDisposes) {
                self.$autorunDisposes[name]();
              }
            }
            //TODO 优化考虑, 组件不需要释放 
            if (self.$compRefs) {
            	for (let key in self.$compRefs) {
            		self.comp(key) && self.comp(key).destroy && self.comp(key).destroy();
            	}
            }
        }, 500); //简化处理, 500ms后释放所有组件, 如果中事件中异步处理超出此时间范围会有问题
    }
    onPullDownRefresh(){}
    onReachBottom(){}
    //onShareAppMessage(){}//lzg 2018-5-3 默认不添加由开发者执行添加，添加后将出现转发菜单
    onPageScroll(){}
    
    $generateProps(props){
    	var obj = {};
    	var names = props.$pnames || "";
    	if (names){
    		var items = names.split(",");
    		for (var i=0; i<items.length; i++){
    			if (props.hasOwnProperty(items[i])){
    				obj[items[i]] = props[items[i]];
    			}
    		}
    	}
    	
    	obj = this.$cloneNoFn(obj);
    	return obj;
    }
    
    $cloneNoFn(obj){
    	var result = {};
    	if (obj){
    		for (var key in obj){
    			//特殊处理：排除$开头和__root__等内部生成的属性, 其它的认为是用户写的属性
    			if (obj.hasOwnProperty(key)){
    				let value = obj[key];
    				if (value===null || value === undefined){
    					result[key] = value;
    				}else if (typeof value === "function"){
    					//忽略方法
    				}else if (value instanceof Eventable){
    					//忽略所有的组件
    				}else if (value instanceof Date && ("Invalid Date" != (value+""))){
    		              value = new Date(value.toISOString());
    		              value.toString = function () { return _Date.toString(value, _Date.DEFAULT_FORMAT1);};
    		              //重写toJSON，为了展现
    		              value.toJSON = function () { return _Date.toString(value, _Date.DEFAULT_FORMAT1); };
    		              result[key] = value;
    				}else if (typeof value === "object"){
    					result[key] = this.$cloneNoFn(value);
    				}else{
    					result[key] = value;
    				}
    			}
    		}
    	}
    	
    	return result;
    }

    $init(template, methods, pageid){
        this.data = this.data || {};
        this.data.__pageid__ = pageid || "";
        if (methods){
            for (var name in methods){
                this[name] = methods[name].bind(this);
            }
        }
        
        this.setData(this.data);
        
        renderComponent(this, template, "", {props: this.data.props || {}, params: this.params || {}, $page: this});

        //初始化完成后挂接分享转发事件
        processShareAppMessageEvent(this);
    }
    
    $updateProps(nextProps){
        if (this.onPropertyChanged){
        	this.onPropertyChanged(nextProps || {});
        }
    	this.props = nextProps || {};
    	this.setData({"props": this.$generateProps(toJS(this.props))});
    }

    /**
	* 	需求: 在js代码中, 通过标准的js代码的方式修改模型对象时, 会将模型对象同步到data中, 从而影响界面展现
	*	path: 同步到微信data的路径
	*	initData: 初始化数据
	*	注意: 添加属性时, 需要调用extendModel
	*/
    createModel(path, initData){
    	if(isObject(initData)){
    		initData.__$modelPath__ = path;
            var mo = observable(initData);
            var dispose = autorun(() => {
                var json = toJS(mo);
                var options = {};
                options[path] = json;
                this.setData(options);
            });
            
            this.$autorunDisposes = this.$autorunDisposes || {};
            this.$autorunDisposes[path]= dispose;
            return mo;
    	}else{
    		console.error("createModel initData param accepts  an Object");
    	}
    }  
      
    extendModel(mo, props){
    	if (mo && props){
	    	this.$autorunDisposes[mo.__$modelPath__]();
	    	extendObservable(mo, props);
	    	this.$autorunDisposes[mo.__$modelPath__] = autorun(() => {
	            var json = toJS(mo);
	            var options = {};
	            options[mo.__$modelPath__] = json;
	            this.setData(options);
	        });
    	}
    }
    
    //----------组件api开始--------------------
    $compByCtx(key,comp){
    	if (key){
    		while (comp && comp.getParentPath && comp.getParentPath()){
    			let ret = this.comp(comp.getParentPath() + "." + key);
    			if (ret) 
    				return ret;
    			else{
    				comp = comp.getParentComp();
    			}
        	}
    	}

        return  this.$compRefs[key];
    }
    
    comp(key,comp){
        return this.$compByCtx(key,comp);
    }
    
    comps(key){
    	var ret = [];
    	for (var name in this.$compRefs){
    		if (this.$compRefs.hasOwnProperty(name)){
    			var items = name.split(".");
    			if (items[items.length-1] === key){
    				ret[ret.length] = this.$compRefs[name];
    			}
    		}
    	}
    	return ret;
    }

    $addComp(key, comp){
         this.$compRefs[key] = comp;
    }

    $removeComp(key){
    	delete this.$compPromises[key];
        delete this.$compRefs[key];
    }
    //----------获取组件api结束--------------------


    //------------setData相关逻辑开始----------------------------------
	setData(options){
		if (getDataType(options) != "Object"){
			Reporter.warn("setData accepts an Object rather than some " + getDataType(options));
		}
		
		for (var name in options) {
            var o = this.$getObjectByPath(this.data, name);
            var r = o.obj;
            var i = o.key;
            if (r){
            	r[i] = deepCopy(options[name]);
            }
        }
        
		this.$setDataProxy(options); //只更新需要更新的数据
	}
	
	$getObjectByPath(obj, path) {
		var item = undefined, key = undefined, unit = obj;
	    for (var items = parsePath(path), c = 0; c < items.length; c++){
			if (Number(items[c]) === items[c] && items[c] % 1 === 0){
				if (!Array.isArray(unit)){
					item[key] = [];
					unit = item[key];
				}
			}else{
				if (!isPlainObject(unit)){
					item[key] = {};
					unit = item[key];
				}
			}

	        key = items[c];
	        item = unit;
	        unit = unit[items[c]];
		}
	    return {
	        obj: item,
	        key: key
	    }
	}
	
	
	$addCache(name, value){
		for (let key in this.$cache){
			 if (this.$cache.hasOwnProperty(key) && (key.indexOf(name + ".")==0)){
				 delete this.$cache[key];
			 }
		}
		this.$cache[name] = value;
	}
	
    $setDataProxy(params){
        if(isObject(params)){
            if (!this.$cache){
                this.$cache = params;
            }else{
                for (var i in params){
                	this.$addCache(i, params[i]);
                }
            }
            
            if (!this.$cacheEnabled){
                this.$cacheEnabled = true;
                setTimeout(this.$syncCache.bind(this), 0);
            }
        }else{
            console.error("setData accepts an Object");
        }
    }

    $syncCache(){
        try{
        	this.owner.setData(this.$cache);
        }finally{
            this.$cache = null;
            this.$cacheEnabled = false;
        }
    }
    //---------------setData相关逻辑结束-------------------------
	
	//--------组件依赖-------------
	resolvedComp(compid) {
		if (compid){
			this.compPromise(compid).$resolve(this.comp(compid));
			this.compPromise(compid).$status = "resolved"; //记录promise状态
		}
	}
	
	compPromise(compid){
		if (!this.$compPromises[compid]){
			let res = null;
			let rej = null;
			this.$compPromises[compid] = new Promise(function(resolve, reject){
				res = resolve;
				rej = reject;
			});
			this.$compPromises[compid].$resolve = res;
			this.$compPromises[compid].$reject = rej;
		}
		return this.$compPromises[compid];
	}
	//----------------------------
	
   	hint(message,type,duration){
  		this.comp(PageImpl.TOPTIPS_NAME).show(message || '', type, duration);
  	}

}

PageImpl.TOPTIPS_NAME = "__toptips__";
/*
PageImpl.EVENTS = {
	PROPERTY_CHANGED: "propertychanged"
};
*/
