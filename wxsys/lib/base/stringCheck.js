import wx from './wx';
var StringCheck = {
	isPhoneNumber : function(string) {
		var phoneReg = /(^1[3|4|5|7|8]\d{9}$)|(^09\d{8}$)/;
		return phoneReg.test(string);
	},
	isEmail : function(string) {
		var emaelReg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
		return emaelReg.test(string);
	},
	isIdNumber : function(string) {
		var idReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
		return idReg.test(string);
	},
}

export default StringCheck;
