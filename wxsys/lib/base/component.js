import wx from './wx';
import Operational from "./operational";
import {observable, autorun, computed} from  "../mobx/mobx-2.6.2.umd";
import {doEventHandler} from "./createPageConfig";
import {isObject} from "./util";

/**
 * 	生命周期：
 * 		创建: constructor -> willBuildState --> buildState --> didBuildState
 * 		更新：当willBuildState, buildState, didBuildState依赖的可观察对象变化时, 
 * 依次调用willBuildState, buildState, didBuildState 
 * 		释放: destroy
 * 		 
 */

var LIST_CHILDREN_POSTFIX = "].$children";

export default class Component extends Operational{
	constructor(page, id, props, context){
		super();
		this.id = id;
		this.props = props;
		this.context = context;
		this.page = page;
		this.initOperation();
		this._initEvent();
		this.parentPathOB = observable(context.parentPath || "");
		
        this.compid = computed(() => {
            var parentPath = this.getParentPath();
            return parentPath ? (parentPath + "." + this.id) : this.id; 
        });

        this.statePath = computed(() => {
            var parent = this.parentPathOB.get();
            return parent ? (parent + "." + this.id) : this.id; 
        });

        this.oldCompid = null;
        
        
        this.page.$addComp(this.getCompid(), this);
	}
	
	//表示组件是否依赖别的组件
	hasDependence(){
		return false;
	}
	
	//不是直接的父组件, 是指逻辑的父节点，一般是list
	getParentComp(){
	    var ret = null;
	    var path = this.getParentPath();
	    if (path){
	    	var index = path.lastIndexOf("[");
	    	if (index != -1){
	    		path = path.substr(0, index);
	    		ret = this.page.comp(path);
	    	}
	    }
	    return ret;
	}	
	
	getParentPath(){
        var result = "";
        var parentPath = this.parentPathOB.get();
        var items = parentPath.split(LIST_CHILDREN_POSTFIX);
        for (var i=0; i<items.length; i++){
        	var item = items[i];
        	var index = item.lastIndexOf(".items["); 
        	if (index != -1){
        		result += item.substr(0, index) + item.substr(item.lastIndexOf("[")) + "]";
        	}else{
        		result += item; 
        	}
        }
        return result;
	}
	
	inited(){
		this.page.resolvedComp(this.getCompid());
	}

	//TODO 当前仅支持同一层次内的组件依赖，如果需要支持里层依赖外层的组件，编译时需要记录信息
	compPromise(id){
		var parentPath = this.getParentPath();
		var compid = parentPath ? (parentPath.id + "." + id) : id;
		return this.page.compPromise(compid);
	}
	
	
	fireEvent(name, evt) {// 重新实现，增加bindingContext
		if (!evt.hasOwnProperty("context")){
			evt.context = Object.assign({}, this.context.vars || {});
		}
		return super.fireEvent(name, evt);
	}

	_initEvent(){
		var events = this.props.$events || {};
		for (let name in events){
			if (events.hasOwnProperty(name)){
				let handler = events[name]; 
				if (handler){
					this.on(name, (evt) => {
						return doEventHandler(this.page, this, handler, evt);
					});
				}
			}
		}
	}
	
	willBuildState(context){}
	
	//子类重写
	buildState(context){
		var state = {compid: this.getCompid()};
		Object.assign(state, this._evalAttr(this.props.$attrBindFns, this.context.vars));
		return state;
	}
	
	_evalAttr(attrs, vars){
		var ret = {};
		if (attrs){
			for (var key in attrs){
				if (typeof this.page[attrs[key]] === "function"){
					var curVars = Object.assign({$page: this.page}, vars);
					ret[key] = this.page[attrs[key]](curVars);
					if (key == "class"){
						ret[key] = this._processClass(ret[key]);
					}
				}
			}
		}
		return ret;
	}
	
	_processClass(obj){
		var ret = "";
		if (obj && isObject(obj)){
			for (var key in obj){
				if (obj[key]){
					ret += " " + key;
				}
			}
		}
		
		return ret;
	}
	
	didBuildState(state, context){}
	
    //子类重写
	destroy(){
		this.clearListeners();
		this.updateDispose();
        this.page.$removeComp(this.getCompid());
	}
	
	//-------内部api-----------------------
    _update(context){
    	this.context = context;
    	if (this.updateDispose) this.updateDispose();
    	if (context.parentPath) this.parentPath = context.parentPath;
    	this.updateDispose = autorun(() => {
            this.parentPathOB.get(); //当parentPath更新时, 自动触发此方法执行, 从而调用update方法
            this.willBuildState(context);
            var state = this.buildState(context);
            this.setState(state);
            this.didBuildState(state, context);
        });
    }

	//------api--------------------------------
    set parentPath(v){
        this.oldCompid = this.getCompid();
        this.parentPathOB.set(v);
    }

    get parentPath(){
        this.parentPathOB.get();
    }

    getCompid(){
        return this.compid.get();
    }

    getStatePath(){
        return this.statePath.get();
    }
    
    getContext(){
    	return this.context;
    }
    
	//必须显示调用此方法，才会将状态同步到微信的data中
	setState(state){
		state = state || {};
		var compid = this.getCompid();
		state.compid = compid;
        
		//同一个组件换位置时, 需要删除原来的组件
        if (this.oldCompid && (this.oldCompid != compid)
        		&& (this === this.page.comp(this.oldCompid))){
            this.page.$removeComp(this.oldCompid);
        }
        this.page.$addComp(this.getCompid(), this);
        
        var options = {};
        options[this.getStatePath()] = state;
        this.page.setData(options);
	}
	//-----------------------------------------
}
