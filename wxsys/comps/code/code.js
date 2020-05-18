import wx from '../../lib/base/wx';
import WrapperComponent from "../wrapper/wrapper";
import regeneratorRuntime from './generator/runtime-module';


export default class Code extends WrapperComponent{
    constructor(page, id, props, context){
        super(page, id, props, context);
        this.params = this.props.params?JSON.parse(this.props.params):[];// {name,displayName,defaultValue}
     }
    
    param2Array(param) {
		var ret = [];
		param = param || {};
		 
		this.params.forEach(function(v,i) {
			ret.push(param.hasOwnProperty(v.name) ? param[v.name] : v.defaultValue);
		});
		return ret;
	}
	exec() {
		return this.page && (typeof this.page[this.id] == "function") ? this.page[this.id].apply(this.page, arguments) : undefined;
	}
	
    initOperation(){
    	super.initOperation();
   	 	var self = this;
	   	this.defineOperation('customOperation', {
	   		 label : "自定义操作",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : self.params,
	   		 method : function(args) {
	   			return self.exec.apply(self, self.param2Array(args));
	   		 }
	   	});
	   	this.defineOperation('exec', {
	   		 label : "执行",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : self.params,
	   		 method : function(args) {
	   			return self.exec.apply(self, self.param2Array(args));
	   		 }
	   	});
    }  	 
};


wx.comp = wx.comp || {};
wx.comp.Code = Code;
