import wx from '../wxsys/lib/base/wx';
import _createPageConfig from '../wxsys/lib/base/createPageConfig';
import PageClass from './yuyue.user';

 var $g_fns_restData = {
		get _userdata(){
			return {

			};
		}
}; 


 var $g_fns_restData1 = {
		get _userdata(){
			return {

			};
		}
}; 


 var $g_fns_tableData = {
		get _userdata(){
			return {

			};
		}
}; 


import '../wxsys/comps/wrapper/wrapper';
import '../wxsys/comps/commonOperation/commonOperation'; 
import '../wxsys/comps/tableData/tableData'; 
import '../wxsys/comps/restData/restData'; 
import '../wxsys/comps/input/input'; 
import '../wxsys/comps/button/button'; 
import '../wxsys/comps/code/code'; 
import '../wxsys/comps/page/page'; 
import '../wxsys/comps/text/text'; 
import '../wxsys/comps/toptips/toptips'; 
import '../wxsys/comps/textarea/textarea'; 
import '../wxsys/comps/loading/loading'; 
import '../wxsys/comps/wxApi/wxApi'; 
var methods = {

 $refFn_input1: function({restData,restData1,tableData,params,$page,props}){
 return tableData.current.fdianhua ;
}

,
 $refPathFn_input: function({restData,restData1,tableData,params,$page,props}){
 return tableData.current._path ;
}

,$evtH_page_show: function({$event,$data,restData,restData1,tableData,$item,params,$page,props}){
let $$$args = arguments[0];
	let args={};
	return $page.$compByCtx('page',$event.source).executeOperation('refresh', args, $$$args);

}

,
 $refPathFn_textarea: function({restData,restData1,tableData,params,$page,props}){
 return tableData.current._path ;
}

,
 $refFn_input: function({restData,restData1,tableData,params,$page,props}){
 return tableData.current.fxingming ;
}

,
 $refFn_textarea: function({restData,restData1,tableData,params,$page,props}){
 return tableData.current.fbeizhu ;
}

,$evtH_restData_saveCommit: function({$event,$data,restData,restData1,tableData,$item,params,$page,props}){
let $$$args = arguments[0];
	let args={};
	args={"force":"true"};
	return $page.$compByCtx('restData',$event.source).executeOperation('refresh', args, $$$args);

}

,
 $refPathFn_input1: function({restData,restData1,tableData,params,$page,props}){
 return tableData.current._path ;
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
					"id":"restData",
					"type":"array",
					"items":{
						"fns":$g_fns_restData,
						"type":"object",
						"key":"_key",
						"props":{
							"fid":{
								"define":"fid",
								"label":"主键",
								"type":"string",
								"extType":"String"
							},
							"fbeizhu":{
								"define":"fbeizhu",
								"label":"备注",
								"type":"string",
								"extType":"String"
							},
							"fyuyuezt":{
								"define":"fyuyuezt",
								"label":"预约状态",
								"type":"string",
								"extType":"String"
							},
							"fdianhua":{
								"define":"fdianhua",
								"label":"电话",
								"type":"string",
								"extType":"String"
							},
							"fxingming":{
								"define":"fxingming",
								"label":"姓名",
								"type":"string",
								"extType":"String"
							},
							"fyonghuid":{
								"define":"fyonghuid",
								"label":"用户ID",
								"type":"string",
								"extType":"String"
							},
							"_key":{
								"type":"string"
							},
							"fyuyuesj":{
								"define":"fyuyuesj",
								"label":"预约时间",
								"type":"datetime",
								"extType":"DateTime"
							}
						}
					}
				},
				"$events":{
					"saveCommit":"$evtH_restData_saveCommit"
				},
				"options":{
					"isMain":false,
					"className":"/main/yuyue",
					"autoMode":"new",
					"defSlaves":[],
					"url":"/dbrest",
					"confirmDelete":true,
					"tableName":"main_yuyue",
					"confirmRefreshText":"",
					"allowEmpty":false,
					"confirmDeleteText":"",
					"confirmRefresh":true,
					"idColumn":"fid"
				},
				"id":"restData",
				"filters":{}
			}
		},
		{
			"cls":wx.compClass('$UI/wxsys/comps/restData/restData'),
			"props":{
				"schema":{
					"limit":20,
					"orderBy":[],
					"keyItems":"_key",
					"id":"restData1",
					"type":"array",
					"items":{
						"fns":$g_fns_restData1,
						"type":"object",
						"key":"_key",
						"props":{
							"fid":{
								"define":"fid",
								"label":"主键",
								"type":"string",
								"extType":"String"
							},
							"fdianhua":{
								"define":"fdianhua",
								"label":"电话",
								"type":"string",
								"extType":"String"
							},
							"ftouxiang":{
								"define":"ftouxiang",
								"label":"头像",
								"type":"string",
								"extType":"String"
							},
							"fxingming":{
								"define":"fxingming",
								"label":"姓名",
								"type":"string",
								"extType":"String"
							},
							"fyouxiang":{
								"define":"fyouxiang",
								"label":"邮箱",
								"type":"string",
								"extType":"String"
							},
							"fyonghuid":{
								"define":"fyonghuid",
								"label":"用户ID",
								"type":"string",
								"extType":"String"
							},
							"_key":{
								"type":"string"
							},
							"fnicheng":{
								"define":"fnicheng",
								"label":"昵称",
								"type":"string",
								"extType":"String"
							}
						}
					}
				},
				"options":{
					"isMain":false,
					"className":"/main/yonghub",
					"autoMode":"load",
					"defSlaves":[],
					"url":"/dbrest",
					"confirmDelete":true,
					"tableName":"main_yonghub",
					"confirmRefreshText":"",
					"allowEmpty":false,
					"confirmDeleteText":"",
					"confirmRefresh":true,
					"idColumn":"fid"
				},
				"id":"restData1",
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
					"id":"tableData",
					"type":"array",
					"items":{
						"fns":$g_fns_tableData,
						"type":"object",
						"key":"_key",
						"props":{
							"fid":{
								"define":"fid",
								"label":"主键",
								"type":"string"
							},
							"fbeizhu":{
								"define":"fbeizhu",
								"label":"备注",
								"type":"string"
							},
							"fdianhua":{
								"define":"fdianhua",
								"label":"电话",
								"type":"string"
							},
							"fxingming":{
								"define":"fxingming",
								"label":"姓名",
								"type":"string"
							},
							"_key":{
								"type":"string"
							},
							"fyuyuerj":{
								"define":"fyuyuerj",
								"label":"预约日期",
								"type":"datetime"
							}
						}
					}
				},
				"initData":[
					{
						"fid":"C7ED454EEEB000018986BC0E18301B48"
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
					"idColumn":"fid"
				},
				"id":"tableData",
				"filters":{}
			}
		}
	],
	{
		"cls":wx.compClass('$UI/wxsys/comps/page/page'),
		"props":{
			"$events":{
				"show":"$evtH_page_show"
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
			"id":"commonOperation"
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
		"cls":wx.compClass('$UI/wxsys/comps/code/code'),
		"props":{
			"id":"code"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text",
			"text":"预约打球"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text1",
			"text":"consultation"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text2",
			"text":"姓名"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text3",
			"text":"*"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"fxingming",
			"$refFn":"$refFn_input",
			"id":"input",
			"$refPathFn":"$refPathFn_input"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text4",
			"text":"电话"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text5",
			"text":"*"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/input/input'),
		"props":{
			"$propName":"fdianhua",
			"$refFn":"$refFn_input1",
			"id":"input1",
			"$refPathFn":"$refPathFn_input1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text6",
			"text":"预约日期*"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/textarea/textarea'),
		"props":{
			"$propName":"fyuyuerj",
			"$refFn":"$refFn_textarea",
			"id":"textarea",
			"$refPathFn":"$refPathFn_textarea"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text6",
			"text":"备注"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/textarea/textarea'),
		"props":{
			"$propName":"fbeizhu",
			"$refFn":"$refFn_textarea",
			"id":"textarea",
			"$refPathFn":"$refPathFn_textarea"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/button/button'),
		"props":{
			"id":"button"
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarBackgroundColor":"#58ABED","navigationBarTitleText":"预约打球","navigationBarTextStyle":"white"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
