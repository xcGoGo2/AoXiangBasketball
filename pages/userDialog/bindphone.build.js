import wx from '../../wxsys/lib/base/wx';
import _createPageConfig from '../../wxsys/lib/base/createPageConfig';
import PageClass from './bindphone.user';

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


import '../../wxsys/comps/wrapper/wrapper';
import '../../wxsys/comps/commonOperation/commonOperation'; 
import '../../wxsys/comps/tableData/tableData'; 
import '../../wxsys/comps/input/input'; 
import '../../wxsys/comps/button/button'; 
import '../../wxsys/comps/page/page'; 
import '../../wxsys/comps/wrapper/wrapper'; 
import '../../wxsys/comps/text/text'; 
import '../../wxsys/comps/toptips/toptips'; 
import '../../wxsys/comps/loading/loading'; 
import '../../wxsys/comps/wxApi/wxApi'; 
var methods = {

 $refFn_input1: function({data,ctrl,params,$page,props}){
 return data.current.phonenumber ;
}

,$evtH_button1_tap: function({$event,data,$data,ctrl,$item,params,$page,props}){
let $$$args = arguments[0];
	let args={};
	return $page.$compByCtx('commonOperation',$event.source).executeOperation('close', args, $$$args);

}

,
 $refPathFn_input21: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refPathFn_input1: function({data,ctrl,params,$page,props}){
 return data.current._path ;
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
		"cls":wx.compClass('$UI/wxsys/comps/loading/loading'),
		"props":{
			"loadingNum":0,
			"id":"_random1"
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
			"id":"commonOperation"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text",
			"text":"需要您使用手机号进行账号关联绑定"
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
		"cls":wx.compClass('$UI/wxsys/comps/button/button'),
		"props":{
			"id":"button"
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"绑定手机"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
