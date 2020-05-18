import wx from './wx';
import Eventable from "./eventable";
import UUID from "./uuid";
import {isArray,isObject} from "./util";

var _shareData = {};

export default class ShareData extends Eventable{
	constructor(config){
		super();
		config = config || {};
		config.name || (config.name = UUID.createUUID());
		this.config = config;
		this.name = config.name;
		this.defined = config.defined;
		this.type = config.type || ShareData.TYPE_TABLE_DATA;
		this._data = null;
		this._updateFlag = null;
		_shareData[this.name] = this;
	}
	
	free(){
		delete _shareData[this.name];
	}
	
	set data(data){
		if(this.check(data)){
			this._data = data;
			this._updateFlag = UUID.createUUID();
		}else throw new Error("不能给共享数据["+this.name+"]赋值，数据格式不匹配");
	}
	
	get data(){
		return this._data;
	}
	
	get flag(){
		return this._updateFlag;
	}
	
	check(data){
		if([ShareData.TYPE_TABLE_DATA,ShareData.TYPE_REST_DATA,ShareData.TYPE_SERVICE_DATA,ShareData.TYPE_COMMON_DATA].indexOf(this.type)>=0){
			//TableData类型数据，根据列定义比较判断，需要全匹配
			if(data){
				if(isArray(data)){					
					if(this.defined && data.length>0){
						let o = data[0];
						for (let k of Object.keys(this.defined)) {
							if(!o.hasOwnProperty(k)) return false;
						}
					}
				}else return false;
			}
		}
		return true;
	}
	
	hasData(flag){
		let loaded = !!this._updateFlag;
		if(undefined===flag) return loaded;
		else return loaded && this._updateFlag!=flag;
	}
	
	static getShareData(name){
		return _shareData[name];
	}
}

ShareData.TYPE_TABLE_DATA = "table-data";
ShareData.TYPE_REST_DATA = "rest-data";
ShareData.TYPE_SERVICE_DATA = "service-data";
ShareData.TYPE_COMMON_DATA = "common-data";

