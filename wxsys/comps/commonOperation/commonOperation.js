import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import {parsePath} from "../../lib/base/pageImpl";
import {isArray} from "../../lib/base/util";
import TableData from "../tableData/tableData";
import _String from "../../lib/base/string";
import {receiveByMapping} from "./js/receiveMapping";


export default class CommonOperation extends Component {
     constructor(page, id, props, context){
        super(page, id, props, context);
     }
     
     getData(dataId){
    	if(dataId){
    		var page = this.page;
    		var data = typeof(dataId)==='string'?page.comp(dataId):dataId;
    		return data;
    	} 
     }
     
	 setValue(dataId,col,value,row){
		var data = this.getData(dataId);
		if(data instanceof TableData){
			if(typeof(row)!=='string'){
				if(row && data!==row.$data){//不是真正的行对象，支持包含id列数据的对象，否则给数据当前行赋值				
					let idCol = data.getIdColumn();
					row = data.getRowByID(row[idCol]);
				}
				data.setValue(col,value,row);
			}else 
				data.setValueByID(col,value,row);
		}else{
			var msg = _String.format('数据集参数无效');
			throw new Error(msg);
		}
	}
	 filedValues(dataId,value){
			var data = this.getData(dataId);
			if(data instanceof TableData){
				if(isArray(value)){
				for(var i = 0 ; i < value.length; i ++){
					data.setValue(value[i].filed,value[i].value);
				}
			}
			}else{
				var msg = _String.format('数据集参数无效');
				throw new Error(msg);
			}
	 }
	allSetValue(dataId,col,value){
		var data = this.getData(dataId);
		if(data instanceof TableData){
			for (let i=0; i<data.value.length;	i++){
				let row = data.value[i];
				data.setValue(col,value,row);
			}
		}else{
			var msg = _String.format('数据集参数无效');
			throw new Error(msg);
		}
	}
	
	_getResult(data){
		var ret = [];
		if(data instanceof TableData){
			for (let i=0; i<data.value.length;	 i++){
				let row = data.value[i];
				ret.push(data.row2json(row));
			}
		}
		return ret;
	}

	saveReturn(dataId,insertPos){
		var data = this.getData(dataId);
		if(data instanceof TableData){
			let insPos = insertPos || -1;
			insPos = 'string'===typeof(insPos)?parseInt(insPos):insPos;
			let self = this;
			let fn = function(){
				wx.navigateBack({params:{type:1,data:self._getResult(data),insertPos:insPos}});
			};
			if(data.isChanged()) 
				data.saveAllData({onSuccess:fn});
			else fn();
		}else wx.navigateBack();
	} 
   
	deleteData(dataId,row,filter,confirm){
		let data = this.getData(dataId);
		let o = {async:true};
		if(confirm!==undefined) o['confirm'] = confirm;
		if(data instanceof TableData){
			if(typeof(filter)==='function'){
				let rows=[];
				data.each(function(p){
					if(filter(p.row)) rows.push(p.row);
				});
				if(rows.length>0)
					return data.deleteData(rows,o);
			}else
				return data.deleteData(row,o);
		}else{
			var msg = _String.format('数据集参数无效');
			throw new Error(msg);
		} 
	}
	
	saveData(dataId, row, successHint, successInfo){
		var data = this.getData(dataId);
		if(data instanceof TableData){
			return data.saveAllData().then(()=>{
				(false!=successHint && 'false'!=successHint) && this.page.hint(successInfo || "保存成功");
			});
		}
	}
	
	_receiveByMapping(mapping,receiveData,insertPos){
		receiveByMapping(this.page,mapping,receiveData,insertPos);
	}
	
	openPageDialog(url,dataId,params,option,row){
		option = option || {};
		url && (option.url = url);
		params && (option.params = params);
		var data = this.getData(dataId);
		if(data instanceof TableData && data.className){
			if(!option.params) option.params = {};
			var pname = data.className + '.id';
			if(!option.params.hasOwnProperty(pname))
				option.params[pname] = data.getRowID(row);
			
			var idCol = data.getIdColumn();
			var mapping = {dataID:data.id,operation:'edit',mappings:[],locfrom:idCol,locto:idCol,disableRecordChange:true};
			var cols = data.getColumnIDs();
			if(cols){
				//let hasJoinCol = data.hasJoinCol && data.hasJoinCol();
				cols = cols.split(data.delim);
				for (let i=0,len=cols.length;i<len;i++) {
					let o = cols[i];
					/*
					let can = true;
					if(hasJoinCol){
						let colDef = data.getColumnDef(o);
						can = !colDef.table;
					}
					if(can)
					*/ 
					mapping.mappings.push({from:o,to:o});
				}
			}
			var self = this;
			option.onClose = function(event){
				//数据返回处理
				if(event.data && event.data.type===1){
					let retData = event.data.data;
					let insertPos = undefined===event.data.insertPos?-1:event.data.insertPos;
					self._receiveByMapping(mapping,retData,insertPos);
				}
			};
		}
		return wx.navigateTo(option);
	}
	
	loadData(dataId,rows,append,parent,index){
		var data = this.getData(dataId);
		if(data){
			if(data instanceof TableData){
				var ret = data.loadData(rows, append, parent, index);
				if(isArray(ret) && ret.length>0) data.to(ret[0]);
			}else this.page.hint("加载数据时指定的数据组件["+dataId+"]不存在",'warn');
		}else this.page.hint("加载数据操作必须指定数据组件",'warn');
	}
	close(){
		return wx.navigateBack();
	}
    initOperation(){
    	super.initOperation();
    	this.defineOperation(
    		'setValue', {
    			label : '数据赋值',
    			argsDef : [ {
    				name : 'data',
    				displayName : '目标数据集',
    				required : true
    			},{
    				name : 'col',
    				displayName : '列',
    				required : true
    			},{
    				name : 'value',
    				displayName : '值',
    				required : true
    			},{
    				name : 'row',
    				displayName : '行ID',
    			} ],
    			method : function(args,ctx) {
    				var row = args.row || ctx.$item;
    				var data = args.data || ctx.$data || ctx.$page.$mainData;//兼容保留ctx.$data,设计时list时赋值操作没有给出data参数
    				return this.owner.setValue(data,args.col,args.value,row);
    			}
    		}
   		);
    	
    	this.defineOperation(
        		'filedValues', {
        			label : '多列赋值',
        			argsDef : [ {
        				name : 'data',
        				displayName : '目标数据集',
        				required : true
        			},{
        				name : 'values',
        				displayName : '值',
        				required : true
        			}],
        			method : function(args,ctx) {
        				return this.owner.filedValues(args.data,args.values);
        			}
        		}
       		);
    	
    	this.defineOperation(
    			'allSetValue', {
    				label : '数据所有行赋值',
    				argsDef : [ {
    					name : 'data',
    					displayName : '目标数据集',
    					required : true
    				},{
    					name : 'col',
    					displayName : '列',
    					required : true
    				},{
    					name : 'value',
    					displayName : '值',
    					required : true
    				} ],
    				method : function(args,ctx) {
    					var data = args.data || ctx.$page.$mainData;
    					return this.owner.allSetValue(data,args.col,args.value);
    				}
    			}
    	);
    	
    	this.defineOperation(
    			'saveReturn', {
    				label : '保存并返回',
    				argsDef: [{name:'data',displayName:'目标数据集'},{name:'index',displayName:'新增插入位置'}],
    				method : function(args,ctx) {
    					var data = args.data || ctx.$page.$mainData;
    					return this.owner.saveReturn(data,args.index);
    				}
    			}
		);
    	
    	this.defineOperation(
    			'saveData', {
    				label : '保存',
    				argsDef: [{name:'data',displayName:'目标数据集'},{
    					name: 'successHint',
    					displayName : '成功提示'
    				},{
    					name: 'successInfo',
    					displayName : '成功提示语'
    				}],
    				method : function(args,ctx) {
    					var data = args.data || ctx.$page.$mainData;
    					var row = args.row || ctx.$item;
    					if(ctx.$data){
    						if('string'===typeof(data)) row = data!==ctx.$data.id?undefined:row;
    						else row = data!==ctx.$data?undefined:row;
    					}
    					return this.owner.saveData(data, row, args.successHint, args.successInfo);
    				}
    			}
    	);
    	
    	this.defineOperation(
    			'deleteData', {
    				label : '删除',
    				argsDef: [{name:'data',displayName:'目标数据集'},{name:'row',displayName:'行ID'},{name:'filter',displayName:'删除条件',type:'fn',params:'$row'},{name : 'force',displayName : '禁止提示'}],
    				method : function(args,ctx) {
    					var data = args.data || ctx.$page.$mainData;
    					var confirm = args.force===undefined?undefined:(typeof(args.force)==='string'?('true'!==args.force):!args.force);
    					var row = args.row || ctx.$item;
    					if(ctx.$data){
    						if('string'===typeof(data)) row = data!==ctx.$data.id?undefined:row;
    						else row = data!==ctx.$data?undefined:row;
    					}
    					var filter = args.filter;
    					return this.owner.deleteData(data,row,filter,confirm);
    				}
    			}
		);
    	
    	this.defineOperation(
    			'loadData', {
    				label : '加载数据',
    				argsDef: [{name:'data',displayName:'目标数据集'},{name:'rows',displayName:'数据'},{name:'append',displayName:'增量模式'}],//{name:'parent',displayName:'父'}, {name:'index',displayName:'加载位置'},
    				method : function(args,ctx) {
    					var data = args.data || ctx.$page.$mainData, rows = args.rows || [], append = args.append, parent = args.parent, index = args.index, override = args.override;
    					if(typeof(append)==='string') append = append=='true'
    					return this.owner.loadData(data,rows,append,parent,index,override);
    				}
    			}
    	);
    	
    	this.defineOperation(
    			'openPageDialog', {
    				label : '打开子页面',
    				argsDef: [{name:'url',displayName:'页面源'},{name:'params',displayName:'参数'},{name:'receData',displayName:'共享数据集'},{name:'option',displayName:'对话框配置'}],
    				method : function(args,ctx) {
    					var data = args.receData || ctx.$page.$mainData;
    					var row = ctx.$item;
    					if(ctx.$data){
    						if('string'===typeof(data)) row = data!==ctx.$data.id?undefined:row;
    						else row = data!==ctx.$data?undefined:row;
    					}
    					var option = args.option || {};
    					option.url = args.url;
    					option.params = args.params;
    					return this.owner.openPageDialog(args.url,data,args.params,option,row);
    				}
    			}
    	);
    	
    	this.defineOperation(
    			'close', {
    				label : '关闭页面',
    				argsDef: [],
    				method : function(args,ctx) {
    					return this.owner.close();
    				}
    			}
    	);
    }
}

wx.comp = wx.comp || {};
wx.comp.CommonOperation = CommonOperation;
     
