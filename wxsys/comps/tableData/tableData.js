import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import Schema from "./schema";
import {getDefaultValue} from "./schema";
import {observable, extendObservable, autorun, toJS, isObservableArray, isObservableObject, isObservable, intercept} from  "../../lib/mobx/mobx-2.6.2.umd";
import {parsePath} from "../../lib/base/pageImpl";
import Data from "./data";
import {isArray,isFunction, cloneJSON} from "../../lib/base/util";
import Number from "../../lib/base/number";
import UUID from "../../lib/base/uuid";

/**
 * data要求： 1. 路径中不允许使用特殊的标识"@, [, ]"(因为@, [, ]作为数组的过虑条件, 例如: a.b.c[@id=001]); 2.
 * 数组数据项的key值不允许使用特殊的标识"[, ]"
 * 
 * 数据的操作 1. 删除数据: 直接操作mobx数组, 例如this.comp("data").value.split(0, 1); 2. 修改数据:
 * 直接操作mobx对象, 例如this.comp("data").value[0].name = "xxx"; 3. 添加数据: 3.1 数组添加行:
 * 3.2 添加对象:
 */
export default class TableData extends Data {
     constructor(page, id, props, context){
        super(page, id, props, context);
     }
     
     
     updateCurrent(array, row){
    	 if (row){
    		 this.to(row);
    	 }else{
    		 row = this.getCurrentItem();
    		 if (!this.exist(row)){
    			 this.first();
    		 }else{
    			 //this.to(this.value[0]);//数据行存在不处理
    		 }
    	 }
     }
     
     checkHasData(){
    	 if(this.getCount()<=0){
    		 /* lzg 2018.10.30屏蔽
    		 setTimeout(()=>{
    			 throw new Error("数据集[id="+this.id+"]无数据，如果允许无数据请设置\"允许无数据\"属性为true");
    		 },1);
    		 */
    	 }
     }
     
     _clear(array){
    	 this._currentOB.set(null);
    	 super._clear(array);
     }
     
     destroy(){
    	if(this.masterDisposer) this.masterDisposer(); 
    	super.destroy();
     }
     
     getDefaultRow(){
         var ret = null;
         if (this.props && this.props.schema && this.props.schema.items && this.props.schema.items.props){
           ret = {};
           for (var k in this.props.schema.items.props){
             if (this.props.schema.items.props.hasOwnProperty(k)){
               ret[k] = getDefaultValue(this.props.schema.items.props[k].type);
             }
           }
         }
         return ret;
     }
     
     init(){
    	this.slaveDatas = []; 
      	this._currentOB = observable(null);
      	this._currentOB.set(this.getDefaultRow());  //模拟假数据
    	super.init();

		var func = function() {
			this._bindMaster();
		};

		var self = this;
		if (!this.master || this.master.masterData || !this.master.id) {
		    func.call(self);
		} else {// 有依赖的主data
			this.compPromise(this.master.id).then(function() {
				func.call(self);
			}, function(error) {// data[xid=self.xid]初始化失败，error
				throw new Error("data[id="+self.id+"]初始化失败，" +error);
			});
		}
     }

 	saveAllData(option){
		option = option || {};
		option.allData = true;
		option.onlySelf = true;
		return this.saveData(option);
	}
	
 	getChildren(parentRow){
 		if(parentRow && this.isTree()){
 			let treeOp = this.getTreeOption();
 			return treeOp && treeOp.children && parentRow[treeOp.children];
 		}
 	}
 	
    each(callback,parentRow){
    	 if(isFunction(callback)){
    		 let isTree = this.isTree();
    		 let rows = !parentRow?this.value:(isTree?this.getChildren(parentRow):[]);
    		 if(rows){
    			 for (let i=0,len=rows.length; i<len; i++){
    				 var row = rows[i];
    				 if(false===callback.call(this,{parent:parentRow, row:row, index:i, data:this})) return false;
    				 if(isTree){
    					 if(false===this.each(callback,row)) return false;
    				 }
    			 }
    		 }
    	 }
    }
     
	_aggregate(type, col, filterCallback, parentRow) {
			let ret = 0.0, len = 0, min = null, max = null;
			this.each((param)=>{
				let ok = true;
				if(isFunction(filterCallback)) ok = filterCallback.call(this,param);
				if(ok){
					len++;
					if(col){
						let v = param.row[col];
						if(typeof(v)==="number" && !isNaN(v)){
							ret = Number.accAdd(ret, v);
							max = max === null ? v : (max < v ? v : max);
							min = min === null ? v : (min > v ? v : min);
						}else if('avg' === type){
							//忽略没有值的列
							len--;
						} 
					}
				}
			}, parentRow);
			if ('count' === type)
				return len;
			else if ('avg' === type)
				return Number.accDiv(ret, len);
			else if ('sum' === type)
				return ret;
			else if ('min' === type)
				return min;
			else if ('max' === type)
				return max;
		}
	
		label(col) {
			var def = this.getColumnDef(col);
			return def ? (def.label?def.label:col) : ''
		}
		
		col(col){
			return col || "";
		}
		
		count(filterCallback) {
			return this._aggregate("count", null, filterCallback);
		}
		
		avg(col, filterCallback) {
			return this._aggregate("avg", col, filterCallback);
		}
		
		sum(col, filterCallback) {
			return this._aggregate("sum", col, filterCallback);
		}
		
		min(col, filterCallback) {
			return this._aggregate("min", col, filterCallback);
		}
		
		max(col, filterCallback) {
			return this._aggregate("max", col, filterCallback);
		}
     
		showError(info){
			let msg = info.message || '未知错误';
			wx.showToast({duration:3000,title:msg,icon:'none'});
		}
		
		showModalError(info){
			let msg = info.message || '未知错误';
			wx.showModal({
			    showCancel:false,
			    title: '友情提示',
			    content: msg
			  });
		}
     //主从绑定处理
     _bindMaster(){
		if (this.master && !this.master.masterData && this.master.id) {
			this.master.masterData = this.page.comp(this.master.id);
			if (this.master.masterData) {
				this.master.masterData.slaveDatas.push(this);
				var master = this.master.masterData;
				var self = this;
				this.masterDisposer = autorun(function(){
					let mCurrentRow = master.getCurrentRow();
					if(mCurrentRow){
						//let state = mCurrentRow.getState();
						//注意：此处只能必须使用setTimeout，否则会把其他不相关依赖进来
						setTimeout(function(){self._initData(true)},1);
					}
				});
			}
		}
     }
     
     getTreeOption(){
    	 /*
    	  * {
    	  * children:子数组列
    	  * rootFilter:根数据过滤条件,
    	  * parent:父关系列
    	  * }
    	  */
    	 return this.props.options.treeOption;
     }
     
     isTree(){
    	 let treeOp = this.getTreeOption();
    	 return treeOp && treeOp.isTree;
     }
     
     _initDefinition(){
    	 if (this.props.filters){
    		 for (let name in this.props.filters){
    			 this.setFilter(name, this.props.filters[name]);
    		 }
    	 }
    	 //记录需要级联删除的数据
    	 this.defSlaves = this.props.options.defSlaves;
    	 //创建统计数据
    	 this.defAggCols = this.props.options.defAggCols;
    	 //主从定义
    	 if(this.props.options.master)
    		 this.master = {id:this.props.options.master.id,relation:this.props.options.master.relation};
    	 
    	 if(this.props.options.isMain){
    		 this.isMain = true;
    		 this.page.$mainData = this;
    	 }
    	 
    	 var aggData = {};
    	 if(this.defAggCols){
    		 for(let n in this.defAggCols){
    			 aggData[n] = ""; 
    		 }
    	 }
    	 this._aggOB = observable(aggData);
    	 
    	 this._initColRule();
    	 super._initDefinition();
    	 let verLock = this.getVersionLock();
    	 if(verLock){
    		 this._colRules[verLock.name] && (this._colRules[verLock.name].readonly=true);
    	 }
     }
     
     _initColRule(){
    	 var rules = {};
    	 
    	 var coldefs = this.getColumnDefs();
    	 for (var o in coldefs){
    		 if (coldefs.hasOwnProperty(o)){
    			 rules[o] = {
    					 readonly: false,
    					 required: false,
    					 hidden: false
    			 }
    		 }
    	 }
    	 this._colRules = observable(rules);
     }
     
     getColRuleValue(col, ruleName){
    	 if (col && ruleName){
    		 return this._colRules[col] && this._colRules[col][ruleName];  
    	 }else{
    		 return false;
    	 }
     }
     setColRuleValue(col, ruleName, value){
    	 if (col && ruleName && this._colRules && this._colRules[col]){
    		 this._colRules[col][ruleName] = !!value;
    	 }
     }

     _initData(force){
 		if(!this.master || force)
 			super._initData();
     }
     
     isChanged(options){
    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }
    	 //增加从数据感知
    	 let ret = super.isChanged(options) || this.isSlaveChanged();
    	 return ret;
     }
     
     isSlaveChanged(){
		 let ret = false;
    	 //增加从数据感知
		 for(let i=0,len=this.slaveDatas.length;i<len;i++){
			 ret = this.slaveDatas[i].isChanged();
			 if(ret) break;
		 }
		 return ret;
     }
     
     //没有实现filter相关方法，在子类中实现
     buildFilter() {
    	 return '';
     }
	 getFilter(name) {
		 return '';
	 }
	 setFilter(name, filter) {
		 return '';
	 }
     
	 getColumnIDs() {
    	 var items = this._getColumns(); 
    	 var result = null;
    	 for ( var o in items) {
    		 if('_key'!==o)
    			 result = null !== result ? (result + this.delim + o) : o;
    	 }
    	 return result;
     }
     
	 getColumnDefs() {
    	 var items = this._getColumns(); 
    	 var result = {};
    	 for ( var o in items) {
    		 if('_key'!==o)
    			 result[o] = items[o];
    	 }
    	 return result;
     }

	 _getColumns(){
    	 var result = {};
    	 if (this.props.schema && this.props.schema.items && this.props.schema.items.props){
    		 result = this.props.schema.items.props;
    	 }
    	return result;
     }
	
	 getRowByID(id){
		 if (id !== undefined && id !== null) {
			 let ret = null;
			 this.each((p)=>{
				if (id == this.getRowID(p.row)){
					ret = p.row;
					return false;
				} 
			 });
			 return ret;
		 }else{
			 return this.getCurrentRow();
		 }
	 }
	 
	 getValue(col, row){
		 if (!col) return undefined;
		 row = row || this.getCurrentRow();
		 if (!row) return undefined;
		 var value = row[col];
		 return value;
	 }
	 
	 setValue(col, value, row){
		 if (!col) return;
		 row = row || this.getCurrentRow();
		 if (!row) return ;
		 row[col] = undefined!==value?value:null;
	 }

	 fieldsValue(row,options){
		row = row || this.getCurrentRow();
		if (!row) return ;
		if(!options) return;
		options = options || {};
		for(var p in options){
			row[p] = undefined!==options[p]?options[p]:null;
		}
	 }
	 
	 getValueByID(col, id){
		 var row = this.getRowByID(id);
		 if(row) return this.getValue(col, row);
	 }
	 
	 setValueByID(col, value, id) {
		 var row = this.getRowByID(id, true);
		 if(row) this.setValue(col, value, row);
	 }
     
     //-------------支持当前行开始------------------------
     getCurrentItem(){
    	 return this.current;
     }
     
     getCurrentRow(){
    	 return this.current;
     }
     
     getCurrentRowState(){
    	 try{
    		 return this.current.getState();
    	 }catch(e){
    		 return Data.STATE.NONE;
    	 }
     }
     
     get current(){
    	 var result = this._currentOB.get();
    	 if (!result){
    		 result = {};  //兼容当前行为空时, 引用报错的问题
    	 }
    	 return result;
     }
     
     get agg(){
    	 return this._aggOB;
     }
     
     exist(row){
    	 let ret = false;
    	 row && this.each((p)=>{
    		 if(p.row===row){
    			 ret = true;
    			 return false;
    		 }
    	 });
    	 return ret;
     }
     
     to(row){
    	 if (typeof row == 'string'){
    		 row = this.getRowByID(row);
    	 }
    	 //假定数组中一定是object
    	 if ((this.exist(row) || (row == null))
    			 && (row !== this.getCurrentRow())){
    		 var eventData = {
    			source : this,
    			row : row,
    			originalRow : this.getCurrentRow(),
				cancel : false
			 };
    		 this.fireEvent(Data.EVENT_INDEX_CHANGING, eventData);
    		 if (eventData.cancel) return;
    		 this._currentOB.set(row);
    		 this._updateShareDataCurrentIndex();
    		 this.fireEvent(Data.EVENT_INDEX_CHANGED, eventData);
    	 }
     }
     
     getIdColumn(){
    	 return this.props.options.idColumn;
     }
     
     getColumnDef(name){
    	 return this.props.schema.items.props[name];
     }
     
     find(fields, values, First, CaseInsensitive, PartialKey, all){
    	 if(!isArray(fields)){
        	 var result = this._findItemByFilter(this.value, {key: fields, value: values});
        	 return result;
    	 }else if(isArray(values)){
 			var res = [];
			var len = 0;
			if (values && fields)
				len = values.length > fields.length ? fields.length : values.length;
			if(len>0){
				this.each((p)=>{
					let ok = true;
					let r = p.row;
					for (let i = 0; i < len; i++) {
						var v = this.getValue(fields[i], r);
						if (typeof (v) === 'string') {
							v = !CaseInsensitive ? v : v.toLowerCase();
							var value = !CaseInsensitive ? values[i] : (values[i] + '').toLowerCase();
							ok = ok && (!PartialKey ? v == value : v.indexOf(value) != -1);
						} else
							ok = values[i] == v;
						if (!ok)
							break;
					}
					if (ok) {
						res.push(r);
						if (First) return false;
					}
				});
			}
			return res;
    	 }
     }
     
     bof(){
    	 return this.current === this.getFirstRow(); 
     }
     
     eof(){
    	 return this.current === this.getLastRow(); 
     }
     
	 next(){
		let crow = this.getCurrentItem(), isNext = false;
		this.each((p)=>{
			if (isNext) {
				this.to(p.row);
				return false;
			}
			if (p.row == crow)
				isNext = true;
		});
	 }
	 
	 pre(){ 
		let crow = this.getCurrentItem(), preRow = null;
		this.each((p)=>{
			if (p.row == crow) {
				if (null !== preRow)
					this.to(preRow);
				return false;
			}
			preRow = p.row;
		});
	 }
	 
	 first() {
		 this.to(this.getFirstRow());
	 }
	 
	 last() {
		 this.to(this.getLastRow());
	 }
	 
	 getFirstRow() {
		 if (this.value.length > 0)
			 return this.value[0];
		 else
			return null;
	 }
	
	 getLastRow() {
		 if (this.value.length > 0)
			 return this._lastRow(this.value);
		 else
			 return null;
	 }
	 
	_lastRow(rows) {
		if (rows.length > 0){
			var len = rows.length, ret = rows[len - 1], children = this.getChildren(ret);
			if (children && isObservableArray(children) && (children.length>0))
				return this._lastRow(children);
			else
				return ret;
		}else{
			return null;
		}
	 }
	
	 getCurrentRowID(){
		 return this.getRowID(this.getCurrentItem());
	 }
	 
	 getRowID(row){
		 row = row || this.getCurrentItem();
		 if (row){
			 return row[this.getIdColumn()];
		 }else{
			 return null;
		 }
	 }
	 
	 getIDs(){
		let ret = [];
		let idCol = this.getIdColumn();
		for (let j=0; j<this.value.length;	j++){
			let r = this.value[j];
			ret.push(r[idCol]);
		}
		return ret;
	 }
	 
     //-------------支持当前行结束------------------------
	 buildState(context){
		 var state = super.buildState(context);
    	 state.current = cloneJSON(toJS(this._currentOB, true, null, true), true);
    	 state.agg = toJS(this._aggOB, true, null, true);
    	 return state;
     }
     
     loadAllPageData(options){
    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }
    	 return super.loadAllPageData((options && options.parent) || this.value, options);
     }
     
     loadPageData(index, options){
    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }
    	 return super.loadPageData((options && options.parent) || this.value, index, options);
     }
     
     loadNextPageData(options){
    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }
    	 return super.loadNextPageData((options && options.parent) || this.value, options);
     }
     
     refreshData(options){
    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }
    	 return super.refreshData(options);
     }
     
     remove(value, parent){
    	 parent = parent || this.value;
    	 value = value || this.getCurrentItem();
		 var index = parent.indexOf(value);
    	 super.remove(value, parent);
    	 var isCur = value === this.getCurrentItem();
    	 if(isCur){
    		 var size = parent.length;
    		 if (size==0){
    			 this.to(null);
    		 }else if (index < size){
    			 this.to(parent[index]);
    		 }else {
    			 this.to(parent[index-1]);
    		 }
    	 }
     }
     
     row2json(row, all){
    	 var result = {};
    	 if (row){
    		 result = all ? toJS(row, true, null, true) : toJS(row); 
    		 if (result) result = JSON.parse(JSON.stringify(result));
    	 }
    	 return result;
     }
     
     /*
     _toJSONObj(data){
    	 if (!data) return data;
    	 if (isObservable(data)){
    		 return toJS(data);
    	 }else{
    		 if (data instanceof Array){
    			 var ret = [];
    			 for (let i=0;i < data.length; i++){
    				 ret.push(toJS(data[i]));
    			 }
    			 return ret;
    		 }else{
    			 return data;
    		 }
    	 }
     }
     */
     
     loadFromStorage(key, isNullNew){
    	 let ret = super.loadFromStorage(key);
    	 if(isNullNew && this.getCount()===0){
    		 ret = this.newData();
    	 }
    	 return ret;
     }
     
     //重新处理，parent对应array，parentRow对应树型数据的父
     newData(options){
    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }
    	 return super.newData(options); 
     }
     
 	//新建逻辑
 	doNewData(rows, options) {
 		rows = this.updateIdValue(rows, options);
 		return super.doNewData(rows, options);
 	}
 	
	updateIdValue(rows, options){
		rows = rows || [{}];
		if (!isArray(rows)){
			rows = [rows];
		}
		
		let idColumn = this.getIdColumn();
		let defcol = this.getColumnDef(idColumn);
		if(defcol && ('string'===defcol.type)){
			for (let i=0; i<rows.length; i++){
				if (!rows[i].hasOwnProperty(idColumn)){
					let uuid = new UUID().toString();
					rows[i][idColumn] = uuid.replace(/-/g,'').toUpperCase();
				}
			}
		}
		
		let propVerLock = this.getVersionLock();
		if(propVerLock){
			for (let i=0; i<rows.length; i++){
				if (!rows[i].hasOwnProperty(propVerLock.name)){
					rows[i][propVerLock.name] = 0;
				}
			}
		}
		
		//树形数据的
		if (this.isTree() && options.parentRow) {
			let treeOption = this.getTreeOption();;
			let parentId = this.getRowID(options.parentRow);
			for (let i=0; i<rows.length; i++){
				rows[i][treeOption.parent] = parentId;
			}
		}

		let masterRelation,masterRowId;
		if(this.master && this.master.masterData){
			var masterData = this.master.masterData;
			var masterRow = masterData.getCurrentRow();
			masterRowId = masterData.getRowID(masterRow);
			masterRelation = this.master.relation;
			
			if(masterRelation){
				for (let i=0; i<rows.length; i++){
					rows[i][masterRelation] = masterRowId;
				}
			}
		}
		
		return rows;
	}
     
     getOrderBys() {
    	 return this.getArrayOrderBys(this.value);
     }
     
     getOderBysObj(){
    	 return this._getArrayOrderBys(this.value);
     }
     
     setOrderBy(name, type) {
    	 return this.setArrayOrderBy(this.value, name, type);
     }
     
	 clearOrderBy(){
		 let items = this.getOderBysObj();
		 if(isArray(items)&&items.length>0){
			 for (let i=items.length-1; i>=0; i--){
				 this.setOrderBy(items[i].name);
			 }
		 }
	 }
	 
	 getOrderBy(name){
    	 return this.getArrayOrderBy(this.value, name);
     }

	 /*
	  * 获取树型数据行的子,如果不存在就创建
	  */
	 _getChildren(parentRow){
		 if(!this.isTree()||!parentRow){
			 return this.value;
		 }else{
			 let rows = this.getChildren(parentRow);
			 if(!rows){
	 			let treeOp = this.getTreeOption();
				let o = {};
				o[treeOp.children] = [];
		 		extendObservable(parentRow,o);
		 		rows = this.getChildren(parentRow);
			 }
			 return rows;
		 }
	 }
	 
     hasMore(parentRow){
   		 return this.hasArrayMore(this._getChildren(parentRow));
     }
     
     isLoaded(parentRow){
    	 return this.isArrayLoaded(this._getChildren(parentRow));
     }
     
     setLoaded(parentRow, loaded){
    	 this.setArrayLoaded(this._getChildren(parentRow),loaded);
     }
     
     getTotal(parentRow){
   		 return this.getArrayTotal(this._getChildren(parentRow));
     }
     
     setTotal(total,parentRow){
   		 this.setArrayTotal(this._getChildren(parentRow), total); 
     }
     
     setLimit(limit,parentRow){
    	 this.setArrayLimit(this._getChildren(parentRow), limit);
     }
     
     getLimit(parentRow){
		 return this.getArrayLimit(this._getChildren(parentRow));
     }
     
     setOffset(offset,parentRow){
    	 this.setArrayOffset(this._getChildren(parentRow), offset);
     }
     
     getOffset(parentRow){
   		 return this.getArrayOffset(this._getChildren(parentRow));
     }
     
     getCount(parentRow){
		if (!this.isTree())
			return this.value.length;
		else {
			let len = 0;
			this.each((p)=>{
				len++;
			}, parentRow);
			return len;
		}
     }
     
     deleteData(rows, options){
    	 rows = rows || this.getCurrentRow();
    	 if (!isArray(rows)){
    		 rows = [rows];
    	 }
    	 for (let i=0; i<rows.length; i++){
    		 if (rows[i] && !isObservableObject(rows[i]) && !isObservableArray(rows[i])){
    			 rows[i] = this.getRowByID(rows[i]);
    		 }
    	 }

    	 if(options && options.parentRow){
    		 options.parent = this._getChildren(options.parentRow);
    	 }    	 
    	 return super.deleteData(rows, options);
     }
     
     initOperation(){
    	 super.initOperation();
    	 
    	 this.defineOperation('clear', {
    		 label : "清空",
    		 icon : 'icon-minus',
    		 init : function() {
    		 },
    		 method : function(args) {
    			 return this.owner.clear();
    		 }
    	 });
    	 
    	 this.defineOperation('save', {
    		 label : "保存",
    		 icon : 'glyphicon glyphicon-floppy-disk',
    		 init : function() {
    			 return ; //暂时不计算只读
    			 var op = this, data = this.owner, canSave = function() {
    				 op.setEnable(!data.getReadonly() && data.isChanged());
    			 };
    			 this.owner.on(Data.EVENT_DATA_CHANGE, canSave);
    			 this.owner.on(Data.EVENT_SAVEDATA_AFTER, canSave);
    			 this.owner.on(Data.EVENT_INDEX_CHANGED, canSave);
    		 },
    		 method : function(args) {
    			 return this.owner.saveData();
    		 }
    	 });
    	 
    	 this.defineOperation('delete', {
    		    label: "删除",
    		    icon: 'icon-minus',
    		    init: function(){
    		    	return ; //暂时不计算只读
    				var op = this, data = this.owner, canDel = function() {
    					setTimeout(function(){
    						op.setEnable(!data.getReadonly() && data.getCount() > 0 && !!data.getCurrentItem(true));
    					},1);
    				};
    				this.owner.on(Data.EVENT_DATA_CHANGE, canDel);
    				this.owner.on(Data.EVENT_INDEX_CHANGED, canDel);
    		    },
    			argsDef : [ {
    				name : 'rows',
    				displayName : "删除的数据"
    			} ],
    			method : function(args) {
    				return this.owner.deleteData(args.rows);
    			}
    	});
    	 
    	 this.defineOperation('deleteAll', {
 		    label: "删除全部",
 		    icon: 'icon-minus',
 		    init: function(){
 		    	return ; //暂时不计算只读
 				var op = this, data = this.owner, canDel = function() {
 					setTimeout(function(){
 						op.setEnable(!data.getReadonly() && data.getCount() > 0);
 					},1);
 				};
 				this.owner.on(Data.EVENT_DATA_CHANGE, canDel);
 		    },
 			argsDef : [{
				name : 'force',
				displayName : '禁止提示'
			},{
				name : 'confirmText',
				displayName : '删除提示'
			}],
 			method : function(args) {
				var option = {};
				option.confirm = typeof(args.force)==='string'?('true'!==args.force):!args.force;
				option.confirmText = args.confirmText;
 				return this.owner.deleteAllData(option);
 			}
    	 });

    	 this.defineOperation('new', {
			label : "新建",
			icon : 'icon-plus',
			init : function() {
				var op = this, data = this.owner, canNew = function() {
					setTimeout(function(){
						op.setEnable(!data.getReadonly());
					},1);
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, canNew);
				this.owner.on(Data.EVENT_INDEX_CHANGED, canNew);
			},
			argsDef : [ {
				name : 'defaultValues',
				displayName : "默认值"
			},
			{
				name : 'index',
				displayName : "序号"
			}],
			method : function(args) {
				return this.owner.newData(args);
			}
		});
    	
    	this.defineOperation('refresh', {
			label : "刷新",
			icon : 'icon-refresh',
			argsDef : [ {
				name : 'force',
				displayName : '禁止提示'
			} ],
			method : function(args) {
				var option = {};
				option.confirm = typeof(args.force)==='string'?('true'!==args.force):!args.force;
				return this.owner.refreshData(option);
			}
		});
    	
    	this.defineOperation('firstRow', {
			label : "第一行",
			icon : 'icon-chevron-left',
			init : function() {
				return ; //暂时不计算只读
				var op = this, data = this.owner, can = function() {
					var len = data.getCount();
					op.setEnable(len > 1 && data.getFirstRow()!==data.getCurrentItem(true));
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
				this.owner.on(Data.EVENT_INDEX_CHANGED, can);
			},
			method : function() {
				return this.owner.first();
			}
		});
    	
    	this.defineOperation('prevRow', {
			label : "前一行",
			icon : 'icon-chevron-left',
			init : function() {
				var op = this, data = this.owner, can = function() {
					var len = data.getCount();
					op.setEnable(len > 1 && data.getFirstRow()!==data.getCurrentItem(true));
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
				this.owner.on(Data.EVENT_INDEX_CHANGED, can);
			},
			method : function() {
				return this.owner.pre();
			}
		});
    	
    	this.defineOperation('nextRow', {
			label : "下一行",
			icon : 'icon-chevron-right',
			init : function() {
				var op = this, data = this.owner, can = function() {
					var len = data.getCount();
					op.setEnable(len > 1 && data.getLastRow()!==data.getCurrentItem(true));
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
				this.owner.on(Data.EVENT_INDEX_CHANGED, can);
			},
			method : function() {
				return this.owner.next();
			}
		});
    	
    	this.defineOperation('lastRow', {
			label : "最后一行",
			icon : 'icon-chevron-right',
			init : function() {
				var op = this, data = this.owner, can = function() {
					var len = data.getCount();
					op.setEnable(len > 1 && data.getLastRow()!==data.getCurrentItem(true));
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
				this.owner.on(Data.EVENT_INDEX_CHANGED, can);
			},
			method : function() {
				return this.owner.last();
			}
		});
    	
    	this.defineOperation('loadPage', {
			label : "加载页",
			icon : '',
			argsDef : [ {
				name : 'pageIndex',
				displayName : "页"
			} ],
			method : function(args) {
				var data = this.owner;				
				var pageIndex = args.pageIndex-0;
				(isNaN(pageIndex)||'number'!=typeof(pageIndex))&&(pageIndex = 1);
				return data.loadPageData(pageIndex);
			}
		});
    	
    	this.defineOperation('firstPage', {
			label : "第一页",
			icon : 'icon-chevron-left',
			init : function() {
				var op = this, data = this.owner, can = function() {
					op.setEnable(data.getLimit()!=-1 && data.getOffset()>data.getLimit());
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
			},
			method : function(args) {
				return this.owner.loadPageData(1);
			}
		});
    	
    	this.defineOperation('prevPage', {
			label : "上页",
			icon : 'icon-chevron-left',
			init : function() {
				var op = this, data = this.owner, can = function() {
					op.setEnable(data.getLimit()!=-1 && data.getOffset()>data.getLimit());
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
			},
			method : function(args) {
				var data = this.owner;
				var pageIndex = data.getOffset()/data.getLimit() - 1;
				return data.loadPageData(pageIndex);
			}
		});
    	
    	this.defineOperation('nextPage', {
			label : "下页",
			icon : 'icon-chevron-right',
			init : function() {
				var op = this, data = this.owner, can = function() {
					op.setEnable(data.getLimit()!=-1 && data.getOffset()<=data.getTotal());
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
			},
			method : function(args) {
				var data = this.owner;
				var pageIndex = data.getOffset()/data.getLimit() + 1;
				return data.loadPageData(pageIndex);
			}
		});
    	 
    	this.defineOperation('lastPage', {
			label : "最后页",
			icon : 'icon-chevron-right',
			init : function() {
				var op = this, data = this.owner, can = function() {
					op.setEnable(data.getLimit()!=-1 && data.getOffset()<=data.getTotal());
				};
				this.owner.on(Data.EVENT_DATA_CHANGE, can);
			},
			method : function(args) {
				var data = this.owner,mod=data.getTotal()%data.getLimit();
				var pageIndex = Math.round(data.getTotal()/data.getLimit()-0.5) + (mod===0?0:1);
				return data.loadPageData(pageIndex);
			}
		});
    	
    	this.defineOperation('loadNextPage', {
			label : "下页",
			icon : 'icon-chevron-right',
			method : function() {
				return this.owner.loadNextPageData();
			}
		});
    	
    	this.defineOperation('loadAllPage', {
			label : "全部",
			icon : 'icon-chevron-right',
			method : function() {
				return this.owner.loadAllPageData();
			}
    	});
    	
    	this.defineOperation('saveToStorage', {
			label : "保存到Storage",
			argsDef : [ {
				name : 'key',
				displayName : '键值'
			} ],
			icon : '',
			method : function(args) {
				return this.owner.saveToStorage(args.key);
			}
    	});
    	
    	this.defineOperation('loadFromStorage', {
			label : "从Storage加载",
			argsDef : [ {
				name : 'key',
				displayName : '键值'
			},{
				name : 'isNullNew',
				displayName : '为空新增'
			} ],
			icon : '',
			method : function(args) {
				return this.owner.loadFromStorage(args.key,args.isNullNew);
			}
    	});
    	
    	this.defineOperation('removeStorage', {
			label : "删除Storage",
			argsDef : [ {
				name : 'key',
				displayName : '键值'
			} ],
			icon : '',
			method : function(args) {
				return this.owner.removeStorage(args.key);
			}
    	});
    	
     }
     
}

TableData.getMainData = function(page){
	return page?page.$mainData:null; 
};

wx.comp = wx.comp || {};
wx.comp.TableData = TableData;

