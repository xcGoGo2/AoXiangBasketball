import wx from '../base/wx';
import base64 from "../base/base64";
import MD5 from "./md5";
export default {
	md5:function(input){
		return new MD5().hex_md5(input);
	},
	sha1:function(input){
		return new MD5().hex_md5(input);
	},
	base64:function(input){
		return base64.encode(input);
	},
	decodeBase64 : function(input){
		return base64.decode(input);
	}
};
