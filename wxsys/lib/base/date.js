import wx from './wx';
var _Date = {};
_Date._msForSecond = 1000;
_Date._msForMinute = 60000;
_Date._msForHour = 3600000;
_Date._msForDay = 86400000;// 24*60*60*1000
_Date._msForWeek = 86400000 * 7;

let serverInterval = 0;
//获取服务端和本地时间差

_Date.initServerDate = function(){
	let serverSysDateUrl = ((wx.App&&wx.App.baseUrl)||"") + "/dbrest/sysdate";
	let option = {
			url : serverSysDateUrl,
			method : "GET",
			data : {t:(new Date()).getTime()}
	};
	option.complete = function(res){
		if(res.header && (res.header.date || res.header.Date)){
			let t = new Date(res.header.date || res.header.Date);
			serverInterval = t.getTime() - (new Date()).getTime();
		}
	};
	wx.request(option);
};

_Date.getServerDatetime = function(){
	let t = (new Date()).getTime();
	return new Date(t + serverInterval);
};

_Date.isLeapYear = function(date) {
	var y = date instanceof Date?date.getFullYear():date;
	return (0 === y % 4 && ((y % 100 !== 0) || (y % 400 === 0)));
};

var _full = function(str, ch, count, isLeft) {
	while (str.length < count)
		if (isLeft)
			str = ch + str;
		else
			str = str + ch;
	return str;
};

_Date.fromString = function(str, format) {
	if(str instanceof Date) return str;
	var pattern = format.replace(/(yyyy)/g, "([0-9]{4})").replace(/(yy)|(MM)|(dd)|(hh)|(mm)|(ss)/g, "([0-9]{2})").replace(/[Mdhms]/g, "([0-9]{1,2})")
			.replace(/(fff)/g, "([0-9]{1,3})");

	var getIndex = function(expr1, expr2) {
		var index = format.indexOf(expr1);
		if (index == -1)
			index = format.indexOf(expr2);
		return index;
	};

	var today = new Date();
	var returnDate;
	if (new RegExp(pattern).test(str)) {
		var yPos = getIndex("yyyy", "yy");
		var mPos = getIndex("MM", "M");
		var dPos = getIndex("dd", "d");
		var hPos = getIndex("hh", "h");
		var miPos = getIndex("mm", "m");
		var sPos = getIndex("ss", "s");
		var fPos = getIndex("fff");
		var data = {
			y : 0,
			m : 0,
			d : 0,
			h : 0,
			mi : 0,
			s : 0,
			f : 0
		};

		var pos = new Array(yPos + ",y", mPos + ",m", dPos + ",d", hPos + ",h", miPos + ",mi", sPos + ",s", fPos + ",f").sort(function(a, b) {
			a = parseInt(a.split(",")[0], 10);
			b = parseInt(b.split(",")[0], 10);
			return a == b ? 0 : (a > b ? 1 : -1);
		});

		var tmpIndex = 0;
		var newPos = [];
		for ( var i = 0; i < pos.length; i++) {
			if (parseInt(pos[i].split(",")[0], 10) != -1) {
				newPos[tmpIndex] = pos[i];
				tmpIndex++;
			}
		}

		var m = str.match(pattern);
		for (i = 1; i < m.length; i++) {
			if (i === 0)
				return;
			var flag = newPos[i - 1].split(',')[1];
			data[flag] = m[i];
		}

		data.y = data.y || today.getFullYear();
		data.d = data.d || today.getDate();
		if (data.f !== 0)
			data.f = _full(data.f, "0", 3, false);

		if (data.y.toString().length == 2)
			data.y = parseInt("20" + data.y, 10);
		data.m -= 1;
		returnDate = new Date(data.y, data.m, data.d, data.h, data.mi, data.s, data.f);
	}

	return returnDate;
};

_Date.DEFAULT_FORMAT_SHOT = "yyyy/MM/dd";
_Date.DEFAULT_FORMAT = "yyyy/MM/dd hh:mm:ss";
_Date.DEFAULT_FORMAT1 = "yyyy-MM-dd hh:mm:ss";
_Date.STANDART_FORMAT_SHOT = "yyyy-MM-dd";
_Date.STANDART_FORMAT = "yyyy-MM-ddThh:mm:ss.fffZ";
_Date.STANDART_TIME_FORMAT = "hh:mm:ss.fff";

_Date.toString = function(dateTime, formatStr) {
	if(!(dateTime instanceof Date)) return '';
	formatStr = formatStr ? formatStr : this.DEFAULT_FORMAT;
	var year = dateTime.getFullYear();
	var month = dateTime.getMonth() + 1;
	var date = dateTime.getDate();
	var houres = dateTime.getHours();
	var minutes = dateTime.getMinutes();
	var seconds = dateTime.getSeconds();
	var milliseconds = dateTime.getMilliseconds();
	milliseconds = _full(milliseconds + "", "0", 3, true);
	return formatStr.replace(/yyyy|YYYY/, year).replace(/yy|YY/, (year % 100) > 9 ? (year % 100).toString() : ('0' + (year % 100))).replace(/MM/,
			month > 9 ? month.toString() : '0' + month).replace(/M/g, month).replace(/dd|DD/, date > 9 ? date.toString() : '0' + date).replace(
			/d|D/g, date).replace(/hh|HH/, houres > 9 ? houres.toString() : '0' + houres).replace(/h|H/g, houres).replace(/mm/,
			minutes > 9 ? minutes.toString() : '0' + minutes).replace(/m/g, minutes).replace(/ss|SS/,
			seconds > 9 ? seconds.toString() : '0' + seconds).replace(/s|S/g, seconds).replace(/fff/g, milliseconds);
};

_Date.UNIT_YEAR = "y";
_Date.UNIT_MONTH = "m";
_Date.UNIT_QUARTER = "q";
_Date.UNIT_WEEK = "w";
_Date.UNIT_DAY = "d";
_Date.UNIT_HOUR = "h";
_Date.UNIT_MINUTE = "n";
_Date.UNIT_SECOND = "s";

_Date.increase = function(datetime, num, interval) {
	datetime = (typeof datetime == 'string') ? this.fromString(datetime) : datetime;
	interval = (typeof interval == 'undefined') ? 'd' : interval;
	switch (interval) {
	case 's':
		return new Date(Date.parse(datetime) + (this._msForSecond * num));
	case 'n':
		return new Date(Date.parse(datetime) + (this._msForMinute * num));
	case 'h':
		return new Date(Date.parse(datetime) + (this._msForHour * num));
	case 'd':
		return new Date(Date.parse(datetime) + (this._msForDay * num));
	case 'w':
		return new Date(Date.parse(datetime) + (this._msForWeek * num));
	case 'm':
		return new Date(datetime.getFullYear(), (datetime.getMonth()) + num, datetime.getDate(), datetime.getHours(), datetime.getMinutes(),
				datetime.getSeconds());
	case 'q':
		return new Date(datetime.getFullYear(), (datetime.getMonth()) + num * 3, datetime.getDate(), datetime.getHours(), datetime.getMinutes(),
				datetime.getSeconds());
	case 'y':
		return new Date((datetime.getFullYear() + num), datetime.getMonth(), datetime.getDate(), datetime.getHours(), datetime.getMinutes(),
				datetime.getSeconds());
	}
};

_Date.decrease = function(datetime, num, interval) {
	datetime = (typeof datetime == 'string') ? this.fromString(datetime) : datetime;
	interval = (typeof interval == 'undefined') ? 'd' : interval;
	switch (interval) {
	case 's':
		return new Date(Date.parse(datetime) - (this._msForSecond * num));
	case 'n':
		return new Date(Date.parse(datetime) - (this._msForMinute * num));
	case 'h':
		return new Date(Date.parse(datetime) - (this._msForHour * num));
	case 'd':
		return new Date(Date.parse(datetime) - (this._msForDay * num));
	case 'w':
		return new Date(Date.parse(datetime) - (this._msForWeek * num));
	case 'm':
		return new Date(datetime.getFullYear(), (datetime.getMonth()) - num, datetime.getDate(), datetime.getHours(), datetime.getMinutes(),
				datetime.getSeconds());
	case 'q':
		return new Date(datetime.getFullYear(), (datetime.getMonth()) - num * 3, datetime.getDate(), datetime.getHours(), datetime.getMinutes(),
				datetime.getSeconds());
	case 'y':
		return new Date((datetime.getFullYear() - num), datetime.getMonth(), datetime.getDate(), datetime.getHours(), datetime.getMinutes(),
				datetime.getSeconds());
	}
};

_Date.diff = function(start, end, interval) {
	start = (typeof start == 'string') ? this.fromString(start) : start;
	end = (typeof end == 'string') ? this.fromString(end) : end;
	interval = (typeof interval == 'undefined') ? 'd' : interval;
	switch (interval) {
	case 's':
		return parseInt((end - start) / this._msForSecond, 10);
	case 'n':
		return parseInt((end - start) / this._msForMinute, 10);
	case 'h':
		return parseInt((end - start) / this._msForHour, 10);
	case 'd':
		return parseInt((end - start) / this._msForDay, 10);
	case 'w':
		return parseInt((end - start) / this._msForWeek, 10);
	case 'm':
		return (end.getMonth() + 1) + ((end.getFullYear() - start.getFullYear()) * 12) - (start.getMonth() + 1);
	case 'q':
		return parseInt(this.diff(start, end, 'm') / 3, 10);
	case 'y':
		return end.getFullYear() - start.getFullYear();
	}
};

_Date.between = function(date1, date2) {
	return Math.abs(this.diff(date1, date2));
};

function trim(str){
	return (str || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");
}

// todo: md 需要重构
// 如果格式满足YYYY-(/)MM-(/)DD或YYYY-(/)M-(/)DD或YYYY-(/)M-(/)D或YYYY-(/)MM-(/)D就替换为''
// 数据库中，合法日期可以是:YYYY-MM/DD(2003-3/21),数据库会自动转换为YYYY-MM-DD格式
_Date.isValid = function(str) {
	str = trim(str);
	if (str === '')
		return false;
	var reg = /[\d]{ 4,4 }[\-\/]{ 1 }[\d]{ 1,2 }[\-\/]{ 1 }[\d]{ 1,2 }/g;
	if (str.replace(reg, '') === '') {
		var t = new Date(str.replace(/\-/g, '/'));
		var ar = str.split(new RegExp("[-/:]"));
		return (ar[0] != t.getYear() || ar[1] != t.getMonth() + 1 || ar[2] != t.getDate()) ? false : true;
	}
	return false;
};

_Date.MaxDay = function(year, month) {
	if (month==1||month==3||month==5||month==7||month==8||month==10||month==12) {
		return 31;
	} else if (month==4||month==6||month==9||month==11) {
		return 30;
	} else if (this.isLeapYear(year)) {
		return 29;
	} else {
		return 28;
	}
};

_Date.date2string = function(v){
	return v instanceof Date ? _Date.toString(v, _Date.STANDART_FORMAT_SHOT) : v;
};

_Date.time2string = function(v){
	return v instanceof Date ? _Date.toString(v, _Date.STANDART_TIME_FORMAT) : v;
};

_Date.datetime2string = function(v){
	return v instanceof Date ? _Date.toString(v, _Date.STANDART_FORMAT) : v;
};

_Date.now = function(){
	return new Date();
};

_Date.getFirstDay = function(date){
	if(!date)
		date = new Date();
	if("string" == typeof(date)){
		date = _Date.fromString(date, _Date.STANDART_FORMAT_SHOT);
	}
	date.setDate(1);
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);

	return date;
};

_Date.getLastDay = function(date){
	if(!date)
		date = new Date();
	if("string" == typeof(date)){
		date = _Date.fromString(date, _Date.STANDART_FORMAT_SHOT);
	}
	date = _Date.increase(date,1,'m');
	date.setDate(1);
	date = _Date.decrease(date,1,'d');
	date.setHours(23);
	date.setMinutes(59);
	date.setSeconds(59);
	date.setMilliseconds(999);
	
	return date;
};

/*
//解决JSON.stringify日期时间时区的问题, 统一用ISO格式;
使用插件后，不允许重写toJSON, Date的默认toJSON就是toISOString
Date.prototype.toJSON = function () { 
	return this.toISOString();
}
*/

export default _Date;


