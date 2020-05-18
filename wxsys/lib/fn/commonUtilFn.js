import wx from '../base/wx';
import string from "../base/string";
export default {
		parseInt : function(str,defaultValue){
			return string.toInt(str,defaultValue);
		},
		parseFloat : function(str,defaultValue){
			return string.toFloat(str,defaultValue);
		}
	};
