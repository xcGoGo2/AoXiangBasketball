import wx from './wx';
import Eventable from "./eventable";

class Operation extends Eventable{
	constructor(owner, config){
		super();
		this.owner = owner;
		this.label = "";
		this.icon = "";
		this.enable = true;
		this.visible = true;
		Object.assign(this, config);
		if (this.init && (typeof this.init === "function")){
			this.init();
		}
	}
	
	getLabel(){
		return this.label;
	}
	
	setLabel(){
		if (this.label != value) {
			var oldValue = this.label;
			this.label = value;
			this.fireEvent('change', {
				property : 'label',
				oldValue : oldValue,
				value : value
			});
		}
	}
	
	getIcon(){
		return this.icon;
	}
	
	setIcon(value) {
		if (this.icon != value) {
			var oldValue = this.icon;
			this.icon = value;
			this.fireEvent('change', {
				property : 'icon',
				oldValue : oldValue,
				value : value
			});
		}
	}

	getEnable() {
		return (!this.getInnerEnable || this.getInnerEnable()) && !!this.enable;
	}

	setEnable(value) {
		if (value !== false)
			value = true;
		if (this.enable != value) {
			this.enable = value;
			value = this.getEnable();
			this.fireEvent('change', {
				property : 'enable',
				oldValue : !value,
				value : value
			});
		}
	}
	
	getVisible(){
		return this.visible;
	}

	setVisible(value) {
		if (value !== false)
			value = true;
		if (this.visible != value) {
			this.visible = value;
			this.fireEvent('change', {
				property : 'visible',
				oldValue : !value,
				value : value
			});
		}
	}

	//返回值强制转换成promise
	execute(args, ctx) {
		var ret = null;
		if (this.enable) 
			ret = this.method(args, ctx);
		if (ret instanceof Promise || (ret && (typeof ret.then === "function") && (typeof ret['catch']==="function"))){
			return ret;
		}else{
			return new Promise((resolve, reject) => {
				resolve(ret);
			});
		}
	}
}


export default class Operational extends Eventable{
	constructor(config){
		super();
		this.$op_list = {};
	}
	
	
	//后代类超载initOperation方法, 用来定义自己的操作
	initOperation(){}
	
	//定制操作, 如果已存在修改以有值,如果不存则创建新的操作
	customOperation(ops) {
		for ( let name in ops) {
			if (ops.hasOwnProperty(name))
				this.defineOperation(name, ops[name]);
		}
	}
	
	hasOperation(name) {
		return !!this.$op_list[name];
	}
	
	getOperation(name) {
		return this.$op_list[name];
	}
	
	onOpChange(name, fn, scope, options) {
		if (this.$op_list[name])
			this.$op_list[name].on('change', fn, scope, options);
	}
	
	unOpChange(name, fn, scope) {
		if (this.$op_list[name]) {
			this.$op_list[name].un(name, fn, scope);
		}
	}
	
	defineOperation(name, config) {
		if (this.$op_list[name]) {
			// 覆盖已有的操作
			Object.assign(this.$op_list[name], config);
		} else {
			this.$op_list[name] = new Operation(this, config);
		}
		return this.$op_list[name];
	}
	
	executeOperation(name, args, ctx) {
		if (this.$op_list[name])
			return this.$op_list[name].execute(args, ctx);
	}
	
	setOperationEnable(name, value) {
		this.$op_list[name] && this.$op_list[name].setEnable(value);
	}

	getOperationEnable(name) {
		return this.$op_list[name] && this.$op_list[name].getEnable();
	}

	setOperationVisible(name, value) {
		this.$op_list[name] && this.$op_list[name].setVisible(value);
	}

	getOperationVisible(name) {
		return this.$op_list[name] && this.$op_list[name].getVisible();
	}

	setOperationAllEnable(value) {
		for ( var i in this.$op_list) {
			if (this.$op_list.hasOwnProperty(i)){
				this.$op_list[i].setEnable(value);	
			}
		}
	}

	setOperationLabel(name, value) {
		this.$op_list[name] && this.$op_list[name].setLabel(value);
	}

	getOperationLabel(name) {
		return this.$op_list[name] && this.$op_list[name].getLabel();
	}

	setOperationIcon(name, value) {
		this.$op_list[name] && this.$op_list[name].setIcon(value);
	}

	getOperationIcon(name) {
		return this.$op_list[name] && this.$op_list[name].getIcon();
	}
	
}
