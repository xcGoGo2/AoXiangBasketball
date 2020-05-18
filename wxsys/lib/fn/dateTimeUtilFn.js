import wx from '../base/wx';
var _Date = {};
	_Date._msForSecond = 1000;
	_Date._msForMinute = 60000;
	_Date._msForHour = 3600000;
	_Date._msForDay = 86400000;
	_Date._msForWeek = 86400000 * 7;
var diff = function(start, end, interval) {
		switch (interval) {
		case 's':
			return parseInt((end - start) / _Date._msForSecond, 10);
		case 'n':
			return parseInt((end - start) / _Date._msForMinute, 10);
		case 'h':
			return parseInt((end - start) / _Date._msForHour, 10);
		case 'd':
			return parseInt((end - start) / _Date._msForDay, 10);
		case 'w':
			return parseInt((end - start) / _Date._msForWeek, 10);
		case 'm':
			return (end.getMonth() + 1) + ((end.getFullYear() - start.getFullYear()) * 12) - (start.getMonth() + 1);
		case 'y':
			return end.getFullYear() - start.getFullYear();
		}
	};
	
export default {
	now:function(){
		return new Date();
	},
	parse:function(millis){
        return new Date(millis);
    },
	getFullYear:function(date){
		return date.getFullYear();
	},
	getMonth:function(date){
		return date.getMonth() + 1;
	},
	getDay:function(date){
		return date.getDay();
	},
	getDate:function(date){
		return date.getDate();
	},
	getHour:function(date){
		return date.getHours();
	},
	getMinutes:function(date){
		return date.getMinutes();
	},
	getSeconds:function(date){
		return date.getSeconds();
	},
	getTime:function(date){
		return date.getTime();
	},
	setFullYear:function(date,years){
		return new Date(date.setFullYear(years));
	},
	setMonth:function(date,month){
		return new Date(date.setMonth(month-1));
	},
	setDate:function(date,day){
		return new Date(date.setDate(day));
	},
	setHours:function(date,hoursValue){
		return new Date(date.setHours(hoursValue));
	},
	setMinute:function(date,minutes){
		return new Date(date.setMinutes(minutes));
	},
	setSeconds:function(date,seconds){
		return new Date(date.setSeconds(seconds));
	},
	plusYears:function(date,years){
		let fullYear = date.getFullYear();
		return new Date(date.setFullYear(fullYear+years));
	},
	plusMonths:function(date,month){
		let currentMonth = date.getMonth();
		return new Date(date.setMonth(currentMonth + month));
	},
	plusHours:function(date,hours){
		let currentHours = date.getHours();
		return new Date(date.setHours(currentHours + hours));
	},
	plusDates:function(date,dates){
		let currentDay = date.getDate();
		return new Date(date.setDate(currentDay + dates));
	},
	plusMinutes:function(date,minutes){
		let currentMinutes = date.getMinutes();
		return new Date(date.setMinutes(currentMinutes + minutes));
	},
	plusSeconds:function(date,seconds){
		let currentSeconds = date.getSeconds();
		return new Date(date.setSeconds(currentSeconds + seconds)); 
	},
	plus:function(date,duration){
		let currentTimes = date.getTime();
		return new Date(currentTimes + duration);
	},
	fromNowYears:function(date){
		return this.yearsBetween(date,new Date());
	},
	fromNowMonths:function(date){
		return this.monthsBetween(date,new Date());
	},
	fromNowDays:function(date){
		return this.daysBetween(date,new Date());
	},
	fromNowWeeks:function(date){
		return this.monthsBetween(date,new Date());
	},
	fromNowHours:function(date){
		return this.hoursBetween(date,new Date());
	},
	fromNowMinutes:function(date){
		return this.minutesBetween(date,new Date());
	},
	fromNowSeconds:function(date){
		return this.secondsBetween(date,new Date());
	},
	yearsBetween:function(start,end){
		return diff(start,end,"y");
	},
	monthsBetween:function(start,end){
		return diff(start,end,"m");
	},
	daysBetween:function(start,end){
		return diff(start,end,"d");
	},
	hoursBetween:function(start,end){
		return diff(start,end,"h");
	},
	minutesBetween:function(start,end){
		return diff(start,end,"n");
	},
	secondsBetween:function(start,end){
		return diff(start,end,"s");
	}
}
