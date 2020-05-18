import wx from './wx';
import {isObservableArray} from  "../mobx/mobx-2.6.2.umd";
import _Date from  "./date";
var toString = Object.prototype.toString;

export function isObject(value){
	var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
}



export function isArray(obj){
	return (toString.call(obj) === '[object Array]') 
		|| (obj instanceof Array)
		|| isObservableArray(obj);
}

export function isBoolean(value) {
	return typeof value === 'boolean';
}

export function isString(value){
	return toString.call(value) === '[object String]';
}

export function isFunction(value){
	return toString.call(value) === '[object Function]';
}

export function toArray(iterable, start, end) {
	if (!iterable || !iterable.length) {
		return [];
	}

	if (typeof iterable === 'string') {
		iterable = iterable.split('');
	}

	return Array.prototype.slice.call(iterable, start || 0, end || iterable.length);
}

export  function iif(condition,trueValue,falseValue){
	return condition?trueValue:falseValue;
}

export function arrayPushObj(obj){
	try
	{
		if(!obj){
			return [];
		}
		var _arr = [];
		_arr.push(obj);
		return _arr;
	}catch(e){
		console.log(e);
		return [];
	}
}

export function arrayPush(array,obj){
	try
	{
		if(!obj){
			return array;
		}
		if(Object.prototype.toString.call(array)!='[object Array]'){
			return array;
		}
		array.push(obj);
		return array;
	}catch(e){
		console.log(e);
		return array;
	}
}

export function arraySplice(array,obj){
	try
	{
		if(!obj){
			return array;
		}
		if(Object.prototype.toString.call(array)!='[object Array]'){
			return array;
		}
		for(var i=0,count=array.length;i<count;i++){
			if(array[i]==obj){
				array.splice(i,1);
				return array;
			}
		}
	}catch(e){
		console.log(e);
		return array;
	}
}

function isWindowRes(url){
	if (url.indexOf("?") !== -1){
		url = url.substr(0, url.indexOf("?"));
	}
	return (url.indexOf(".w") == (url.length-2));
}

// TODO url必须以$UI开头
export function toResUrl(url){
	if (!url || (url.indexOf(".") == -1)) return url;
	if (url.indexOf("$UI/") == "0"){
		url = url.substring(3);
	}
	
	if (isWindowRes(url)){
		var index = url.indexOf("?");
		var search = "";
		if (index !== -1){
			search = url.substr(index);
			url = url.substr(0, index);
		}
		url = url.substr(0, url.length-2) + search;
		return url;
	}else if (window && window.isMicroService) {
		let currentReactPage = getCurrentReactPage();
		let basePath = currentReactPage.props.basePath;
		let contextPath = currentReactPage.props.contextPath;
		return wx.App.baseUrl + "/" + basePath + "/" + contextPath + url;
	}else {
		return wx.App.resPath + url;
	}
}

export function hint(title, duration){
	wx.showToast({
		title: title,
		duration: duration,
		mask: true,
		icon: 'success'
	});
}

export function confirm(content, okFn, cancelFn, showCancel){
	wx.showModal({
		title: '提示',
		content: content || '',
		showCancel: showCancel,
		success: function(res) {
			if (res.confirm) {
				okFn && okFn();
		    } else if (res.cancel) {
		    	cancelFn && cancelFn();
		    }
		}
	});
}

// 增加数据相关函数
export function count(data){
	if(data && isFunction(data.count)) return data.count();
	else return 0;
}

export function sum(data,col){
	if(data && isFunction(data.sum)) return data.sum(col);
	else return 0;
}

export function avg(data,col){
	if(data && isFunction(data.avg)) return data.avg(col);
	else return 0;
}

export function min(data,col){
	if(data && isFunction(data.min)) return data.min(col);
	else return 0;
}

export function max(data,col){
	if(data && isFunction(data.max)) return data.max(col);
	else return 0;
}

export function total(data){
	if(data && isFunction(data.getTotal)) return data.getTotal();
	else return 0;
}

export function cloneJSON(obj, isTransformDate){
	if (obj){
		// 此处不处理日期格式，要求像在toJSON方法中自己处理完
		var ret = JSON.parse(JSON.stringify(obj));
		/*
		 * var ret = JSON.parse(JSON.stringify(obj, isTransformDate ?
		 * function(k, v){ if (typeof v == 'string' && (v.substr(-1, 1) == "Z") &&
		 * (v.indexOf("T")!=-1)) { try { v = new Date(v); return
		 * _Date.toString(v, _Date.DEFAULT_FORMAT1); } catch (e) { return v; }
		 * }else{ return v; } } : null));
		 */	
		return ret;
	}else{
		return obj;
	}
}

function _isEmptyValue(value) {
	return value === undefined || value === null || value === "";
}

function testNumber(val) {
	return _isEmptyValue(val) ? false : /^(([-+]?([0-9]+(\.[0-9]*)?)|(\.[0-9]+))([eE][-+]?[0-9]+)?|-?INF|NaN)$/.test(val);
}

function testInteger(val) {
	return _isEmptyValue(val) ? false : /^-?[0-9]\d*$/.test(val);
}

function testEmail(val) {
	return _isEmptyValue(val) ? false : /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(val);
}

function testMobile(val) {
	return _isEmptyValue(val) ? false : /^[1][0-9][0-9]{9}$/.test(val);
}

function testLength(val, min, max) {
	if (val === undefined || val === null) {
		if (min <= 0 && max >= min) {
			return true;
		} else {
			return false;
		}
	}
	if (val === "") {
		if (min <= 1 && max >= min) {
			return true;
		} else {
			return false;
		}
	}
	return (typeof (val) === 'string' && (min === -1 || val.length >= min) && (max === -1 || val.length <= max));
}

var Util = {};
Util.isObject = isObject;
Util.isArray = isArray;
Util.isBoolean = isBoolean;
Util.isString = isString;
Util.isFunction = isFunction;
Util.toArray = toArray;
Util.arrayPushObj = arrayPushObj;
Util.arrayPush = arrayPush;
Util.arraySplice = arraySplice;
Util.iif = iif;
Util.hint = hint;
Util.confirm = confirm;
Util.toResUrl = toResUrl;

Util.testNumber = testNumber;
Util.testInteger = testInteger;
Util.testEmail = testEmail;
Util.testMobile = testMobile;
Util.testLength = testLength;

Util.count = count;
Util.sum = sum;
Util.avg = avg;
Util.min = min;
Util.max = max;
Util.total = total;
Util.cloneJSON = cloneJSON;

export default Util;
