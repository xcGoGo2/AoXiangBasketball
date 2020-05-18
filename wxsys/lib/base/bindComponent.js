import wx from './wx';
import Component from "../../lib/base/component";

export default class BindComponent extends Component {
    constructor(page, id, props, context){
        super(page, id, props, context);
    }
    
    getRefPath(){
    	if (this.props.$refPathFn){
    		return this.page[this.props.$refPathFn](this.context.vars);
    	}else{
    		return;
    	}
    }
    
    getRefPropName(){
    	return this.props.$propName;
    }
    
    getValue(){
    	if (this.props.$refFn){
    		return this.page[this.props.$refFn](this.context.vars);	
    	}else{
    		return null;
    	}
    }
    
    doChange(options){
   	 	this.setValue(this.getRefPath(), this.getRefPropName(), options.value, (value, oldValue) => {
   	 		this.fireEvent(BindComponent.EVENT_VALUE_CHANGE, {oldValue: oldValue , value: value, source: this});
   	 	});
    }
    
    onChange(evt){
    	this.doChange({value: evt.detail.value});
    }

    
    
    _parsePath(path){
    	var index = path.indexOf("."); 
   	 	if (index>0){
   	 		return {
   	 			compid: path.substr(0, index),
   	 			path: path.substr(index+1)
   	 		}
   	 	}else{
   	 		return null;
   	 	}
    }
    
    getValueByPath(path, prop){
    	if (path){
       	 	var info = this._parsePath(path);
       	 	if (info){
           	 	var data = this.page.comp(info.compid);
           	 	if (data){
           	 		var obj = data.getValueByPath(info.path);
           	 		if (obj){
           	 			return obj[prop];
           	 		}
           	 	}
       	 	}
    	}
    	
    	return null;
    }
    
    setValue(path, prop, value, callback){
    	this.beforeSetValue(path, prop, value, callback);
    	if (path){
       	 	var info = this._parsePath(path);
       	 	if (!info) return;
       	 	var data = this.page.comp(info.compid);
       	 	if (data){
       	 		var obj = data.getValueByPath(info.path);
       	 		if (obj){
       	 			if (obj[prop] !== value){
       	 				let oldVal = obj[prop];
       	 				obj[prop] = value;
       	 				callback && callback(value, oldVal);
       	 			}
       	 		}else{
       			 //throw new Error("找不到数据项" + path + "");
       	 		}
       	 	}else{
       		 //throw new Error("组件" + info.compid + "未定义");
       	 	}
    	}else{
    		callback && callback(value, undefined);
    	}
    }
    
    beforeSetValue(path, prop, value, callback){
    	
    }
}

BindComponent.EVENT_VALUE_CHANGE = "valuechange";
