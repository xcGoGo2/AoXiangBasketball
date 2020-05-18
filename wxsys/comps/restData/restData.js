import wx from '../../lib/base/wx';
import TableData from "../tableData/tableData";
import Data from "../tableData/data";
import {observable, extendObservable, autorun, toJS, isObservableArray, isObservableObject, isObservable } from  "../../lib/mobx/mobx-2.6.2.umd";
import {parsePath} from "../../lib/base/pageImpl";
import _String from "../../lib/base/string";
import {isArray, isObject} from "../../lib/base/util";
import _Date from "../../lib/base/date";

function isNumeric(obj){
	return !isNaN( parseFloat(obj) ) && isFinite( obj )
}

class Filter{
	constructor(){
		this.filterList = {};
		this.variables = {};
	}
	
	clear() {
		for ( var o in this.filterList)
			delete this.filterList[o];
		this.clearVars();
	}

	clearVars() {
		this.variables = {};
	}

	getVar(name) {
		return this.variables["__"+name];
	}

	setVar(name, ver) {
		return this.variables["__"+name] = ver;
	}

	setFilter(name, filter) {
		this.filterList[name] = filter;
	}

	getFilter(name) {
		return this.filterList[name];
	}

	deleteFilter(name) {
		delete this.filterList[name];
	}
}

var fns = {};
var names = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte', 'like', 'ilike', 'nlike', 'nilike', 'is', 'inn', 'not', 'isNull', 'isNotNull', 'LBRAC', 'RBRAC'];
for (let i=0; i<names.length; i++){
	let name = names[i];
	fns[name] = function(relation, value, kind, $$dataObj){
		if(('isNull'===name || 'isNotNull'===name) && false===value) return "";//增加isNull，isNotNull动态生效条件
		//兼容只传入三个参数模式
		if(kind instanceof RestData){
			$$dataObj = kind;
			kind = '';
		}
		if('LBRAC'===name){//小括号支持
			return ((typeof(kind)==='string' && 'or'===kind.toLowerCase())?'or':'') + "(";
		}else if('RBRAC'===name) return ")";
		//当操作符不是is时，忽略value为undefined，null，NaN的条件
		if(value===undefined || value===null || value==="" || (typeof(value)==='number' && isNaN(value))){
			if('is'!==name && 'isNull'!==name && 'isNotNull'!==name && 'LBRAC'!==name && 'RBRAC'!==name) return "";
			else value = null;
		}
		
		if ($$dataObj && $$dataObj.getColumnDef){
			var def = $$dataObj.getColumnDef(relation);
			if (def && def.define && (def.define != relation)){
				relation = def.define;
			}
			//date，time，dateTime
			if(def && def.type && value && 'string'===typeof(value)){
				var type = def.type.toLowerCase();
				//if(type==='date') value = _Date.fromString(value,_Date.STANDART_FORMAT_SHOT);
				//else 
				if(type==='time') value = _Date.fromString(value,_Date.STANDART_TIME_FORMAT);
				else if(type==='datetime') value = _Date.fromString(value,_Date.STANDART_FORMAT);
			}
			if(def && def.type && value instanceof Date){
				if(def.type.toLowerCase()==='date') value = _Date.toString(value,_Date.STANDART_FORMAT_SHOT);
			}
			if (value instanceof Date){
				value = value.toISOString();
			}
			if($$dataObj.join){//有join时才使用表名
				var table = (def && (def.tableAlias || def.table)) || $$dataObj.tableName;
				if(table) relation = table+"."+relation;
			}
		}
		let fnName = name;
		if(name=='like'||name=='ilike'||name=='nlike'||name=='nilike'){
			if(value){
				if((value+'').indexOf('*')<0) value = '*' + value + '*';
			}else value = '*';
			if(name=='nlike') fnName = 'not.like';
			else if(name=='nilike') fnName = 'not.ilike';
		}else if(name=='isNull'){
			value = null;
			fnName = 'is';
		}else if(name=='isNotNull'){
			value = null;
			fnName = 'not.is';
		}
		
		return ((typeof(kind)==='string' && 'or'===kind.toLowerCase())?'or.':'')+relation + "=" + ('inn'!==fnName?fnName:'in') + "." + (isArray(value)?value.join(','):value);
	}
}

const netErrorTxt = "网络不给力哦～";

export default class RestData extends TableData {
	constructor(page, id, props, context){
		super(page, id, props, context);
	}

	init(){
		this.filters = new Filter();
		this.directDeleteMode = true;  //默认直接删除
		this.filterFns = fns;
		this.useHeaderOffset = false;
		super.init();
	}
	
	_initDefinition() {
		this.className = this.props.options.className || "";
		if(this.className[0]!=='/') this.className = "/"+this.className;

		this.tableName = this.props.options.tableName || "";
		this.url = this.props.options.url || "/dbrest";
		this.autoMode = this.props.options.autoMode;
		this.join = this.props.options.join;
		super._initDefinition();
		this._initJoin();
	}

	_initJoin(){
		//处理join定义中重复的rightTable
		if(isArray(this.join)){
			let rightTables = {};
			for(let i=0,len=this.join.length;i<len;i++){
				let join = this.join[i];
				let rightTable = join['rightTable'];
				if(!rightTables[rightTable])
					rightTables[rightTable] = 1;
				else{
					join['rightTableAlias'] = rightTable + rightTables[rightTable]; 
					rightTables[rightTable] = rightTables[rightTable]+1;
					let columns = join['columns'];
					if(isArray(columns))
						for(let j=0,len1=columns.length;j<len1;j++){
							let col = columns[j];
							let defCol = this.getColumnDef(col.name);
							if(defCol) defCol['tableAlias'] = join['rightTableAlias'];
						}
				}
			}
		}
	}
	
    _initData(force){
		super._initData(force);
    }
	
	buildUrl(params) {
		var baseUrl = wx.App.baseUrl || "";
		if(window && window.microService && window.microService.isMicroService){
			baseUrl = baseUrl + "/" + this.page.basePath;
		}
		var url = baseUrl + this.url;
		url = url + "/" + this.tableName;
		if (params) {
			if (isArray(params)) {
				if(params.length>0){
					url += "?";
					for (var i = 0; i < params.length; i++) {
						url += ((i === 0 ? "" : "&") + params[i]);
					}
				}
			} else {
				url += "?";
				url += params;
			}
		}
		return url;
	}
	
	getFilter(name) {
		return this.filters.getFilter(name);
	}
	
	setFilter(name, filter) {
		return this.filters.setFilter(name, filter);
	}	
	
	_hasIDParam(){
		var paramName = this.className+".id";
		return  this.page.params.hasOwnProperty(paramName);					
	}
	
	_getIDParam(){
		var paramName = this.className+".id";
		return  this.page.params[paramName];					
	}
	
	// 重新实现orderBy
	getOrderBys() {
		var ret = [];
		var items = this.getOderBysObj();
		for ( var i=0;i<items.length;i++) {
			var o = items[i];
			ret.push(o.name + "." + (0 === o.type ? 'desc' : 'asc'));
		}
		return ret.length>0?"order="+ret.join(","):null;
	}
	
	isRequestError(res){
		if (res.hasOwnProperty("statusCode")){
			return !((res.statusCode >= 200) && (res.statusCode < 300));
		}else{
			return res.data && res.data.hasOwnProperty("exception");
		}
	}
	
	//保存逻辑
	doSaveData(options) {
		let result = false;
		options = options || {};
		let saveAllData = !!options.allData;
		let self = this;

		let headers = {
				'content-type': 'application/json',
				'SAVE-METHOD' : 'PUT',
				"X-SERVICE" : this.getService()
			};
		let param = [];
		let propVerLock = this.getVersionLock();
		if(propVerLock) param.push(_String.format("{0}={1}", '$versionLock', propVerLock.define || propVerLock.name));
		
		if(saveAllData){//全数据保存,包括新增和修改的数据
			param.push(_String.format("{0}={1}", 'pk', this.getIdColumn()));
			let rowsData = [];
			this.each((p)=>{
				let state = p.row.getState();
				if (Data.STATE.NEW == state || Data.STATE.EDIT == state || this.isSlaveChanged()){
					rowsData.push(this.processSaveRow(this.row2json(p.row)));
				}
			});
			if(rowsData.length>0){
				wx.request({
					url: this.buildUrl(param),
					header: headers,
					dataType: 'json',
					method: 'PUT',
					data: rowsData,
					success: function(res){
						if (self.isRequestError(res)){
							self._saveError(res, options);
						}else{
							self._saveSuccess(null, options);	
						}
					},
					fail: function(err){
						self._saveError({data:netErrorTxt}, options);
					}
				});
			}
			result = true;
		}else{
			let row = options.row || options.item || options.value || this.getCurrentItem();
			if (row) {
				let state = row.getState();
				if (Data.STATE.NEW == state || Data.STATE.EDIT == state || this.isSlaveChanged()) {
					let isNew = (Data.STATE.NEW === state);
					let method = isNew ? "POST" : "PUT";
					!isNew && param.push(this.getIdColumn() + "=eq." + this.getRowID(row));
					wx.request({
						url: this.buildUrl(param),
						header: headers,
						dataType: 'json',
						method: method,
						data: this.processSaveRow(this.row2json(row)),
						success: function(res){
							if (self.isRequestError(res)){
								self._saveError(res, options);
							}else{
								self._saveSuccess(null, options);	
							}
						},
						fail: function(err){
							self._saveError({data:netErrorTxt}, options);
						}
						
					});
					result = true;
				}
			}
		}

		return {
			success : result,
			async : true
		};
	}
	
	isCalculateCol(col) {
		if (col) {
			if ('string' === typeof (col))
				col = this.getColumnDef(col);
			if ('object' === typeof (col)) {
				return "EXPRESS" === col.define || "STATISTICAL" == col.define;
			}
		}
	}
	
	processSaveRow(row, ignoreSlave){
		if(row){
			let idCol = this.getIdColumn();
			let id = row[idCol];
			//转换成真实的
			delete row['_recoredState'];
			for(var col in row){
				var defCol = this.getColumnDef(col);

				if(this.isCalculateCol(defCol)) delete row[col];
				else if(defCol && defCol.table && defCol.table!==this.tableName) delete row[col];
				else if(defCol && defCol.define && col!=defCol.define){
					row[defCol.define] = row[col];
					delete row[col];
				}
			}
			//目前只支持一条主记录，所以增加判断当前行.id==row.id的才处理从数据
			if(this.current && this.current[idCol]===id){
				if(!ignoreSlave){
					//增加从数据处理
					var slaveRows = this.processSlaveSaveRow(row);
					if(isArray(slaveRows) && slaveRows.length>0){
						for(let i=0; i<slaveRows.length; i++){
							let v = slaveRows[i];
							row[v.key+(v.$versionLock?("@$versionLock="+v.$versionLock):"")] = v.rows; 
						}
					}
				}
			}　
		}
		return row;
	}
	
	processSlaveSaveRow(row){
		var len = this.slaveDatas.length;
		if(len>0){
			var ret = [];
			for ( let i = 0; i < len; i++) {
				var slaveData = this.slaveDatas[i];
				if (slaveData){
					let idCol = slaveData.getIdColumn();
					let defColID = slaveData.getColumnDef(idCol);
					let key = slaveData.tableName + '.' + (defColID.define||idCol);
					let rows = [];
					let versionLock = null;
					let propVerLock = slaveData.getVersionLock();
					if(propVerLock) versionLock = propVerLock.define || propVerLock.name;
					
					for (let j=0,len=slaveData.value.length; j<len; j++){
						rows.push(slaveData.processSaveRow(slaveData.row2json(slaveData.value[j])));
					}
					
					if(rows.length>0) ret.push({key: key, $versionLock:versionLock, rows: rows});
				}						
			}
			return ret;
		}
	}
	
	/*TODO
	function add(row, parent, disableCursor, nopush){
		//处理真正的物理映射
		for ( var k in this.defCols) {
			var field = this.defCols[k].define;
			if(!row.hasOwnProperty(k) && field) row[k] = row[field];
		}
		return this.callParent(row, parent, disableCursor, nopush);
	}
	*/
	
	_saveSuccess(data, options) {
		var eventData = {
			source : this,
			data : data
		};
		this.doSaveAfter(true, options, eventData);
	}
	
	 _getErrMsg(err) {
		 return this._getPgsqlErrMsg(err) || this._getMysqlErrMsg(err) || (err && err.data && err.data.exception);
	  }
	 
	 _getPgsqlErrMsg(err){
			let msg = err && err.data && err.data.exception;
			const str1 = "duplicate key value";
			const str2 = ")=(";
			const str3 = ") already exists.";
			const str4 = "value too long for type";
			const str5 = "For input string: ";
			if (msg) {
				let ipos;
				if(msg.indexOf(str1)>-1){
					ipos = msg.indexOf(str2);
					if(ipos>-1) return msg.substring(ipos + str2.length).replace(str3," 是已经存在的值");
				}else if(msg.indexOf(str4)>-1){
					return "数据长度超出范围("+msg+")";
				}else if(msg.indexOf(str5)>-1){
					ipos = msg.indexOf(str5);
					if(ipos>-1) return msg.substring(ipos + str5.length)+" 值无法存储，可能数据长度超出范围";
				}
			}
	 }
	 
	 _getMysqlErrMsg(err){
			let msg = err && err.data && err.data.exception;
			const list = [{str1:"Duplicate entry ",str2:" for key",info:" 是已经存在的值"},{str1:"Data truncation: Data too long for column ",str2:" at row",info:"数据长度超出范围"},{str1:"Data truncation: Out of range value for column ",str2:" at row",info:"数据长度超出范围"}];

			if (msg) {
				for(let i=0;i<list.length;i++){
					let item = list[i];
					if(msg.indexOf(item.str1)===0){
						let ipos = msg.indexOf(item.str2);
						if(ipos>-1) return msg.substring(item.str1.length, ipos) + item.info;
					}
				}
			}
	 }
	  
	_saveError(info, options) {
		var b = this.hasListener(Data.EVENT_SAVEDATA_ERROR);
		if (!b) {
			let str = info.statusCode!=412?this._getErrMsg(info):"版本锁冲突";
			this.showModalError({message: "保存数据失败" + (str?(","+str):"")});
		}
		var eventData = {
				'errorType' : 'server',
				'info' : info,
				'source' : this
		};
		this.doSaveAfter(false, options, eventData);
	}
	
	deleteAllData(options){
		options = options || {};
		var retPromise = this._createPromise(options);
		
		var fn = () => {
			var self = this;
			wx.request({
				method: "DELETE",
				url: this.buildUrl(),
				header: {"X-SERVICE":this.getService()},
				dataType: "json",
				success: function(res){
					if (self.isRequestError(res)){
						this.showModalError({message: "删除全部数据失败"}); //将来使用参数或属性来控制是否显示错误信息
						options.onError();
					}else{
						self._clear(self.value);
						options.onSuccess();
					}
				},
				fail: function(){
					this.showModalError({message: "网络不给你哦～"}); //将来使用参数或属性来控制是否显示错误信息
					options.onError();
				}
			});
		};

		var confirmDelete = this.confirmDelete;
		if (options && options.hasOwnProperty("confirm")){
			confirmDelete = options.confirm;
		}
		if (confirmDelete){
			var confirmDeleteText = options.confirmText||this.confirmDeleteText;
			this._confirm(confirmDeleteText, fn, null);
		}else{
			fn();
		}
		 
		return retPromise;
	}

	//删除逻辑
	doDirectDeleteData(rows, options) {
		let delRows = [];
		if (rows && rows.length>0){
			let i,len = rows.length;
			for (i = 0; i < len; i++) {
				var row = rows[i];
				if (Data.STATE.NEW != row.getState()) {
					delRows.push(row);
				}
			}
		}

		var param = delRows.length>0?this.getDeleteParam(delRows):null;
		if (param) {
			var self = this;
			var result = true;
			var headers = {"X-SERVICE":this.getService()};
			
			wx.request({
				method: "DELETE",
				url: this.buildUrl(param),
				header: headers,
				dataType: "json",
				success: function(res){
					if (self.isRequestError(res)){
						self._deleteError(res, rows, options);
					}else{
						var eventData = {
							'source' : self,
							'deleteValue' : rows
						};
						self.doDeleteAfter(true, options, eventData);
					}
				},
				fail: function(res){
					self._deleteError(res, rows, options, netErrorTxt);
				}
			});
			return {success : result, async : true};
		}else{
			return {success : true,	async : false};	
		}		
	}
	
	_deleteError(response, rows, options, info){
		var onError = options ? options.onError : null;
		var eventData = {
			'errorType' : 'server',
			'deleteValue': rows,
			'response': response,
			'source' : this
		};
		var b = this.hasListener(Data.EVENT_DELETEDATA_ERROR);
		if (!b) {
			this.showModalError({message: info||"删除数据失败"});
		}
		this.doDeleteAfter(false, options, eventData);
	}
	
	getDeleteParam(rows) {
		if (!rows)
			return;
		let ids = [];
		let i,len = rows.length;
		for (i = 0; i < len; i++) {
			let row = rows[i];
			if (Data.STATE.NEW != row.getState()) {
				ids.push(this.getRowID(row));
			}
		}

		//增加级联删除从表处理,cascade=主表主键名称.子表名称.子表外键名称多个使用','风格
		//目前支持两层主从级联删除
		let idCol = this.getIdColumn();
		let defColID = this.getColumnDef(idCol);
		let idColName = (defColID && defColID.define) || idCol;
		let cascade = [];
		len = this.defSlaves.length;
		if(len>0){
			for ( i = 0; i < len; i++) {
				let slaveData = this.defSlaves[i];
				if (slaveData && slaveData.table && slaveData.field){
					cascade.push(idColName + '.' + slaveData.table + '.' + slaveData.field);
				}						
			}
		}

		let ret = [];
		//版本锁
		let propVerLock = this.getVersionLock();
		if(propVerLock) ret.push(_String.format("{0}={1}", '$versionLock', propVerLock.define || propVerLock.name));
		
		if(ids.length > 0) ret.push(idColName + "=in." + ids.join(","));
		if(cascade.length > 0) ret.push("cascade="+cascade.join(","));

		return ret.length>0?ret.join("&"):null;
	}
	

	//刷新逻辑
	doRefreshData(options) {
		this.open = true;
		let parentRow = options ? options.parentRow : null;
		return this._doRefreshData(this.getOffset(parentRow), this.getLimit(parentRow), options);
	}
	
	hasJoinCol(){
		if(isArray(this.join) && this.join.length>0){
			for(var i=0;i<this.join.length;i++){
				var columns = this.join[i].columns;
				if(isArray(columns) && columns.length>0) return true;
			}
		}
		return false;
	}

	getSelectColumns() {
		if(!this.hasJoinCol()){
			//if(this.props.options.isAllColumns)return '*';
			//else{
			{//全部使用as模式，解决字段大小写问题
				let result = [];
				let items = this.getColumnDefs();
				for ( let o in items) {
					if(!this.isCalculateCol(o)){
						let field = items[o].define;
						if(field==o) result.push(field);
						else result.push(_String.format("{0} as \"{1}\"", field, o));
					}
				}
				return result.join(this.delim);
			}
		}else{
			let result = [];
			//if(this.props.options.isAllColumns) result.push(this.tableName+".*");
			let items = this.getColumnDefs();
			for ( let o in items) {
				if(!this.isCalculateCol(o)){
					let tableName = items[o].tableAlias || items[o].table;
					//if(this.props.options.isAllColumns && !tableName) continue;
					//if(!tableName) continue;//全部使用as模式，解决字段大小写问题
					tableName = tableName || this.tableName;
					let field = items[o].define;
					result.push(_String.format("{0}.{1} as \"{2}\"", tableName, field, o));
				}
			}
			return result.join(this.delim);
		}
	}
	
  	canSmartLoad(){
  		let smartLoad = super.canSmartLoad();
  		if(!smartLoad){
  			//进行restData判断
  			smartLoad = this.smartKey===this.oldSmartKey;
  		}
  		return smartLoad;
  	}

  	getService(){
  		let servicePath = this.className||"";
  		let ipos = servicePath.lastIndexOf("/");
  		if(ipos>0) return servicePath.substring("/"===servicePath[0]?1:0,ipos);
  		else return "";	
  	}
  	
	_doRefreshData(offset, limit, options) {
		//restData 频繁刷新控制，5秒内刷新连续10次抛出异常
		let now = new Date();
		let _refreshFlag = this._refreshFlag || (this._refreshFlag={})
		if(_refreshFlag._refreshTimestamp && _refreshFlag.offset==offset  && _refreshFlag.limit==limit && (now.getTime()-_refreshFlag._refreshTimestamp.getTime())<(5*1000)){
			_refreshFlag._refreshCount++;
			if(_refreshFlag._refreshCount>10)
				throw new Error("中断当前刷新操作，原因：过于频繁刷新数据，确认代码是否存在刷新死循环！");
		}else{
			_refreshFlag._refreshTimestamp = now;
			_refreshFlag._refreshCount = 1;
			_refreshFlag.offset = offset;
			_refreshFlag.limit = limit;
		}
		
		var onError = null, onSuccess = null, onLoad;
		if (options) {
			if ("function"===typeof options)
				onSuccess = options;
			else {
				onError = options.onError;
				onSuccess = options.onSuccess;
				onLoad = options.onLoad;
			}
		}

		var queryParam = this._createRefreshParam(offset, limit, options ? options.append : false, options);
		if (!queryParam)
			return false;

		var params = this._getQueryParam(queryParam);
		var headers = {"X-SERVICE":this.getService()};
		if (isNumeric(queryParam.limit) && queryParam.limit > 0) {
			if(this.useHeaderOffset){
				headers['Range-Unit'] = 'items';
				headers['Range'] = queryParam.offset + "-" + (queryParam.offset + queryParam.limit - 1);
			}
			headers['X-Output-Count'] = 1;
		}

		var self = this;
		wx.request({
			method: "GET",
			dataType: "json",
			header: headers,
			url: this.buildUrl(params),
			success: function(res){
				if (self.isRequestError(res)){
					self._refreshError(res, onError, options);	
					return;
				}
				var items = res.data || [];
				let hasRecordCount = items.length && undefined!==items[0].recordCount;
				var count = items.length>0 ? (items[0].recordCount + '') : '0';
				var data = hasRecordCount?items.splice(1):items;
				if (0===offset){
					if (count) {
						var ipos = count.lastIndexOf("/");
						if (ipos > -1)
							count = count.substring(ipos + 1);
						count = parseInt(count, 10);
						self.setTotal(count, options ? options.parentRow : null);
					}
				}
				
				if ("function" === typeof onLoad){
					onLoad({source: self, rows: data});
				}
				self.loadData(data, options ? options.append : false, options ? options.parent : null,undefined);
				self.oldSmartKey = self.smartKey;
				var eventData = {
					source : self,
					rows : data
				};				
				self.doRefreshAfter(true, options, eventData);
			},
			fail: function(res){
				self._refreshError(res, onError, options, netErrorTxt);
			}
			
		});
		
		//默认查询首页数据时查询统计数据
		if(0===offset && this.defAggCols){
			this.refreshAggregateValue(options ? options.parentRow : null);
		}
		
		return {
			success : true,
			async : true
		};
	}
	
	_getQueryAggregateParam(queryParam) {
		var ret = [];
		if(queryParam.aggColumns) ret.push("select="+queryParam.aggColumns);
		if(isArray(queryParam.filter))
			for(let i in queryParam.filter){
				let filter = queryParam.filter[i];
				ret.push(filter);
			}
		return ret.length>0?ret:null; 
	}

	refreshAggregateValue(parentRow){
		var queryParam = this._createRefreshParam(0, 20, false, {parentRow:parentRow});
		if (!queryParam)
			return false;
		var params = this._getQueryAggregateParam(queryParam);
		if(!params) return;
		var self = this;
		var ret = new Promise(function(resolve, reject){
			wx.request({
				type : "GET",
				dataType : "json",
				header : {"X-SERVICE":self.getService()},
				url : self.buildUrl(params),
				success : function(res) {
					if (self.isRequestError(res)){
						self._refreshError(res, null, {});	
						reject(res);
						return;
					}
					var items = res.data || [];
					var o = isArray(items)?(items.length>0?items[0]:{}):items,fn;
					for ( var c in self.defAggCols) {
						fn = self.defAggCols[c];
						if(o.hasOwnProperty(fn))
							self._aggOB[c] = o[fn];
					}
					resolve(res);
				},
				fail : function(res) {
					self._refreshError(res, null, {}, netErrorTxt);
					reject(res);
				}
			});
		});
		//防止Uncaught (in promise)异常
		ret.catch(()=>{});
		
		return ret;
	}

	_refreshError(response, onError, options, info){
		var eventData = {
			'errorType' : 'server',
			'response' : response,
			'source' : this
		};
		var b = this.hasListener(Data.EVENT_REFRESHDATA_ERROR);
		if (!b) {
			this.showError({message:info||"数据加载失败"});
		}
		this.doRefreshAfter(false, options, eventData);				
	}
	
	_createRefreshParam(offset, limit, append, options) {
		var queryParam = {};
		// 主从过滤处理
		if (this.master) {
			//TODO 主从数据查询处理
			var masterData = this.master.masterData, masterRow = masterData && masterData.getCurrentRow();
			if (!masterRow){
				console.warn('从数据查询时缺少主数据');
				return false;
			}
			if (masterData) {
				let masterRowId = masterData.getRowID(masterRow);
				if (!masterRowId){
					console.warn('从数据查询时缺少主数据');
					return false;
				}
				let def = this.getColumnDef(this.master.relation);
				let masterRelationName = (def && def.define)||this.master.relation;
				if(this.hasJoinCol()){//有join时才使用表名
					let table = (def && def.tableAlias) || (def && def.table) || this.tableName;
					if(table) masterRelationName = table+"."+masterRelationName;
				}
				this.setFilter('_sys_master_id_filter_',_String.format("{0}=eq.{1}",masterRelationName,masterRowId||""));
			}
		}
		
		// 树形数据处理
		if (this.isTree()) {
			let treeOption = this.getTreeOption();
			let rootFilter = treeOption.rootFilter;
			let parentId = null;
			if (options.parentRow) {
				parentId = this.getRowID(options.parentRow);
			}
			var treeFilter = _String.format("{0}={1}.{2}", treeOption.parent, parentId!==null?"eq":"is", parentId);
			if (!options.parentRow && parentId===null && rootFilter){
				let rootFilters = this.buildFilter(rootFilter);
				rootFilters && rootFilters.length>0 && (treeFilter = rootFilters); 
			}
			this.setFilter("_sys_parent_filter_",treeFilter);
		}else{
			//增加id自动过滤
			if(this._hasIDParam()){					
				//this.setFilter("_sys_id_filter_", "eq('" + this.getIdColumn() + "', '" + this._getIDParam() + "')");
				let idCol = this.getIdColumn();
				let defColID = this.getColumnDef(idCol);
				let idColName = (defColID && defColID.define) || idCol;
				if(this.hasJoinCol()){//有join时才使用表名
					let table = (defColID && defColID.tableAlias) || (defColID && defColID.table) || this.tableName;
					if(table) idColName = table+"."+idColName;
				}
				this.setFilter("_sys_id_filter_", idColName + "=eq." + this._getIDParam());
			}
		}

		var filter = this.buildFilter();
		if (filter)
			queryParam.filter = filter;

		queryParam.offset = offset;
		queryParam.limit = limit;

		//查询全部列时不传递列
		queryParam.columns = this.getSelectColumns();
		
		//生成join
		if(this.join){
			var joins = [];
			for(let i in this.join){
				let join = this.join[i];
				var leftTable = join['leftTable'];
				var rightTable = join['rightTable'];
				var rightTableAlias = join['rightTableAlias'];
				var joinOn = join['on'][0];//目前支持一个
				joins.push(_String.format("{0}.{1}.{2}.{3}.{4}", leftTable,joinOn.leftField,joinOn.fn,rightTable+(rightTableAlias?('|'+rightTableAlias):''),joinOn.rightField));
			}
			queryParam.join = joins.join();
		}
		
		//生成统计列
		if(0===offset && this.defAggCols){
			var temps = [];
			for ( var c in this.defAggCols) {
				temps.push(this.defAggCols[c]);
			}
			queryParam.aggColumns = temps.join();
		}

		var o = this.getOrderBys();
		if (o)
			queryParam.orderBy = o;

		return queryParam;
	}
	
	buildFilter(filters) {
		var ret = [];
		var filterList = filters || this.filters.filterList;
		var variables = this.filters.variables;
		for ( var o in filterList) {
			var filter = filterList[o];
			if (!filter) continue;
			var s = this._processFilter(filter,variables);
			if(isArray(s)) ret = ret.concat(s);
		}
		this.processFilterBrac(ret);
		return ret.length>0?ret:null;
	}
	
	processFilterBrac(filters){
		//进行filter中空括号处理
		let bContinue = false;
		for(let i=filters.length-1;i>=0;i--){
			let f = filters[i];
			if(')'===f){
				let j = i-1;
				if(j>=0 && ('('===filters[j] || 'or('===filters[j])){
					i--;
					bContinue = true;
					filters.splice(i,2);
				}
			}
		}
		if(bContinue) this.processFilterBrac(filters);//递归处理到所有括号全部完成
		if(filters.length>0 && 'or('===filters[0]) filters[0]='('; //第一个条件不能是or(
	}
	
	evalFilterObj(filter, variables){
		var result = null;
		if (filter.op && this.filterFns[filter.op]){
			result = this.filterFns[filter.op](filter.name, filter.value, filter.kind, this);
		}
		return result;
	}
	
	___processFilter(filter, variables){
		let result;
		var vars = Object.assign({}, this.context.vars,  {$page: this.page}, {params: this.page.params}, this.filterFns);
		vars.$$dataObj = this; //添加data对象自身
		if (typeof this.page[filter] === 'function'){
			result = this.page[filter](vars);
		}else if(isArray(filter) && filter.length>0){
			let ret = [];
			for(let i=0,len=filter.length;i<len;i++){
				let f = this.___processFilter(filter[i], variables);
				f && ret.push(f);
			}
			result = ret;
		}else if (wx.Util.isObject(filter)){
			result = this.evalFilterObj(filter, vars);
		}else if(typeof(filter)==='string')
			result = filter;
		return result;
	}
		
	_processFilter(f, variables){
		let filter = this.___processFilter(f, variables);
		if (filter==null || filter==undefined || filter===""){
			return [];
		}else if (isArray(filter)){
			return filter;
		}else{
			return [filter];
		}
	}	

	_getQueryParam(queryParam) {
		var ret = [];
		if(!this.useHeaderOffset){
			if('number' == typeof(queryParam.limit)) ret.push("limit="+queryParam.limit);
			if('number' == typeof(queryParam.offset)) ret.push("offset="+queryParam.offset);
		}
		
		if(queryParam.columns) ret.push("select="+queryParam.columns);
		if(queryParam.join) ret.push("join="+queryParam.join);
		if(queryParam.orderBy) ret.push(queryParam.orderBy);
		if(isArray(queryParam.filter)){
			for (let i=0; i<queryParam.filter.length; i++){
				ret.push(queryParam.filter[i]);
			}
		}
		this.smartKey = ret.length>0?ret.join("##"):null;
		return ret.length>0?ret:null; 
	}
	
    initOperation(){
   	 	super.initOperation();
   	 	this.defineOperation('setFilter',{
			label : '设置过滤',
			argsDef : [ {
				name : 'filters',
				displayName : '过滤'
			},{
				name : 'name',
				displayName : '过滤名称'
			} ],
			method : function(args) {
				var filters = args.filters,s='';
				/*和微信小程序格式统一
				 * [{name:列,value:值,op:比较操作符,kind:and/or}]
				*/
				return this.owner.setFilter(args.name||'__op_filter__',(isArray(filters) && filters.length>0)?filters:null);
			}
		});
   	 	this.defineOperation("clearFilter",{
			label : '清除所有过滤',
			method : function(args) {
				return this.owner.filters.clear();
			}
		});
   	 	this.defineOperation("setOrderBy",{
			label : '设置排序',
			argsDef : [ {
				name : 'col',
				displayName : '列'
			},{
				name : 'type',
				displayName : '排序方式'
			} ],
			method : function(args) {
				if(args.col)
					return this.owner.setOrderBy(args.col,args.type==='desc'?0:(args.type==='asc'?1:null));
			}
		});
   	 	this.defineOperation("clearOrderBy",{
			label : '清除所有排序',
			method : function(args) {
				return this.owner.clearOrderBy();
			}
		});

    }
	
	
}

wx.comp = wx.comp || {};
wx.comp.RestData = RestData
