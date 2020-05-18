import wx from '../base/wx';
export default {
	contains:function(array,ele){
		return array?array.indexOf(ele)!=-1:false;
	},
	isEmpty:function(array){
		return !(array && array.length > 0);
	},
	isNotEmpty:function(array){
		return !this.isEmpty(array);
	},
	getFirst:function(array){
		return this.isNotEmpty(array)?array[0]:undefined;
	},
	getLast:function(array){
		return this.isNotEmpty(array)?array[array.length - 1]:undefined;
	},
	length:function(array){
		return array?array.length:0;
	},
	get:function(array,idx){
		return (idx>=0 && idx<array.length)?array[idx]:undefined;
	},
	max:function(array){
		let ret;
		if(this.isNotEmpty(array)){
			ret = array[0];
			for(let i=1,len=array.length; i<len; i++){
				if(array[i]>ret) ret = array[i];
			}
		}
		return ret;
	},
	min:function(array){
		let ret;
		if(this.isNotEmpty(array)){
			ret = array[0];
			for(let i=1,len=array.length; i<len; i++){
				if(array[i]<ret) ret = array[i];
			}
		}
		return ret;
	}
};
