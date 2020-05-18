import wx from '../../../lib/base/wx';
/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/ 
import {isArray} from "../../../lib/base/util";

	var removeAll = function (data,disableRecordChange) {
		if(disableRecordChange) data.clear();
		else{
			var confirmDelete = data.confirmDelete;
			try{
				data.confirmDelete = false;
				data.deleteAllData();
			}finally{
				data.confirmDelete = confirmDelete;
			}
		}
	};

	var newRowData = function (data,defaultValue,disableRecordChange,index) {
		if(isArray(defaultValue) && defaultValue.length>0){
			data.newData({'defaultValues':defaultValue,'disableRecordChange':disableRecordChange,'index':index});
		}
	};
	
	var setValue = function (data, mapping, receiveData, rownum, row) {
		var from = mapping.from;
		var to = mapping.to;
		if (!from || from === "" || !to || to === "") return;
		if(receiveData[rownum].hasOwnProperty(from)){
			var val = getValue(receiveData[rownum],from);
			'function'===typeof(data.setValue)?data.setValue(to, val, row):(row[to]=val);
		}
	};

	var getValue = function (row, col) {
		if (!row) return;
		return row[col];
	};

	var createLocfrom = function (mappingDef, rowIndex, receiveData) {
		var locfrom = mappingDef.locfrom;
		return getValue(receiveData[rowIndex],locfrom);
	};

	export function receiveByMapping(page, mapping, receiveData, insertPos){
			if (!mapping || !receiveData) return;
			if(!isArray(receiveData)) receiveData = [receiveData]; 
			var mappingDef = mapping, model = page, i, j, o, mappings = mappingDef.mappings;

			if (!mappingDef.dataID || mappingDef.dataID === "" || !mappingDef.operation || mappingDef.operation === "")
				return;

			var dataTar = model.comp(mappingDef.dataID);
			if (!dataTar) return;
			
			var newData = [];
			if(mappingDef.disableRecordChange) dataTar.disableRecordChange();
			try{				
				if (mappingDef.operation === "new") {
					for (i = 0; i < receiveData.length; i++) {
						o = {};
						for (j = 0; j < mappings.length; j++) {
							setValue(o, mappings[j], receiveData, i, o);
						}
						newData.push(o);
					}
					newRowData(dataTar,newData,mappingDef.disableRecordChange,insertPos);
				} else if (mappingDef.operation == "edit") {
					for (i = 0; i < receiveData.length; i++) {
						var query = dataTar.find(mappingDef.locto, createLocfrom(mappingDef, i, receiveData));
						
						if (query) {
							for (j = 0; j < mappings.length; j++) {
								setValue(dataTar, mappings[j], receiveData, i, query);
							}
						} else {
							o = {};
							for (j = 0; j < mappings.length; j++) {
								setValue(o, mappings[j], receiveData, i, o);
							}
							newData.push(o);
						}
					}
					newRowData(dataTar,newData,mappingDef.disableRecordChange,insertPos);
				} else if (mappingDef.operation == "clear") {
					removeAll(dataTar,mappingDef.disableRecordChange);
					for (i = 0; i < receiveData.length; i++) {
						o = {};
						for (j = 0; j < mappings.length; j++) {
							setValue(o, mappings[j], receiveData, i, o);
						}
						newData.push(o);
					}
					newRowData(dataTar,newData,mappingDef.disableRecordChange,insertPos);
				} else if (mappingDef.operation == "modify") {
					for (i = 0; i < receiveData.length; i++) {
						for (j = 0; j < mappings.length; j++) {
							setValue(dataTar, mappings[j], receiveData, i);
						}
					}
				} else {
					return;
				}		
			}finally{
				dataTar.enabledRecordChange();
			}
		}
	
	export default {receiveByMapping};
