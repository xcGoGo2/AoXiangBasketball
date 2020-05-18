import wx from '../base/wx';
export default {
	abs : function(number) {
		return Math.abs(number);
	},
	ceil : function(number) {
		return Math.ceil(number);
	},
	floor : function(number) {
		return Math.floor(number);
	},
	max : function(...numbers) {
		return Math.max(...numbers);
	},
	min : function(...numbers) {
		return Math.min(...numbers);
	},
	round : function(number) {
		return Math.round(number);
	},
	sqrt : function(number) {
		return Math.sqrt(number);
	},
	roundDecimal : function(number,i){
		i = Math.abs(i);
		let z = Math.pow(10,i);
		return Math.round(number * z) / z;
	}
};
