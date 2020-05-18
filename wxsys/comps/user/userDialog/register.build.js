import wx from '../../../lib/base/wx';
import _createPageConfig from '../../../lib/base/createPageConfig';
import PageClass from './register.user';

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
import '../../restData/restData'; 
import '../../input/input'; 
import '../../button/button'; 
import '../../page/page'; 
import '../../wrapper/wrapper'; 
import '../../toptips/toptips'; 
import '../../wxApi/wxApi'; 
var methods = {

 $refPathFn_input7: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refPathFn_input21: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refFn_input7: function({data,ctrl,params,$page,props}){
 return data.current.userName ;
}

,
 $refFn_input6: function({data,ctrl,params,$page,props}){
 return data.current.name ;
}

,
 $refFn_input3: function({data,ctrl,params,$page,props}){
 return data.current.confirmPassword ;
}

,
 $refFn_input2: function({data,ctrl,params,$page,props}){
 return data.current.newPassword ;
}

,
 $refFn_input21: function({data,ctrl,params,$page,props}){
 return data.current.verifyCode ;
}

,
 $refFn_input5: function({data,ctrl,params,$page,props}){
 return data.current.email ;
}

,
 $refFn_input1: function({data,ctrl,params,$page,props}){
 return data.current.phone ;
}

,
 $refPathFn_input6: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $refPathFn_input5: function({data,ctrl,params,$page,props}){
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
 $refPathFn_input1: function({data,ctrl,params,$page,props}){
 return data.current._path ;
}

,
 $attrBindFn_hidden_btnUserinfo: function({data,ctrl,params,$page,props}){
 try{return wx.Util.iif(wx.Device.isMiniProgram()!=true,true,false)}catch(e){return ''} ;
}

}
var template = [
	[
		{
			"cls":wx.compClass('$UI/wxsys/comps/restData/restData'),
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
								"isCal":true,
								"define":"EXPRESS",
								"label":"验证码",
								"type":"string"
							},
							"phone":{
								"define":"phone",
								"label":"手机",
								"type":"string",
								"extType":"String"
							},
							"avatarUrl":{
								"define":"avatarUrl",
								"label":"头像",
								"type":"string",
								"extType":"String"
							},
							"openId":{
								"isCal":true,
								"define":"EXPRESS",
								"label":"openId",
								"type":"string"
							},
							"more":{
								"isCal":true,
								"define":"EXPRESS",
								"label":"显示更多",
								"type":"boolean"
							},
							"name":{
								"define":"name",
								"label":"姓名",
								"type":"string",
								"extType":"String"
							},
							"newPassword":{
								"isCal":true,
								"define":"EXPRESS",
								"label":"新密码",
								"type":"string"
							},
							"confirmPassword":{
								"isCal":true,
								"define":"EXPRESS",
								"label":"确认密码",
								"type":"string"
							},
							"id":{
								"define":"id",
								"label":"id",
								"type":"string",
								"extType":"String"
							},
							"userName":{
								"define":"userName",
								"label":"登录名",
								"type":"string",
								"extType":"String"
							},
							"_key":{
								"type":"string"
							},
							"email":{
								"define":"email",
								"label":"邮箱",
								"type":"string",
								"extType":"String"
							}
						}
					}
				},
				"options":{
					"isMain":false,
					"className":"/uaa/user",
					"autoMode":"new",
					"defSlaves":[],
					"confirmDelete":true,
					"tableName":"uaa_user",
					"confirmRefreshText":"",
					"allowEmpty":false,
					"confirmDeleteText":"",
					"confirmRefresh":true,
					"isAllColumns":true,
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
							"useSmsService":{
								"define":"useSmsService",
								"label":"是否启用短信服务",
								"type":"boolean"
							},
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
						"useSmsService":true,
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
					"autoMode":"",
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
				"load":"pageLoad",
				"unload":"pageUnload"
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
			"$propName":"phone",
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
			"$propName":"userName",
			"$refFn":"$refFn_input7",
			"id":"input7",
			"$refPathFn":"$refPathFn_input7"
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
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"more"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"name",
			"$refFn":"$refFn_input6",
			"id":"input6",
			"$refPathFn":"$refPathFn_input6"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/button/button'),
		"props":{
			"$events":{
				"getUserInfo":"setUserInfo"
			},
			"id":"btnUserinfo",
			"$attrBindFns":{
				"hidden":"$attrBindFn_hidden_btnUserinfo"
			}
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"email",
			"$refFn":"$refFn_input5",
			"id":"input5",
			"$refPathFn":"$refPathFn_input5"
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"注册"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
