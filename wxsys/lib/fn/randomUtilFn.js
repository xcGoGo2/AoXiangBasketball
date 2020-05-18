import wx from '../base/wx';
var randomWord = function(randomFlag, hasNum,min, max) {
		let str = "";
		let range = min;
		let pos;
		const arr = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
				'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];
		const arr1 = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
						'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];
		// 随机产生
		if (randomFlag) {
			range = Math.round(Math.random() * (max - min)) + min;
		}
		if(hasNum){
			for (let i = 0; i < range; i++) {
				pos = Math.round(Math.random() * (arr.length - 1));
				str += arr[pos];
			}
		}else{
			for (let i = 0; i < range; i++) {
				pos = Math.round(Math.random() * (arr1.length - 1));
				str += arr1[pos];
			}
		}
		return str;
	};
export default {
		randomInt : function(count) {
			return parseInt(this.random() * Math.pow(10,count));
		},
		random : function() {
			return Math.random();
		},
		randomString : function(count) {
			return randomWord(false,true,count);
		},
		randomAlphabetic : function(count) {
			return randomWord(false,false,count);
		},
		randomNumber : function(count) {
			return this.randomInt(count) + "";
		}
	};
