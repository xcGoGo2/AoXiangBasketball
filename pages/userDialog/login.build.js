import wx from '../../wxsys/lib/base/wx';
import _createPageConfig from '../../wxsys/lib/base/createPageConfig';
import PageClass from './login.user';

 var $g_fns_loginData = {
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
import '../../wxsys/comps/toptips/toptips'; 
import '../../wxsys/comps/wxApi/wxApi'; 
var methods = {

 $refPathFn_input3_1: function({ctrl,params,$page,loginData,props}){
 return loginData.current._path ;
}

,
 $refFn_input3_1: function({ctrl,params,$page,loginData,props}){
 return loginData.current.name ;
}

,
 $refPathFn_input3_2: function({ctrl,params,$page,loginData,props}){
 return loginData.current._path ;
}

,$evtH_label10_tap: function({$event,$data,ctrl,$item,params,$page,loginData,props}){
let $$$args = arguments[0];
	let args={};
	args={"col":"type","item":"loginData.current.type","data":"loginData"};
	args.row=loginData.current;
	args.value="password";
	return $page.$compByCtx('commonOperation1',$event.source).executeOperation('setValue', args, $$$args);

}

,
 $refFn_input3_2: function({ctrl,params,$page,loginData,props}){
 return loginData.current.password ;
}

,
 $attrBindFn_hidden_label10: function({ctrl,params,$page,loginData,props}){
 try{return wx.Util.iif(loginData.current.type!="password",false,true)}catch(e){return ''} ;
}

,
 $attrBindFn_hidden_form3: function({ctrl,params,$page,loginData,props}){
 try{return wx.Util.iif(loginData.current.type!="password",false,true)}catch(e){return ''} ;
}

,
 $refFn_input2: function({ctrl,params,$page,loginData,props}){
 return loginData.current.password ;
}

,$evtH_label9_tap: function({$event,$data,ctrl,$item,params,$page,loginData,props}){
let $$$args = arguments[0];
	let args={};
	args={"col":"type","item":"loginData.current.type","data":"loginData"};
	args.row=loginData.current;
	args.value="smsCode";
	return $page.$compByCtx('commonOperation1',$event.source).executeOperation('setValue', args, $$$args);

}

,
 $refFn_input1: function({ctrl,params,$page,loginData,props}){
 return loginData.current.name ;
}

,
 $attrBindFn_hidden_form: function({ctrl,params,$page,loginData,props}){
 try{return wx.Util.iif(loginData.current.type!="password",true,false)}catch(e){return ''} ;
}

,
 $attrBindFn_hidden_label9: function({ctrl,params,$page,loginData,props}){
 try{return wx.Util.iif(loginData.current.type!="password",true,false)}catch(e){return ''} ;
}

,
 $refPathFn_input2: function({ctrl,params,$page,loginData,props}){
 return loginData.current._path ;
}

,
 $refPathFn_input1: function({ctrl,params,$page,loginData,props}){
 return loginData.current._path ;
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
					"id":"loginData",
					"type":"array",
					"items":{
						"fns":$g_fns_loginData,
						"type":"object",
						"key":"_key",
						"props":{
							"password":{
								"define":"password",
								"label":"密码",
								"type":"string"
							},
							"name":{
								"define":"name",
								"label":"登录账号",
								"type":"string"
							},
							"id":{
								"define":"id",
								"label":"ID",
								"type":"string"
							},
							"type":{
								"define":"type",
								"label":"登录方式",
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
						"id":"login",
						"type":"password"
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
				"id":"loginData",
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
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"form",
			"$attrBindFns":{
				"hidden":"$attrBindFn_hidden_form"
			}
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"name",
			"$refFn":"$refFn_input1",
			"id":"input1",
			"$refPathFn":"$refPathFn_input1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"password",
			"$refFn":"$refFn_input2",
			"id":"input2",
			"$refPathFn":"$refPathFn_input2"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"button3"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"form3",
			"$attrBindFns":{
				"hidden":"$attrBindFn_hidden_form3"
			}
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"name",
			"$refFn":"$refFn_input3_1",
			"id":"input3_1",
			"$refPathFn":"$refPathFn_input3_1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"password",
			"$refFn":"$refFn_input3_2",
			"id":"input3_2",
			"$refPathFn":"$refPathFn_input3_2"
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
			"id":"button1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"label3"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"label9",
			"$attrBindFns":{
				"hidden":"$attrBindFn_hidden_label9"
			}
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"label10",
			"$attrBindFns":{
				"hidden":"$attrBindFn_hidden_label10"
			}
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"登录"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
