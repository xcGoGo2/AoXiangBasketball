import wx from '../../../lib/base/wx';
import _createPageConfig from '../../../lib/base/createPageConfig';
import PageClass from './changePassword.user';

 var $g_fns_data = {
		get _userdata(){
			return {

			};
		}
}; 


import '../../wrapper/wrapper';
import '../../commonOperation/commonOperation'; 
import '../../tableData/tableData'; 
import '../../input/input'; 
import '../../button/button'; 
import '../../page/page'; 
import '../../toptips/toptips'; 
import '../../wxApi/wxApi'; 
var methods = {

 $refFn_input1: function({data,params,$page,props}){
 return data.current.oldPassword ;
}

,
 $refPathFn_input3: function({data,params,$page,props}){
 return data.current._path ;
}

,
 $refPathFn_input2: function({data,params,$page,props}){
 return data.current._path ;
}

,
 $refFn_input3: function({data,params,$page,props}){
 return data.current.confirmPasswd ;
}

,
 $refPathFn_input1: function({data,params,$page,props}){
 return data.current._path ;
}

,
 $refFn_input2: function({data,params,$page,props}){
 return data.current.newPassword ;
}

}
var template = [
	[
		{
			"cls":wx.compClass('$UI/wxsys/comps/tableData/tableData'),
			"props":{
				"schema":{
					"limit":20,
					"orderBy":[],
					"keyItems":"_key",
					"id":"data",
					"type":"array",
					"items":{
						"fns":$g_fns_data,
						"type":"object",
						"key":"_key",
						"props":{
							"oldPassword":{
								"define":"oldPassword",
								"label":"旧密码",
								"type":"string"
							},
							"confirmPasswd":{
								"define":"confirmPasswd",
								"label":"确认密码",
								"type":"string"
							},
							"newPassword":{
								"define":"newPassword",
								"label":"新密码",
								"type":"string"
							},
							"id":{
								"define":"id",
								"label":"ID",
								"type":"string"
							},
							"_key":{
								"type":"string"
							}
						}
					}
				},
				"initData":[
					{
						"id":"data"
					}
				],
				"options":{
					"confirmRefreshText":"",
					"allowEmpty":false,
					"confirmDeleteText":"",
					"confirmRefresh":true,
					"isMain":false,
					"autoMode":"load",
					"confirmDelete":true,
					"idColumn":"id"
				},
				"id":"data",
				"filters":{}
			}
		}
	],
	{
		"cls":wx.compClass('$UI/wxsys/comps/page/page'),
		"props":{
			"$events":{
				"load":"pageLoad"
			},
			"id":"page"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wxApi/wxApi'),
		"props":{
			"id":"wxapi"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/commonOperation/commonOperation'),
		"props":{
			"id":"commonOperation1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"oldPassword",
			"$refFn":"$refFn_input1",
			"id":"input1",
			"$refPathFn":"$refPathFn_input1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"newPassword",
			"$refFn":"$refFn_input2",
			"id":"input2",
			"$refPathFn":"$refPathFn_input2"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"confirmPasswd",
			"$refFn":"$refFn_input3",
			"id":"input3",
			"$refPathFn":"$refPathFn_input3"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/button/button'),
		"props":{
			"id":"button1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/toptips/toptips'),
		"props":{
			"id":"__toptips__"
		}
	}
];
export function createPageConfig(){
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"修改密码"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
