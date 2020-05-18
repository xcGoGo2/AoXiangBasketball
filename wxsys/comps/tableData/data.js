import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import Schema from "./schema";
import {runInAction, observable, extendObservable, autorun, toJS, isObservableArray, isObservableObject, isObservable } from  "../../lib/mobx/mobx-2.6.2.umd";
import {parsePath} from "../../lib/base/pageImpl";
import {isArray, cloneJSON} from "../../lib/base/util";


/**
 * data要求： 1. 路径中不允许使用特殊的标识"@, [, ]"(因为@, [, ]作为数组的过虑条件, 例如: a.b.c[@id=001]); 2.
 * 数组数据项的key值不允许使用特殊的标识"[, ]"
 * 
 * 数据的操作 1. 删除数据: 直接操作mobx数组, 例如this.comp("data").value.split(0, 1); 2. 修改数据:
 * 直接操作mobx对象, 例如this.comp("data").value[0].name = "xxx"; 3. 添加数据: 3.1 数组添加行:
 * 3.2 添加对象:
 */
export default class Data extends Component {
     constructor(page, id, props, context){
        super(page, id, props, context);
        context.vars[this.id] = this; // 将自己注册到变量中
        this.init();
     }
     
     init(){
    	let self = this; 
		this.InitDataPromise = new Promise(function(resolve, reject) {
			self.InitDataResolve = resolve;
			self.InitDataReject = reject;
		});
		//防止Uncaught (in promise)异常
		this.InitDataPromise.catch(()=>{});
 
    	this.delim = ",";
    	this._initDefinition();
    	this.open = false;
        this.value = this.schema.buildObservable(null);
        //初始新增和加载数据放到load后保证其他组件已经初始化
        this.page.on('load',()=>{
	    	 if(!isArray(this.props.options.depends)){
	    		 this._initData();
	    	 }else{
	    		 let comps = [];
	    		 for(let i=0;i<this.props.options.depends.length;i++){
	    			 let compId = this.props.options.depends[i];
	    			 if(this.id!==compId){
	    				 let comp = this.page.comp(compId);
	    				 if(comp instanceof Data) comps.push(comp.InitDataPromise);//数据组件特殊处理
	    				 else comps.push(this.compPromise(compId)); 
	    			 }
	    		 }
	    		 if(comps.length>0){
	    			 Promise.all(comps).then(()=>{
	    				 this._initData(); 
	    			 },(error)=>{
	    				 throw new Error("data[id="+self.id+"]初始化失败，" +error);
	    			 });
	    		 }else this._initData();
	    	 }
        });
        this.page.on('show',()=>{
        	if(this.opened) this._loadShareData();
        });
        this.page.on('unload',()=>{
        	if(this.opened) this._updateShareData(true);
        });
        this.page.on('hide',()=>{
        	if(this.opened) this._updateShareData(true);
        });
        
        this.page.on('refresh',()=>{
        	if(self.open) self.refreshData();
        });
        
        if(this.props.options.allowEmpty!==true){
        	this.page.on('loaded',()=>{
        		this.checkHasData();
        	});
        }
     }
     
     _getShareData(){
     	if(this.options.share && this.options.share.name)
    		return wx.ShareData.getShareData(this.options.share.name);
     }
     
     checkHasData(){
    	 
     }
     
     _loadShareData(){
    	 let shareData = this._getShareData();
    	 if(shareData instanceof wx.ShareData && shareData.hasData(this._shareFlag)){
    		 let sData = shareData.data||[];
    		 this.loadData(sData);
    		 this.updateCurrent(undefined,sData.currentID);
    		 this._shareFlag = shareData.flag;
    		 this.opened = true;
    		 return true;
    	 }
    	 return false;
     }
     
     _updateShareData(direct){
		 let shareData = this._getShareData();
		 if(shareData instanceof wx.ShareData){
			 if(this._updateShareDataHandle) clearTimeout(this._updateShareDataHandle);
			 let fn = ()=>{
				 this._updateShareDataHandle = null;
				 let shareData = this._getShareData();
				 if(shareData instanceof wx.ShareData){
					 let sData = this.toJSON();
					 sData && (sData.currentID = this.getCurrentRowID());
					 shareData.data = sData;
					 this._shareFlag = shareData.flag;
				 }
			 };
			 if(!direct) this._updateShareDataHandle = setTimeout(fn, 50);
			 else fn();
		 }
     }

     _updateShareDataCurrentIndex(){
		 let shareData = this._getShareData();
		 if(shareData instanceof wx.ShareData){
			 let data = shareData.data;
			 if(data){
				 let cid = this.getCurrentRowID();
				 (cid != data.currentID) && (data.currentID=cid);
			 }
		 }
     }

     _getDefaultStorageKey(){
    	return this.page.owner.route+'@'+this.id; 
     }
     
     saveToStorage(key){
    	key = key || this._getDefaultStorageKey();
    	let sData = this.toJSON();
    	wx.setStorageSync(key, sData);
     }
     
     loadFromStorage(key){
    	 key = key || this._getDefaultStorageKey();
    	 let sData = wx.getStorageSync(key) || [];
    	 return this.loadData(sData);
     }
     
     removeStorage(key){
    	 key = key || this._getDefaultStorageKey();
    	 wx.removeStorageSync(key);
     }
     
     getCurrentRowID(){}//后代类继承实现
     
     hasDependence(){
  		return true;
  	 }
      
     getCount(){
    	 return (this.value && this.value.length)||0;
     }
     
     _initData(){
         if (this.autoMode === "new"){
        	//data初始新增需要先加载共享数据中的 
        	this._loadShareData();			

         	this.newData({onSuccess:()=>{this.InitDataResolve();this.inited();},onError:()=>{this.InitDataReject();}});
         }else if (this.autoMode === "load" || this.autoMode === "loadOrNew"){
        	//加载数据判断如果存在共享数据使用共享数据，否则正常逻辑
        	if(this._loadShareData()){
        		if(this.autoMode === "load"){
        			this.InitDataResolve && this.InitDataResolve();
        			this.inited();
        		}else if(this.getCount()<=0 && this.autoMode === "loadOrNew"){
                 	this.newData({onSuccess:()=>{this.InitDataResolve();this.inited();},onError:()=>{this.InitDataReject();}});
        		}
        	}else
        		this.refreshData({
        			confirm:false,
        			parent: this.value,
        			onSucceeded:()=>{
        				if(this.getCount()<=0 && this.autoMode === "loadOrNew"){
                         	this.newData({onSuccess:()=>{this.InitDataResolve();this.inited();},onError:()=>{this.InitDataReject();}});
                		}else{
        					this.InitDataResolve && this.InitDataResolve();this.inited();
                		}
        			},
        			onError:()=>{
        				this.InitDataReject && this.InitDataReject();
        			}
        			});
         }else{
     		 this.InitDataResolve && this.InitDataResolve();
        	 this.inited();
         }
     }
     
     _initDefinition(){
    	 this.autoMode = null;
    	 if (this.props.options && this.props.options.autoMode){
    		 this.autoMode = this.props.options.autoMode;
    	 }
    	 this.versionLock = null;
    	 if (this.props.options && this.props.options.versionLock){
    		 this.versionLock = this.props.options.versionLock;
    	 }
    	 this.schema = new Schema(this.id, this.props.schema || {}, this);  
         this.options = this.props.options;
         this.conformRefresh = (this.options.confirmRefresh === false) ? false : true;
         this.confirmRefreshText = this.options.confirmRefreshText || "数据已经修改，刷新将丢失修改数据，是否确定刷新数据？";
         this.confirmDelete = (this.options.confirmDelete === false) ? false : true;
         this.confirmDeleteText = this.options.confirmDeleteText || "是否确定删除数据？";
     }

	 buildState(context){
    	 var state = super.buildState(context);
    	 state.value = this.toJSON(true);
    	 return state;
     }
     
     getValueByPath(path){
    	 var items = parsePath(path, true);
    	 var ret = this;
    	 for (let i=0; i<items.length; i++){
    		 if(!ret) throw new Error("组件" + this.id + "根据路径" + path +"获取值出错");
			 if (items[i].indexOf("@")==0){
				 let filter = this._parseArrayFilter(items[i]);
				 ret = this._findItemByFilter(ret, filter);
			 }else{
				 ret = ret[items[i]];
			 }
    	 }
    	 return ret;
     }

	 _findItemByFilter(items, filter){
		 var item = null;
		 for (let i=0; i<items.length; i++){
			 if (items[i][filter.key] == filter.value){
				 return items[i];
			 }
		 }

		 return item;
	 }

	 _parseArrayFilter(filter){
		var index = filter.indexOf("=");
		if (index != -1){
			var key = filter.substr(1, index-1);
			var value = filter.substr(index+1);
			return {key: key, value: value};
		}else{
			throw new Error("非法的数组过虑条件: " + filter);
		}
	 }
     
     check(){
    	 var ret = {valid: true, msg: []};
    	 this._doCheck(this.value, ret);
    	 return ret;
     }
     
     toJSON(all){
    	 var result = all ? toJS(this.value, true, null, true) : toJS(this.value);
    	 if (result) result = cloneJSON(result, all);
    	 return result;
     }
     
     _doCheck(value, ret){
    	 if (isObservableArray(value)){
    		 for (let i=0; i<value.length; i++){
    			 this._doCheck(value[i], ret);
    		 }
    	 }else if (isObservableObject(value)){
    		 let userdata = value._userdata;
    		 for (let prop in userdata){
    			 let required = userdata[prop].required;
    			 if (required && required.val && this._isEmptyValue(value.$mobx.getRealValue(prop))){
    				 ret.valid = false;
    				 ret.msg.push(required.msg || ((value.$schema.props[prop].label || prop) + "不允许为空"));
    			 }
    			 
    			 let constraint = userdata[prop].constraint;
    			 if (constraint && !constraint.val){
    				 ret.valid = false;
    				 ret.msg.push(constraint.msg || ((value.$schema.props[prop].label || prop) + "不符合规则"));
    			 }
    		 }
    		 
    		 for (let p in value){
    			 if (p == "_userdata") continue;
    			 this._doCheck(value[p], ret);
    		 }
    	 }
     }
     
     valid(){
    	 let ret = this.check();
    	 return ret.valid;
     }
     
     validInfo(){
    	 let ret = this.check();
    	 let msg = ret.msg;
    	 return msg.length>0?msg.join("; "):"";;
     }

     colValid(row,col){
    	if(row){
	       	 if (typeof(row) === 'string' && typeof(this.getRowByID)==='function'){
	    		 row = this.getRowByID(row);
	    	 }
    		 let userdata = row._userdata;
    		 if(userdata){
    			 let uProp = userdata[col];
    			 if(uProp){
    				 let required = uProp.required;
    				 if (required && required.val && this._isEmptyValue(row.$mobx?row.$mobx.getRealValue(col):row[col])){
       					 return false;
    				 }
    				 
    				 let constraint = uProp.constraint;
    				 if (constraint && !constraint.val){
       					 return false;
    				 }
    			 }
    		 }
    	}
		return true; 
     }
     
     colValidInfo(row,col){
    	 let msg = [];
     	if(row){
	       if (typeof(row) === 'string' && typeof(this.getRowByID)==='function'){
	    	 row = this.getRowByID(row);
	       }
   		   let userdata = row._userdata;
   		   if(userdata){
   			 let uProp = userdata[col];
   			 if(uProp){
   				 let required = uProp.required;
   				 if (required && required.val && this._isEmptyValue(row.$mobx?row.$mobx.getRealValue(col):row[col])){
					 msg.push(required.msg || (((row.$schema && row.$schema.props[col].label) || (typeof(this.label)==='function' && this.label(col)) || col) + "不允许为空"));
   				 }
   				 
   				 let constraint = uProp.constraint;
   				 if (constraint && !constraint.val){
    				 msg.push(constraint.msg || (((row.$schema && row.$schema.props[col].label) || (typeof(this.label)==='function' && this.label(col)) || col) + "不符合规则"));
   				 }
   			 }
   		  }
     	}
		return msg.length>0?msg.join("; "):""; 
     }
     
     _isEmptyValue(value){
    	 return value===undefined || value===null || value==="";
     }
     
     destroy(){
    	 this.schema.destroy();
    	 super.destroy();
     }
     
     // ---- array start---------
     getArrayCount(array){
    	 return array.length;
     }
     
     getArrayOrderBys(array) {
    	 var result = '';
    	 var items = this._getArrayOrderBys(array);
    	 for ( var i=0;i<items.length;i++) {
    		 var o = items[i];
    		 result += (result !== '' ? ',' : '') + o.name + (0 === o.type ? ' DESC' : ' ASC');
    	 }
    	 return result;
     }
     
     _getArrayOrderBys(array){
    	 array.getUserData().orderBy = array.getUserData().orderBy || []; 
    	 return array.getUserData().orderBy;
     }
     
   
     isCalulateProp(ob, name){
    	 var schema = null;
    	 if (isObservableArray(ob)){
    		 schema = ob.$schema.items;
    	 }else if (isObserableObject(ob)){
    		 schema = ob.$schema;
    	 }
    	 return schema && schema.props && schema.props[name] 
    	 	&& schema && schema.props && schema.props[name].isCal; 
     }
     
     // 如果type为undefined/null时, 表示删除orderby
     setArrayOrderBy(array, name, type) {
     	if(this.isCalulateProp(array, name)) return;// 计算属性不支持orderby
     	var items = this._getArrayOrderBys(array);
		var o = this.getArrayOrderBy(array, name);
		if (null !== type && undefined !== type){
			if(o) o.type = type;
			else items.push({name:name,type:type});
		}else{
			if(o){
				var i = items.indexOf(o);
				if(i>=0) items.splice(i,1);
			}
		}
     }
     
	 getArrayOrderBy(array, name) {
		 var items = this._getArrayOrderBys(array);
		 for (let i=0; i<items.length; i++){
			 if (items[i].name === name){
				 return items[i];
			 }
		 }
		 return null;
	 }
	 
     setArrayLimit(array, limit){
    	 array.getUserData().limit = limit;	 
     }
     
     getArrayLimit(array){
		 return array.getUserData().limit;
     }
     
     setArrayOffset(array, offset){
    	 array.getUserData().offset = offset;
     }
     
     getArrayOffset(array){
   		 return array.getUserData().offset;
     }
     
     hasArrayMore(array){
   		 if (array.getUserData().limit == -1) return false;
   		 return this.getArrayTotal(array) > this.getArrayOffset(array);
     }
     
     getArrayTotal(array){
   		 return array.getUserData().total.get();
     }
     
     setArrayTotal(array, total){
   		 array.getUserData().total.set(total); 
     }

     isArrayLoaded(array){
   		 return array.getUserData().loaded;
     }
     
     setArrayLoaded(array, loaded){
   		 array.getUserData().loaded=loaded; 
     }
     // ------array end---------

     // ---------------CRUD start---------------------
     refreshData(options){
    	 options = options || {};
    	 options.append = (options.append===true);
    	 //options.parent = options.parent || this.value;
    	 //if (isObservableArray(options.parent)){
    	//	 options.offset = options.parent.$schema.offset || 0;
    	 //}
    	 options.offset = 0;
    	 return this._refreshData(options);
     }

     _refreshData(options){
    	 var result = false, async = false, promise = null;
    	 options = options || {};
    	 var retPromise = this._createPromise(options);
    	 
		 options.parent = options.parent || this.value;
    	 var eventData = {
    		 cancel : false,
    		 options : options,
    		 source : this
    	 };
		 this.fireEvent(Data.EVENT_REFRESHDATA_BEFORE, eventData);
		 if (eventData.cancel) {
			 return Promise.reject();
		 }
		 
		 var self = this;
		 var func = () => {
			 if (options && 'number' == typeof (options.offset)) 
				 self.setArrayOffset(options.parent, options.offset);
			 if (options && 'number' == typeof (options.limit))
				 self.setArrayLimit(options.parent, options.limit);
			 
			 if (isObservableArray(options.parent)){
				 if (!options.hasOwnProperty("offset")) options.offset = this.getArrayOffset(options.parent);
				 if (!options.hasOwnProperty("limit")) options.limit = this.getArrayLimit(options.parent);
			 }
			 
			 if (self.hasListener(Data.EVENT_REFRESHDATA)) {
				eventData = {
					cancel : false,
					options : options,
					source : self
				};
				if (isObservableArray(options.parent)){
					eventData.limit = options.limit;
					eventData.offset = options.offset;
				}
				self.fireEvent(Data.EVENT_REFRESHDATA, eventData);
				result = !eventData.cancel;
				async = eventData.async;
				promise = eventData.promise;
			 }else{
				var ret = this.doRefreshData(options);
				result = ret.success;
				async = ret.async;
				promise = ret.promise;
			 }
			 
			 if (async || (promise && promise.then)){
				 if (promise && promise.then){
					 promise.then(function(){
						 self.doRefreshAfter(true, options);	 
					 },function(){
						 self.doRefreshAfter(false, options);
					 });
				 }
			 }else{
				 self.doRefreshAfter(result, options);
			 }
		 }
		 
		 var confirmRefresh = options.hasOwnProperty("confirm") ? options.confirm : this.confirmRefresh;
		 if (options.append){
			 func();
		 }else if (confirmRefresh && this.isChanged(options.parent)){
    		 var confirmRefreshText = this.confirmRefreshText;
    		 this._confirm(confirmRefreshText, func, null);
		 }else{
			 func();	 
		 }
		 return retPromise;
     }
     
     _confirm(msg, onOk, onCancel){
    	 wx.showModal({
    		 title: '提示',
    		 showCancel: true,
			 content: msg,
			 success: function(res) {
				 if (res.confirm){
					 onOk && onOk();
				 }else{
					 onCancel && onCancel();
				 }
			 }
    	 });
     }
     
     // TODO 只支持整个data更新
     doRefreshData(options) {
    	 this.open = true;
    	 if (options.parent === this.value && this.props.initData){
             var initData = JSON.parse(JSON.stringify(this.props.initData));// 必须clone,
																// 兼容list中嵌套page的情况,
																// 否则会导致data中的行对象是同一个
             this.loadData(initData, false, options.parent);
     	 }
    	 return {
 			success : true,
 			async : false
 		 };
     }

     updateCurrent(parent, item){} // 子类重载
     
     doRefreshAfter(success, options, params){
    	 params = params || {};
    	 params.source = params.source || this;
		 if (success){
			 this.opened = true;
			 var eventData = {
					 options : options,
					 source : this,
					 success : success,
					 changedSource : this,
					 type : 'refresh',
					 selfChanged : true,					 
			 };			 
			 this.setArrayLoaded(options.parent || this.value, true);
			 if (isObservableArray(options.parent)){
				 this.updateCurrent(options.parent);
				 this.setArrayLimit(options.parent, options.limit);
				 if (options.limit!=-1){
					 this.setArrayOffset(options.parent, options.offset + options.limit);
				 }
				 eventData.limit = options.limit;
				 eventData.offset = this.getArrayOffset(options.parent);
				 
			 }
				 
			 this.doDataChanged(eventData);
			 
			 if (options.onSuccess && (typeof options.onSuccess === 'function')){
				 options.onSuccess(params);
			 }
			 
			 this.fireEvent(Data.EVENT_REFRESHDATA_AFTER, eventData);
			 
			 //内部使用
			 if (options.onSucceeded && (typeof options.onSucceeded === 'function')){
				 options.onSucceeded(params);
			 }
		 }else{
			 if (options.onError && (typeof options.onError === 'function')) {
				 options.onError(params);
			 }
			 this.fireEvent(Data.EVENT_REFRESHDATA_ERROR, params);
		 }
     }
     
     doDataChanged(eventData) {
    	 let type = eventData.type;
    	 if(eventData.selfChanged && (['new','clear','delete','refresh','loadData','valueChanged'].indexOf(type)>=0)){
    		 //数据变化时进行共享数据同步
    		 this._updateShareData();
    	 }
    	 if (this.hasListener(Data.EVENT_DATA_CHANGE)) {
    		 var eData = Object.assign({}, eventData);
			 this.fireEvent(Data.EVENT_DATA_CHANGE, eData);
		 }
     }
     
     getIdColumn(){
    	 return "";//后代类实现
     }
     
  	_rows2indexMapping(rows){
		let ret = {};
		let idColumn = this.getIdColumn();
		if(rows && isObservableArray(rows)){
			for(var i=0;i<rows.length;i++){
				let row = rows[i];
				var id = row[idColumn];
				ret[id] = i;
			}
		}
		return ret;
 	}

  	smartLoad(keyName,orgList,newData){
  	    let orgIndexMap = {};
  	    let list = orgList;
  	    let newDatalist = newData;
  	    let kName = keyName;
  	    let ret = [];
  	    runInAction(() => {
  	    	for(let i=list.length-1;i>-1;i--){
  	    		let item = list[i];
  	    		let k = item[kName];
  	    		orgIndexMap[k] = item;
  	    	}
  	    	
  	    	for(let i=0,len=newDatalist.length;i<len;i++){
  	    		let item = newDatalist[i];
  	    		let k = item[kName];
  	    		let orgItem = list.length>i?list[i]:null;
                if(!orgItem || orgItem[kName]!==k){//判断原位置是不是同一条数据，如果不是从索引中获取
                    orgItem = orgIndexMap[k];
                    if(orgItem){
                    	list.splice(i,1,orgItem);
                    	orgItem = list[i];
                    }
                }    
                if(orgItem){
                    for (let [key, value] of Object.entries(item)) {
                        orgItem[key] = value; 
                    }   
                }else{
                    orgItem = item;
                    list.splice(i,1,orgItem);
                } 
  	    		ret.push(orgItem);
  	    	}
  	    	if(list.length>newDatalist.length){//清除多余的行
  	    		list.splice(newDatalist.length,list.length-newDatalist.length);
  	    	}
  	    });
  	    return ret;
  	}
  	
  	canSmartLoad(){
		var eventData = {
				'smartLoad': false,
				'source' : this
			};
		this.fireEvent(Data.EVENT_SMART_LOAD_BEFORE, eventData);
  		
  		return eventData.smartLoad;
  	}
  	
    loadData2Array(data, userdata, append, parent, index, override){
		 let ret = [];
		 let idColumn = this.getIdColumn();
		 this.updatePaginationVar(userdata, parent);
		 if (!append){
			 if(this.canSmartLoad()){//智能加载
				 return this.smartLoad(idColumn,parent,data);
			 }else this._clear(parent);
		 }
		 let indexMapping = (override && idColumn)?this._rows2indexMapping(parent):{};
		 index = (index==undefined || index==null) ? -1: index;
		 for (let i=0; i<data.length; i++){
			 let row = data[i];
			 let rid = row[idColumn];
			 if(!indexMapping.hasOwnProperty(rid)){
				 let newIndex;
				 if ((index == -1) || index >= parent.length){
					 parent[parent.length] = row;
					 ret[ret.length] = parent[parent.length-1];
					 newIndex = parent.length-1;
				 }else{
					 parent.splice(index+i, 0, data[i]);
					 ret[ret.length] = parent[index+i];
					 newIndex = index+i;
				 }
				 if(override && rid!==undefined) indexMapping[rid] = newIndex;
			 }else{
				 let orgRowIndex = indexMapping[rid];
				 parent[orgRowIndex] = row; 
				 ret[ret.length] = parent[orgRowIndex];
			 }
		 }
		 return ret;
    }
     
     loadData(data, append, parent, index, override){
    	return this._loadData(data, append, parent, index, override, true); 
	 }
	 
	 loadData1(data, append, index, override){
    	return this._loadData(data, append, null, index, override, true); 
     }
     
     _loadData(data, append, parent, index, override, fireEvt){
    	 if (!data)  return;
    	 var ret = null;
    	 runInAction(() => {//加载数据放在一个事务
    		 parent = parent || this.value;
    		 var userdata = {};
    		 if (data.userdata){
    			 userdata = data.userdata;
    			 data = data.value;
    		 }
    		 if (isObservableObject(parent)){
    			 if (parent === this.value){
    				 this.value = this.schema.buildObservable(data);
    				 ret = this.value;
    			 }else{
    				 throw new Error("loadData加载对象类型时, 只允许加载整个数据");
    			 }
    		 }else if (isObservableArray(parent)){
    			 ret = this.loadData2Array(data, userdata, append, parent, index, override);
    		 }
    	 });
    	 
    	 if(fireEvt){
    		 var loadEventData = {
    				 source : this,
    				 changedSource : this,
    				 type : 'loadData',
    				 selfChanged : true,
    		 };
    		 this.doDataChanged(loadEventData);
    	 }
    	 return ret;
     }     
     
     updatePaginationVar(userdata, parent) {
    	 if (userdata.hasOwnProperty('sys.count')){
    		 this.setArrayTotal(parent, userdata['sys.count']);
    	 }
    	 if (userdata.hasOwnProperty('sys.offset')){
    		 this.setArrayOffset(userdata['sys.offset'], parent);
    	 }
     }     
          
     
     // 子类重载, 更新当前行
     _clear(array){
    	 if (isObservableArray(array)){
    		 array.clear();	 
    	 }
     }
     
     clear(){
    	 this._clear(this.value);
     }

     /**
		 * 创建新的数据, 可以同时创建多行数据 兼容支持原来的3个参数写法index, parent, rows
		 * 
		 * @method newData
		 * @param [options]
		 *            可以设置默认值, 父, 如果创建多条数据可以设置默认值为默认值数组 参数结构 {defaultValues:
		 *            [{column1: (value), column2: (value), ...},{...},...],
		 *            parent: ({Data.Row}), onSuccess: ({Function}), onError:
		 *            ({Function})}
		 * @returns {Array(String)} rows
		 */
     newData(options){
    	options = options || {};
    	options.parent = options.parent || this.value;
    	options.index = options.hasOwnProperty('index') ? ('string'===typeof(options.index)?parseInt(options.index):options.index) : -1;

		var eventData = {
    		'cancel' : false,
			'options': options,
			'source' : this
		};
		this.fireEvent(Data.EVENT_NEWDATA_BEFORE, eventData);
		if (eventData.cancel) {
			return Promise.reject();
		}
		
		var data = null;
		if (this.hasListener(Data.EVENT_NEWDATA)) {
			eventData = {
				cancel: false,
				data : data,
				options: options,
				source : this
			};
			this.fireEvent(Data.EVENT_NEWDATA, eventData);
			if (eventData.cancel) {
				return Promise.reject();
			}
			data = eventData.data;
		}else{
			data = this.doNewData(options.defaultValues, options);
		}
		if (!data) {
			return Promise.reject();
		}
		
		data = this.loadData(data, true, options.parent, options.index);
		if (data && !((options||{}).disableRecordChange)){
			if (isArray(data)){
				for (let i=0; i<data.length; i++){
					data[i].$initDefaultValue();
					data[i].setState(Data.STATE.NEW);
				}
			}else{
				data.$initDefaultValue();
				data.setState(Data.STATE.NEW);
			}
		}
		
		if (isObservableArray(options.parent) && (data.length > 0)){
			this.updateCurrent(options.parent, data[0]);
		}
		
		//记录打开状态
		this.opened = true;
		this.setArrayLoaded(options.parent || this.value, true);
		
		eventData = {
			'data' : data,
			'options': options,
			'source' : this
		};
		this.fireEvent(Data.EVENT_NEWDATA_AFTER, eventData);
		eventData.changedSource = this;
		eventData.type = 'new';
		eventData.selfChanged = true;
		this.doDataChanged(eventData);
		

		if (options.onSuccess && (typeof options.onSuccess === 'function'))
			options.onSuccess({
				'source' : this,
				'options': options,
				'data' : data
			});

		return Promise.resolve(data);
     }
     
     // 子类重载
     doNewAfter(){}
     

     doNewData(defaultValues, options){
	 	 var ret = defaultValues;
		 if (isObservableArray(options.parent)){
			 ret = ret || [{}];
			 if (!isArray(ret)) ret = [ret];
		 }else{
			 ret = ret || {};
		 }
		 return ret;
     }
     
     _createPromise(options){
    	 var retPromise = new Promise((resolve, reject) => {
    		 let oldOnSuccess = options.onSuccess;
    		 let oldOnError = options.onError;
    		 options.onSuccess = function(p){
    			 oldOnSuccess && oldOnSuccess(p);
    			 resolve();
    		 };
    		 options.onError = function(p){
    			 oldOnError && oldOnError(p);
    			 reject();
    		 };
    	 });
    	 //catch防止 Uncaught (in promise)异常
    	 retPromise.catch(()=>{});
    	 return retPromise;
     }
     
     /**
		 * 业务数据保存方法
		 * 
		 * @param [options]
		 *            可以设置成功失败的回调 参数结构 {ignoreInvalid: true, onSuccess:
		 *            ({Function}), onError: ({Function})}
		 * @return {boolean}
		 */
     saveData(options){
    	 if (!this.isChanged(options)){
    		 return Promise.resolve();
    	 }
    	 
    	 options = options || {};
    	 var retPromise = this._createPromise(options);
    	 
    	 var async = false, promise = null, result = false;
    	 
    	 var onSuccess = options.onSuccess, onError = options.onError, ignoreInvalid = !! options.ignoreInvalid;
    	 var result = false;
    	 if (!ignoreInvalid){
    		 var info = this.check();
    		 if (!info.valid){
    			 wx.showModal({
    				    showCancel:false,
    				    title: '友情提示',
    				    content: info.msg.join("; ")
    				  });
    			 throw new Error(info.msg.join("; "));
    		 }
    	 }
    	 
    	 try{
    		 var eventData = {
    			cancel : false,
				source : this,
				options : options
    		 };
			 this.fireEvent(Data.EVENT_SAVEDATA_BEFORE, eventData);
			 if (eventData.cancel) {
				 return Promise.reject();
			 }

			 if (this.hasListener(Data.EVENT_SAVEDATA)) {
				 eventData = {
					cancel: false,
					source: this,
					options: options
				 };
				 this.fireEvent(Data.EVENT_SAVEDATA, eventData);
				 async = eventData.async;
				 result = !eventData.cancel;
				 promise = eventData.promise;
			 }else{
				 var ret = this.doSaveData(options);
				 async = ret.async;
				 result = ret.success;
				 promise = ret.promise;
			 }
			 
			 if (!result) {
				 return Promise.reject();
			 }
			 
			 if (async || (promise && promise.then)){
				 if(promise && promise.then){
					 var self = this;
					 promise.then(function(){
						 self.doSaveAfter(true, options);
					 },function(){
						 self.doSaveAfter(false, options);
					 });
				 }
			 }else{
				 this.doSaveAfter(result, options);
			 }
			 
			 eventData = {
					 cancel : false,
					 options: options,
					 source : this
			 };
			 this.fireEvent(Data.EVENT_SAVEDATA_AFTER, eventData);
			 if (eventData.cancel) {
				 return Promise.reject();
			 }
    	 }catch(e){
    		 throw new Error("保存数据失败! 原因： " + (e.message || e));
    	 }
    	 return retPromise;
     }
     
     doSaveData(options){
    	 return {success: true};
     }
     
     doSaveAfter(success, options, params){
    	 options = options || {};
		 params = params || {};
		 params.source = params.source || this;
		 var onError = options.onError;
		 var onSuccess = options.onSuccess;
		 if(success){
			 this.applyUpdates(params, options);
	    	 //保存成功同步共享数据，保存失败不进行共享数据同步依赖修改等操作同步
	    	 this._updateShareData();

			 if (onSuccess && (typeof onSuccess === 'function'))
				onSuccess(params);
			 this.fireEvent(Data.EVENT_SAVEDATA_COMMIT, params);
		 }else{
			if (onError && (typeof onError === 'function')) {
				onError(params);
			}
			this.fireEvent(Data.EVENT_SAVEDATA_ERROR, params);
		 }					
	 }
     
     applyUpdates(data,options){
    	 // 更新版本字段和状态不触发事件和状态变化
		 this.disableRecordChange();
		 try {
			 options = options || {};
			 var parent = options.parent || this.value;
			 this.resetState(parent);
		} finally {
			this.enabledRecordChange();
		}
	 }
     
     disableRecordChange() {
    	 this._disableRecordChange = true;
	 }
	 enabledRecordChange() {
		this._disableRecordChange = false;
	 }
	 canRecordChange() {
		return !this._disableRecordChange;
	 }
     
	 getVersionLock() {
		let versionCol = this.versionLock;
	 	return versionCol && this.getColumnDef(versionCol);
	 }

     resetState(ob){
    	 if (isObservableObject(ob)){
    		 let state = ob.getState();
    		 let versionCol = this.versionLock;
    		 if (versionCol && Data.STATE.EDIT == state) {
				if (ob[versionCol] || 0===ob[versionCol]) {
					ob[versionCol] = parseInt(ob[versioncol],10) + 1;
				}
    		 }
    		 
    		 ob.setState(Data.STATE.NONE);
    		 for (let name in ob){
    			 this.resetState(ob[name]);
    		 }
    	 }else if (isObservableArray(ob)){
    		 //ob.setState(Data.STATE.NONE);
    		 for (let i=0; i<ob.length; i++){
    			 this.resetState(ob[i]);
    		 }
    	 }
     }
     
     deleteAllData(options){
    	 var ret = this.deleteData(this.value, options);
    	 var eventData = {
    		 source: this,
    		 changedSource: this,
    		 type: 'clear',
    		 selfChanged: true
    	 };
		 this.doDataChanged(eventData);
		 return ret;    	 
    	 
     }
     
     deleteData(value, options){
    	 options = options || {};
    	 var retPromise = this._createPromise(options);
    	 var result = false, async = (options&&options.async)||false,promise;
    	 options.parent = options.parent || this.value;
    	 if (isObservableArray(options.parent)){
    		 if (options.parent.length == 0) return true;
    		 if (!isArray(value)){
    			 value = [value];
    		 }
    	 }else{
    		 value = value || this.value;
    	 }
    	 
    
    	 var eventData = {
    			 cancel: false,
				 source: this,
				 options: options,
				 deleteValue: value
		 };
		 this.fireEvent(Data.EVENT_DELETEDATA_BEFORE, eventData);
		 if (eventData.cancel){
			 return Promise.reject();
		 }    	 
    	 
    	 var fn = () => {
	    	 if (this.hasListener(Data.EVENT_DELETEDATA)) {
	    		 eventData = {
	    			source: this,
	    			cancel: false,
	    			options: options,
	    			deleteValue: value
	    		 }
	    		 this.fireEvent(Data.EVENT_DELETEDATA, eventData);
	    		 async = eventData.async;
	    		 result = !eventData.cancel;
	    		 promise = eventData.promise;
	    	 }else{
	    		 options = Object.assign({}, options);
				 var oldSuccessFn = options.onSuccess; 
				 options.onSuccess = (params) => {
					 if (isObservableObject(options.parent)){
						 if ((options.parent === this.value)){
							 this.value = this.schema.buildObservable({});
						 }else{
							 throw new Error("删除对象时, 只能删除整个data");
						 }
					 }else{
						 for (let i=0; i<value.length; i++){
							 this.remove(value[i], options.parent); // 没有支持tree
						 }
					 }
					 if('function'===typeof(oldSuccessFn)) oldSuccessFn(options);
				 };
				 //TODO 仅支持直接后台删除
				 var ret = this.doDirectDeleteData(value, options);
				 result = ret.success;
				 async = ret.async;
				 promise = ret.promise;

	    	 }

	    	 options.deleteValue = value;
			 if (async || (promise && promise.then)){
				if (promise && promise.then){
					var self = this;
					promise.then(function(){
						self.doDeleteAfter(true, options);
					},function(){
						self.doDeleteAfter(false, options);
					});
				} 
			 }else{
		    	this.doDeleteAfter(result, options);
			 }
    	 };
    	 
    	 var confirmDelete = this.confirmDelete;
    	 if (options && options.hasOwnProperty("confirm")){
    		 confirmDelete = options.confirm;
    	 }
    	 if (confirmDelete){
    		 var confirmDeleteText = this.confirmDeleteText;
    		 this._confirm(confirmDeleteText, fn, null);
    	 }else{
    		 fn();
    	 }
    	 
    	 return retPromise;
     }
     
     remove(value, parent){
    	 parent = parent || this.value;
    	 if (isObservableArray(parent)){
    		 var index = parent.indexOf(value);
        	 if (index > -1){
        		 var total = this.getArrayTotal(parent)-1;
        		 total = (total>0) ? total : 0;
        		 this.setArrayTotal(parent, total);
        		 parent.remove(value);
        	 }
    	 }
     }
     
     doDirectDeleteData(rows, options){
    	 return {success : true, async : false};
     }
     
     doDeleteAfter(success, options, params){
    	params = params || {};
		if(!params.source) params.source = this;
    	var onError = options.onError;
		var onSuccess = options.onSuccess;
		
		var parent = options.parent || this.value;
		if (success){
			if (onSuccess && (typeof onSuccess === 'function')){
				onSuccess(params);
			}
		 }else{
			 if (onError && (typeof onError === 'function')) {
				 onError(params);
			 }
			 this.fireEvent(Data.EVENT_DELETEDATA_ERROR, params);
		 }
		 
		var eventData = {
			'source' : this,
			'deleteValue' : params.value || options.value
 		 };
		 this.fireEvent(Data.EVENT_DELETEDATA_AFTER, eventData);
         eventData.changedSource = this;
		 eventData.type = 'delete';
		 eventData.selfChanged = true;
		 this.doDataChanged(eventData);
     }
     
    
     loadAllPageData(parent, options){
    	 if (isObservableArray(parent)){
    		 options = options || {};
    		 options.parent = parent;
    		 var limit = this.getArrayLimit(parent);
    		 if (limit == -1){
    			 return this.refreshData(options);
    		 }else{
    			 var total = this.getArrayTotal(parent), offset = this.getArrayOffset(parent);
    			 if ((total <= offset) || (total < 1)) return;
   				 options.append = true;
				 options.limit = total;
				 return this._refreshData(options);
    		 }
    	 }else{
    		 return Promise.resolve();
    	 }
     }
     
     loadPageData(parent, index, options){
    	 if (isObservableArray(parent)){
    		 options = options || {};
    		 options.parent = parent;
    		 if (index < 1) index = 1;
        	 var limit = this.getArrayLimit(parent); 
    		 if ((limit==-1) || (index==1)){
    			 return this.refreshData(options);
    		 }else{
    			 options.offset = (index-1) * limit;
    			 options.append = false;
    			 return this._refreshData(options);
    		 }
    	 }else{
    		 return Promise.resolve();
    	 }
     }
     loadNextPageData(parent, options){
    	 if (isObservableArray(parent)){
        	 if (this.getArrayLimit(parent) == -1) return;
             var total = this.getArrayTotal(parent), offset = this.getArrayOffset(parent);
             if ((total <= offset) || (total < 1)) return;           
        	 options = options || {append:true};
        	 options.parent = parent;
             return this._refreshData(options);	 
    	 }else{
    		 return Promise.resolve();
    	 }
     }
     
     getReadonly(){
    	 if (this.page.$isReadonlyMode && this.page.$isReadonlyMode()){
    		 return true;
    	 }else{
        	 if (this.props.$roFn && this.page[this.props.$roFn]){
        		 return this.page[this.props.$roFn](this);
        	 }else{
            	 return false;
        	 }
    	 }
     }
     
     isChanged(options){
    	 options = options || {};
    	 var parent = options.parent || this.value;
    	 if (isObservableArray(parent)){
    		 for (let i=0; i<parent.length; i++){
    			 var item = parent[i];
    			 if (item && (item.getState()===Data.STATE.NEW 
        				 || item.getState()===Data.STATE.EDIT)){
    				 return true;
    			 }
    		 }
    		 return false;
    		 
    	 }else if (isObservableObject(parent)){
    		 return parent.getState()===Data.STATE.NEW 
    				 || parent.getState()===Data.STATE.EDIT;
    	 }else{
    		 return false;
    	 }
     }
}

Data.STATE = {
	EDIT: "edit",
	NEW: "new",
	DELETE: "delete",
	NONE: "none"
};

// 新增业务数据的事件＝＝＝＝＝＝＝＝＝
Data.EVENT_NEWDATA_ERROR = "newError";
Data.EVENT_NEWDATA_CREATEPARAM = "newCreateParam";
Data.EVENT_NEWDATA_BEFORE = "beforeNew";
Data.EVENT_NEWDATA = "customNew";
Data.EVENT_NEWDATA_AFTER = "afterNew";

// 删除业务数据的事件＝＝＝＝＝＝＝＝＝
Data.EVENT_DELETEDATA_ERROR = "deleteError";
Data.EVENT_DELETEDATA_BEFORE = "beforeDelete";
Data.EVENT_DELETEDATA = "customDelete";
Data.EVENT_DELETEDATA_AFTER = "afterDelete";

// 刷新业务数据的事件＝＝＝＝＝＝＝＝＝
Data.EVENT_REFRESHDATA_ERROR = "refreshError";
Data.EVENT_REFRESHDATA_CREATEPARAM = "refreshCreateParam";
Data.EVENT_REFRESHDATA_BEFORE = "beforeRefresh";
Data.EVENT_REFRESHDATA = "customRefresh";
Data.EVENT_REFRESHDATA_AFTER = "afterRefresh";
Data.EVENT_SMART_LOAD_BEFORE = "beforeSmartLoad";

// 保存业务数据的事件＝＝＝＝＝＝＝＝＝
Data.EVENT_SAVEDATA_ERROR = "saveError";
Data.EVENT_SAVEDATA_COMMIT = "saveCommit";
Data.EVENT_SAVEDATA_CREATEPARAM = "saveCreateParam";
Data.EVENT_SAVEDATA_BEFORE = "beforeSave";
Data.EVENT_SAVEDATA = "customSave";
Data.EVENT_SAVEDATA_AFTER = "afterSave";

// 行改变事件
Data.EVENT_INDEX_CHANGED = "indexChanged";
Data.EVENT_INDEX_CHANGING = "indexChanging";

Data.EVENT_VALUE_CHANGED = Schema.EVENT_VALUE_CHANGED;
Data.EVENT_VALUE_CHANGE = Schema.EVENT_VALUE_CHANGE;
Data.EVENT_DATA_CHANGE = Schema.EVENT_DATA_CHANGE;

wx.comp = wx.comp || {};
wx.comp.Data = Data;

