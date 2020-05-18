import wx from './wx';
var _String = {};

_String.trim = function(str) {
	return (str || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
};

_String.splitAndTrim = function(str, spliter) {
	if(!str) return [];
	var result = str.split(spliter);
	for ( var i=0; i<result.length; i++) {
		result[i] = _String.trim(result[i]);
	}
	return result;
};

_String.format = function() {
	if (arguments.length === 0)
		return null;
	var str = arguments[0];
	for ( var i = 1; i < arguments.length; i++) {
		var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
		str = str.replace(re, arguments[i]);
	}
	return str;
};

_String.toStr = function(v){
	return v===null || v===undefined?"":String(v);
};

_String.toInt = function(str, defaultValue) {
	var result = parseInt(str, 10);
	return (isNaN(result)) ? defaultValue : result;
};

_String.toFloat = function(str, defaultValue) {
	var result = parseFloat(str);
	return (isNaN(result)) ? defaultValue : result;
};

_String.fromFloat = function(num, i) {
	i = Math.abs(i);
	if(i>0){
		num = ''+num;
		let ipos = num.indexOf('.');
		let decimal = '';
		let int = num;
		if(ipos>=0){
			decimal = num.substring(ipos+1);
			int = num.substring(0,ipos);
		}
		if(decimal.length<i){
			let ret = int + '.' + decimal;
			return _String.zeros(ret,ret.length+(i-decimal.length),true);	
		}else if(decimal.length===i){
			return int + '.' + decimal;
		}else{
			num = new Number(num);
			return num.toFixed(i);
		}
	}else{
		return ''+Math.round(num);
	}
};

_String.zeros = function(value, length, right) {
	var res = "" + (null===value||undefined===value?'':value);
	for (; res.length < length; res = right ? res + '0' : '0' + res) {
	}
	return res;
};

_String.camelize = function(str, lowFirstLetter) {
	if (!str) return str;
	str = str.toLowerCase();
	return str.charAt(0).toUpperCase() + str.substring(1);
};

_String.substring = function(str,start,stop){
	return (typeof(str)==='string' && str)?str.substring(start,stop):"";
};

export default _String;
