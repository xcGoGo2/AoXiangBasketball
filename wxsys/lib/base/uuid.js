import wx from './wx';
export default class UUID{
	constructor(){
		this.id = UUID.createUUID();
	}
	
	valueOf(){
		return this.id;
	}
	
	toString(){
		return this.id;
	}
	
	static createUUID(){
		var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
		var dc = new Date();
		var t = dc.getTime() - dg.getTime();
		//var h = '-';
		var tl = this._getIntegerBits(t, 0, 31);
		var tm = this._getIntegerBits(t, 32, 47);
		var thv = this._getIntegerBits(t, 48, 59) + '1'; // version 1,
		// security
		// version is 2
		var csar = this._getIntegerBits(this._rand(4095), 0, 7);
		var csl = this._getIntegerBits(this._rand(4095), 0, 7);

		var n = this._getIntegerBits(this._rand(8191), 0, 7)
				+ this._getIntegerBits(this._rand(8191), 8, 15) + this._getIntegerBits(this._rand(8191), 0, 7)
				+ this._getIntegerBits(this._rand(8191), 8, 15) + this._getIntegerBits(this._rand(8191), 0, 15); // this
																													// last
		// number
		// is two octets
		// long
		// return tl + h + tm + h + thv + h + csar + csl + h + n;
		return tl + tm + thv + csar + csl + n;
	}

	static _getIntegerBits(val, start, end) {
		var base16 = this._returnBase(val, 16);
		var quadArray = [];
		var quadString = '';
		var i = 0;
		for (i = 0; i < base16.length; i++) {
			quadArray.push(base16.substring(i, i + 1));
		}
		for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
			if (!quadArray[i] || quadArray[i] === '')
				quadString += '0';
			else
				quadString += quadArray[i];
		}
		return quadString;
	}

	static _returnBase(number, base) {
		return (number).toString(base).toUpperCase();
	}

	static _rand(max) {
		return Math.floor(Math.random() * (max + 1));
	}
}


