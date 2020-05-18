import wx from '../../lib/base/wx';
/**
  	schema定义结构:
  	{
    	type: "array",
	    keyItems: "id"
    	items: {
	        type: "object",
	        props: {
	            id: {
	                type: "number",
					default: "", //默认值, 表达式
					required: { //必填
						expr: "",  //表达式
						msg: "", //提示信息
					}
					readonly: true, //只读, 表达式
					calculate: "", //计算规则, 表达式
					constraint: { //约束
						expr: "", //表达式
						msg: ""   //提示信息
					}
	            },...
	        }
	    } 
	}
	
	注：在编译阶段, schema中的所有表达式(默认值, 必填规则, 只读规则等等)转换成函数, 编译后的schema结构如下：
  输出schema:
  {
  	type: "array",
  	keyItems: "id",
  	items: {
  		type: "object",
  		props: {
  			id: {type: "string"},
  			firstName; {type: "string"},
  			lastName: {type: "string"},
  			fullName: {type: "string"},
  			prop1: {type: "recursiveSelf"},
  		},
  		//计算属性, userdata, key, path等相关的函数
  		fns: {
  			get fullName(){
  				return this.firstName + this.lastName;
  			},
  			get _userdata(){
  				return {
  					id: {type: "string"},
  					firstName: {type: "string"},
  					lastName: {type: "string"},
  					fullName: {type: "string"}
  				}
  			},
  			set _path(path){
  				if (!this.hasOwnProperty('_pathValue')){
			        	Object.defineProperty(this, '_pathValue', {
			            	enumerable: false,
          		       	writable: true,
               			configurable: true
           			});
  				}
  				this._pathValue = path; 
  			},
  			get _path(){
  				return this._pathValue;
  			}
  		}
  	}
  }	
*/


import {observable, extendObservable, autorun, toJS, observe, intercept} from  "../../lib/mobx/mobx-2.6.2.umd";
import UUID from "../../lib/base/uuid";
import _Date from "../../lib/base/date";

var SCHEMA_TYPES = {
	ARRAY: "array",
	OBJECT: "object", 
	STRING: "string",
	DATE: "date",
	TIME: "time",
	DATETIME: "datetime",
	DOUBLE: "double",
	FLOAT: "float",
	DECIMAL: "decimal",
	LONG: "long",
	INTEGER: "integer",
	RECURSIVESELF: "recursiveSelf"
}
var DEFAUTL_SCHEMA_TYPES = SCHEMA_TYPES.STRING;



function isObjectType(type){
	return type == SCHEMA_TYPES.OBJECT;
}

function isArrayType(type){
	return type == SCHEMA_TYPES.ARRAY;
}

function isRecursiveSelf(type){
	return type == SCHEMA_TYPES.RECURSIVESELF;
}

export function getDefaultValue(type){
	if (type == SCHEMA_TYPES.DOUBLE 
			|| type == SCHEMA_TYPES.FLOAT
			|| type == SCHEMA_TYPES.DECIMAL
			|| type == SCHEMA_TYPES.LONG
			|| type == SCHEMA_TYPES.INTEGER){
		return null;
	}else {
		return "";
	}
}


export default class Schema{
	constructor(id, schema, owner){
		this.id = id;
		this.schema = schema;
		this.schema.id = id;
		this.schemas = {};
		this.disposers = [];
		this.owner = owner;
		this.keyIndex = 0;
	}
	
	checkSchema(){
		if (!isArrayType(this.schema.type) & !isObjectType(this.schema.type)){
			throw new Error("schema定义失败, 原因：schema的根元素必须是array或object! schema: " + JSON.stringify(this.schema));
		}
	}
	
	init(schema){
		if (!schema) return ;
		if (schema.id){
			this.schemas[schema.id] = schema;
		}
		
		if (isArrayType(schema.type)){
			var items = schema.items;
			if (items && isObjectType(items.type)){
				this.init(items);
			}else{
				throw new Error("schema定义失败, 原因: 数组中的数据项必须是对象类型! schema: " + JSON.stringify(schema));
			}
		}else if (isObjectType(schema.type)){
			var props = schema.props || {}; 
			for (let prop in props){
				let val = props[prop];
				if (val){
					if (isObjectType(val.type) || isArrayType(val.type)){
						this.init(val);
					}
				}
			}
		}
	}
	
	buildObservable(data){
		data = data || (isArrayType(this.schema.type) ? [] : {});
		var obValue = observable(data);
		this.doBuildObservable(obValue, this.schema, this.schema.id + ".value");
		return obValue;
	}
	
	doBuildObservable(obValue, schema, path){
		this.addSysVar(obValue, schema);
		var type= schema.type;
		if (this.isCustomType(type)){
			throw new Error("schema不支持自定义类型");
		}else if (isArrayType(type)){
			this.doBuildArray(obValue, schema, path);
		}else if (isObjectType(type)){
			this.doBuildObject(obValue, schema, path);
		}
	}
	
	doBuildArray(obValue, schema, path){
		if (!obValue || !schema) return; //如果为空忽略不处理;
		this.addSysVar(obValue, schema);
		this.addPaginationVar(obValue, schema);
		
		var items = schema.items;
		for (let i=0; i<obValue.length; i++){
			if (!obValue[i]) continue;
			let filter = this.createArrayFilter(obValue[i], schema.keyItems);
			this.doBuildObservable(obValue[i], items, path + filter);
		}
		
		this.disposers[this.disposers.length] = intercept(obValue, (change) => {
			if ((change.type == 'update') && change.newValue){
				let copyData = JSON.parse(JSON.stringify(change.newValue));
		        change.newValue = observable(copyData);
		        let filter = this.createArrayFilter(change.newValue, schema.keyItems);
		        this.doBuildObservable(change.newValue, items, path + filter);
			} else if (change.added && change.added.length > 0) {
				for (let j = 0; j < change.added.length; j++) {
					if (!change.added[j]) continue;
		            let copyData = JSON.parse(JSON.stringify(change.added[j]));
		            change.added[j] = observable(copyData);
		            let changeItem = change.added[j];
		            let filter = this.createArrayFilter(changeItem, schema.keyItems);
		            this.doBuildObservable(changeItem, items, path + filter);
		        }
		    }
			return change;
		});
		
		/*
		//TODO 删除不允许阻止
		this.disposers[this.disposers.length] = observe(obValue, (change) => {
			if (change.removed && change.removed.length > 0){
				var items = [];
				for (let i=0; i<change.removed.length; i++){
					items.push(toJS(change.removed[i]));
				}
				var options = {parent: obValue, data: items};
				this.owner._deleteData(options);
			}
			return change;
		});
		*/
	}
	
	addPaginationVar(obValue, schema){
	    Object.defineProperty(obValue, '_userdata', {
	        enumerable: false,
	        writable: false,
	        configurable: true,
	        value: {total: observable(0), limit: schema.limit || 20, offset: schema.offset || 0, orderBy: schema.orderBy || []}
	    });
	    obValue.getUserData = function(){
	    	return this._userdata;
	    }
	}
	
	addStateVar(obValue){
		let v = "";
	    if (obValue.hasOwnProperty('_recoredState')){//如果有_recoredState先清除
	       v = obValue['_recoredState'];
	       delete obValue.$mobx.values['_recoredState'];
	       delete obValue['_recoredState'];
	    }
	    Object.defineProperty(obValue, '_recoredState', {
	        enumerable: true,
	        writable: true,
	        configurable: true,
	        value: v,
	    });
	    obValue.getState = function(){
	    	return this._recoredState;
	    };
	    obValue.setState = function(state){
    		this._recoredState = state;
	    };
	}
	
	addForceStateVar(obValue){
		if (obValue) {
			Object.defineProperty(obValue, '_fus_', {
				enumerable: false,
				writable: true,
				configurable: true,
				value: observable(0),
			});
		    extendObservable(obValue, {
		    	get _fus(){
		    		return this._fus_.get();
		        }
		    });

		    obValue.forceUpdate = function () {
		    	let f = this._fus_.get();
				this._fus_.set(f > 100000 ? 0 : f + 1);
			};
		}
	}	
	
	getNextKey(){
		return 'k' + (++this.keyIndex);
	}
	  
	createArrayFilter(item, key){
		var value = "";
		if (item.hasOwnProperty(key)){
			value = item[key];
		}else{
			value = this.getNextKey();
			item[key] = value; //TODO 强制设置主键, 侵入业务, 将来可以将key作为内部作用, 业务主键外部处理
			extendObservable(item, {get _key(){
				return value;
			}});
		}
		return "[@" + key + "=" + value + "]";
	}
	
	addSysVar(obValue, schema){
	    Object.defineProperty(obValue, '$page', {
	        enumerable: false,
	        writable: false,
	        configurable: true,
	        value: this.owner.page
	    });
	    Object.defineProperty(obValue, '$data', {
	        enumerable: false,
	        writable: false,
	        configurable: true,
	        value: this.owner
	    });
	    Object.defineProperty(obValue, '$schema', {
	        enumerable: false,
	        writable: false,
	        configurable: true,
	        value: schema
	    });
	}
	
	doBuildObject(obValue, schema, path){
		if (!obValue || !schema) return; //如果为空忽略不处理;
		this.addSysVar(obValue, schema);
	    extendObservable(obValue, {
			get _path(){
				return path;
			}
		});
	    
	    this.addStateVar(obValue);

	    //fns由编译时生成, _userdata, 计算属性不在此处(计算属性作为一般的属性使用, 生成后台交互数据时特殊处理)
		if (schema.fns){ 
			extendObservable(obValue, schema.fns);
		}
		
		//需在   ---fns由编译时生成, _userdata--- 处理后
		this.addForceStateVar(obValue);
		
		//当前只计算了自己这一层的默认值, 没有向里计算
		obValue.$initDefaultValue = () => {
			for (let prop in schema.props){
				let propDefine = schema.props[prop];
				let defaultFn = propDefine['default']; 
				if (defaultFn && (typeof defaultFn === 'function') && (obValue._$queryExtendProps().indexOf(prop) != -1)){
					obValue[prop] = defaultFn.call(obValue);
				}
			}			
		};

		var extendProps = [];
		for (let prop in schema.props){
			if (!obValue.hasOwnProperty(prop)){
				let ext = {};
				ext[prop] = null;
				extendObservable(obValue, ext);
				extendProps.push(prop);
			}
		}
		
		//记录扩展的属性，将来用于赋值默认值
		obValue._$queryExtendProps = function(){
			return extendProps;
		};
		
		for (let prop in schema.props){
			if (isArrayType(schema.props[prop].type)){
				this.doBuildArray(obValue[prop], schema[prop], path + "." + prop);
			}else if (isObjectType(schema.props[prop].type)){
				this.doBuildObject(obValue[prop], schema[prop], path + "." + prop);
			}else if (isRecursiveSelf(schema.props[prop].type)){
				if (!obValue[prop]){
					let ext = {};
					ext[prop] = [];
					extendObservable(obValue, ext);
				}
				//从根进行递归
				this.doBuildArray(obValue[prop], this.schema, path + "." + prop);
			}
		}

		//支持计算规则, 使用autorun实现
		if (schema.autorun){
			setTimeout(() => {
				for (let i = 0; i < schema.autorun.length; i++) {
					let autorunItem = schema.autorun[i];
					this.disposers[this.disposers.length] = autorun(function () {
						autorunItem(obValue);
					});
				}
			}, 1);
        }
		
		
		this.disposers[this.disposers.length] = intercept(obValue, (change) => {
			var type = null;
			if (obValue.$schema && obValue.$schema.props && obValue.$schema.props[change.name])
				type = obValue.$schema.props[change.name].type;
			if (change.type=="read"){
				change.value = this.toReadValue(change.value, type);
			}else{
				if (this.owner.canRecordChange() && (obValue.getState() !== "new") && (obValue.getState() !== "delete")){
					obValue.setState("edit");	
				}
				//从根进行递归
				if(obValue.$schema && obValue.$schema.props && obValue.$schema.props[change.name] && isRecursiveSelf(obValue.$schema.props[change.name].type)){
					change.newValue = this.doBuildArray(obValue[change.name], this.schema, obValue._path + "." + change.name);
				}else{
					change.newValue = this.toWriteValue(change.newValue, type);
				}

		        if (this.owner.hasListener(Schema.EVENT_VALUE_CHANGE)){
		            let evt = {};
		            let oldValue = obValue[change.name];
		            evt.source = this.owner;
		            evt.row = obValue;
		            evt.col = change.name;
		            evt.newValue = change.newValue;
		            evt.oldValue = oldValue;
		            this.owner.fireEvent(Schema.EVENT_VALUE_CHANGE, evt);
		            if (evt.newValue === oldValue){
		            	obValue.forceUpdate();
		            	return null;
		            } 
		            change.newValue = evt.newValue;
		          }
			}
			return change;
		});

		this.disposers[this.disposers.length] = observe(obValue, (change) => {
	        let evt = {};
	        evt.source = this.owner;
	        evt.row = obValue;
	        evt.col = change.name;
	        evt.newValue = change.newValue;
	        evt.oldValue = change.oldValue;
	        evt.value = change.newValue;
	        this.owner.fireEvent(Schema.EVENT_VALUE_CHANGED, evt);
	        evt.changedSource = this.owner;
	        evt.type = Schema.EVENT_VALUE_CHANGED;
	        evt.selfChanged = true;
	        this.owner.doDataChanged(evt);
	      });
	}
	
	toReadValue(value, type){
		var isNaNValue = false;
		if (typeof value == "string"){
			if (type==SCHEMA_TYPES.INTEGER || type==SCHEMA_TYPES.LONG){
				value = parseInt(value, 10);
				isNaNValue = isNaN(value);
			}else if (type==SCHEMA_TYPES.DOUBLE || type==SCHEMA_TYPES.FLOAT
					|| type==SCHEMA_TYPES.DECIMAL){
				value = parseFloat(value);
				isNaNValue = isNaN(value);
			}else if (type==SCHEMA_TYPES.DATE){
				//value = _Date.fromString(value, _Date.STANDART_FORMAT_SHOT);
				value = new Date(value); //日期时间使用ISO格式
				if (value){
					value.toString = date2string;
					value.toJSON = date2string; //可能会有问题
				}else{
					value = null;
				}
			}else if (type==SCHEMA_TYPES.TIME){
				var size = value.split(":").length;
				var format = "hh:mm:ss";
				if (size==2) format = "hh:mm";
				value = _Date.fromString(value, format);
				if (value){
					value.toString = time2string;
					value.toJSON = time2string; //可能会有问题
				}else{
					value = null;
				}
			}else if (type==SCHEMA_TYPES.DATETIME){
				//value = _Date.fromString(value, _Date.STANDART_FORMAT);
				value = new Date(value); //日期时间使用ISO格式
				if (value && (value.toString() !== "Invalid Date")){
					value.toString = datetime2string;
					value.toViewJSON = datetime2string;
					value.toJSON = datetime2string2; //可能会有问题
				}else{
					value = null;
				}
			}
		}

		if (value==null || value==undefined || isNaNValue){
			value = getDefaultValue(type);
		}
		return value;
	}
	
	toWriteValue(value, type){
		if (value instanceof Date){
			if (type==SCHEMA_TYPES.DATE){
				value = _Date.date2string(value);
			}else if (type==SCHEMA_TYPES.DATETIME){
				value = value.toISOString();
			}else if (type==SCHEMA_TYPES.TIME){
				value = _Date.time2string(value);
			}
		}
		return undefined!==value?value:null;
	}
	
	isCustomType(type){
		return type && (type.indexOf("#") === 0);
	}
	
	destroy(){
		for (let i=0; i<this.disposers.length; i++){
			this.disposers[i]();
		}
	}
}

var date2string = function(){
	return _Date.toString(this, _Date.STANDART_FORMAT_SHOT); 
};

var datetime2string = function(){
	return _Date.toString(this, _Date.DEFAULT_FORMAT1); 
};

//统一用ISO格式
var datetime2string2 = function () {
	//return _Date.toString(this, _Date.STANDART_FORMAT);
	return this.toISOString();
};

var time2string = function(){
	return _Date.toString(this, 'hh:mm:ss'); 
};


Schema.EVENT_VALUE_CHANGED = "valueChanged";
Schema.EVENT_VALUE_CHANGE = "valueChange";
Schema.EVENT_DATA_CHANGE = "dataChange";



