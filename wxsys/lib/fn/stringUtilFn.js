import wx from '../base/wx';
import string from "../base/string";

//如果数字含有小数部分，那么可以将小数部分单独取出
//将小数部分的数字转换为字符串的方法：
let chnNumChar = [ "零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖" ];
let chnUnitSection = [ "", "万", "亿", "万亿", "亿亿" ];
let chnUnitChar = [ "", "拾", "佰", "仟" ];
let chnMoneyChar = [ "元", "角", "分" ];

function numToChn(num, money) {
	let index = num.toString().indexOf(".");
	if (index != -1) {
		let str = num.toString().slice(index);
		let a = money?"元":"点";
		for (let i = 1; i < str.length; i++) {
			a += (chnNumChar[parseInt(str[i])] + chnMoneyChar[i]);
			if(i>=2) break;
		}
		return a;
	} else {
		return money?"元整":"";
	}
}

//定义在每个小节的内部进行转化的方法，其他部分则与小节内部转化方法相同
function sectionToChinese(section) {
	let str = '', chnstr = '', zero = false, count = 0; //zero为是否进行补零， 第一次进行取余由于为个位数，默认不补零
	while (section > 0) {
		let v = section % 10; //对数字取余10，得到的数即为个位数
		if (v == 0) { //如果数字为零，则对字符串进行补零
			if (zero) {
				zero = false; //如果遇到连续多次取余都是0，那么只需补一个零即可
				chnstr = chnNumChar[v] + chnstr;
			}
		} else {
			zero = true; //第一次取余之后，如果再次取余为零，则需要补零
			str = chnNumChar[v];
			str += chnUnitChar[count];
			chnstr = str + chnstr;
		}
		count++;
		section = Math.floor(section / 10);
	}
	return chnstr;
}


export default {
	isObjectStorageNull : function(objectStorage){
		if(!objectStorage || objectStorage == "[]"){
			return true;
		}else{
			return false;
		}
	},
	isBlank : function(seq){
		return !seq;
	},
	isNotBlank : function(seq){
		return !this.isBlank(seq);
	},
	capitalize : function(input){
		return string.camelize(input);
	},
	unCapitalize : function(input){
		if(typeof(input)!=='string') return "";
		input = input.toUpperCase();
		return input.charAt(0).toLowerCase() + input.substring(1);
	},
	toLowercase : function(input){
		if(typeof(input)!=='string') return "";
		return input.toLowerCase();
	},
	toUpperCase : function(input){
		if(typeof(input)!=='string') return "";
		return input.toUpperCase();
	},
	contains : function(seq,searchChar){
		if(typeof(seq)!=='string') return false;
		return seq.includes(searchChar);
	},
	indexOf : function(seq,searchChar){
		if(typeof(seq)!=='string') return -1;
		return seq.indexOf(searchChar);
	},
	lastIndexOf : function(seq,searchChar){
		if(typeof(seq)!=='string') return -1;
		return seq.lastIndexOf(searchChar);
	},
	endsWith : function(seq,suffix){
		if(typeof(seq)!=='string') return false;
		return seq.endsWith(suffix);
	},
	startsWith : function(seq,prefix){
		if(typeof(seq)!=='string') return false;
		return seq.startsWith(prefix);
	},
	isNumber : function(seq){
		return seq!==undefined && !isNaN(seq);
	},
	replace : function(seq,searchString,replacement,first){
		if(typeof(seq)!=='string') return seq;
		if(!searchString) return seq;
		let str = seq;
		let ret = [];
		let searchStringLen = searchString.length;
		//增加表达式和画代码中易用性，通过循环实现
		for(let i = str.indexOf(searchString);i>=0;i = str.indexOf(searchString)){
			ret.push(str.substring(0,i) + replacement);
			str = str.substring(i+searchStringLen);
			if(first) break;//不是全部替换只做一次
		}
		str && ret.push(str);
		return ret.join('');
		//return seq.replace(searchString,replacement); 
	},
	//定义整个数字全部转换的方法，需要依次对数字进行10000为单位的取余，然后分成小节，按小节计算，当每个小节的数不足1000时，则需要进行补零
	trans2Chinese: function(num, isMoney) {
		if(typeof(num)!=='number') return "";
		isMoney = false!==isMoney;
		let a = numToChn(num, isMoney);
		num = Math.floor(num);
		let unitPos = 0;
		let strIns = '', chnStr = '';
		let needZero = false;

		if (num === 0) {
			return chnNumChar[0];
		}
		while (num > 0) {
			let section = num % 10000;
			if (needZero) {
				chnStr = chnNumChar[0] + chnStr;
			}
			strIns = sectionToChinese(section);
			strIns += (section !== 0) ? chnUnitSection[unitPos] : chnUnitSection[0];
			chnStr = strIns + chnStr;
			needZero = (section < 1000) && (section > 0);
			num = Math.floor(num / 10000);
			unitPos++;
		}

		return chnStr + a;
	}
};
