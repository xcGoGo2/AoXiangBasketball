import wx from '../../../lib/base/wx';
import _createPageConfig from '../../../lib/base/createPageConfig';
import PageClass from './forgetPassword.user';

 var $g_fns_data = {
		get _userdata(){
			return {

			};
		}
}; 


 var $g_fns_ctrl = {
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
import '../../wrapper/wrapper'; 
import '../../toptips/toptips'; 
import '../../wxApi/wxApi'; 
var methods = {

 $refFn_input1: function({data,ctrl,params,$page,props}){
 return data.current.phonenumber ;
}

,
 $refPathFn_input21: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refPathFn_input3: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refPathFn_input2: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refFn_input3: function({data,ctrl,params,$page,props}){
 return data.current.confirmPassword ;
}

,
 $refPathFn_input1: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refFn_input2: function({data,ctrl,params,$page,props}){
 return data.current.newPassword ;
}

,
 $refFn_input21: function({data,ctrl,params,$page,props}){
 return data.current.verifyCode ;
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
							"verifyCode":{
								"define":"verifyCode",
								"label":"验证码",
								"type":"string"
							},
							"phonenumber":{
								"define":"phonenumber",
								"label":"电话号码",
								"type":"string"
							},
							"newPassword":{
								"define":"newPassword",
								"label":"新密码",
								"type":"string"
							},
							"confirmPassword":{
								"define":"confirmPassword",
								"label":"确认密码",
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
		},
		{
			"cls":wx.compClass('$UI/wxsys/comps/tableData/tableData'),
			"props":{
				"schema":{
					"limit":20,
					"orderBy":[],
					"keyItems":"_key",
					"id":"ctrl",
					"type":"array",
					"items":{
						"fns":$g_fns_ctrl,
						"type":"object",
						"key":"_key",
						"props":{
							"btnDisabled":{
								"define":"btnDisabled",
								"label":"获取验证码按钮可用",
								"type":"boolean"
							},
							"id":{
								"define":"id",
								"label":"ID",
								"type":"string"
							},
							"_key":{
								"type":"string"
							},
							"btnLabel":{
								"define":"btnLabel",
								"label":"获取验证码按钮文字",
								"type":"string"
							}
						}
					}
				},
				"initData":[
					{
						"btnDisabled":false,
						"id":"data",
						"btnLabel":"获取验证码"
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
				"id":"ctrl",
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
			"$propName":"phonenumber",
			"$refFn":"$refFn_input1",
			"id":"input1",
			"$refPathFn":"$refPathFn_input1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"verifyCode",
			"$refFn":"$refFn_input21",
			"id":"input21",
			"$refPathFn":"$refPathFn_input21"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"button2"
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
			"$propName":"confirmPassword",
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"重新设置密码"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
