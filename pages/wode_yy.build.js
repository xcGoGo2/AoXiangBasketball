import wx from '../wxsys/lib/base/wx';
import _createPageConfig from '../wxsys/lib/base/createPageConfig';
import PageClass from './wode_yy.user';

 var $g_fns_restData1 = {
		get _userdata(){
			return {

			};
		}
}; 


 var $g_fns_restData = {
		get _userdata(){
			return {

			};
		}
}; 


import '../wxsys/comps/wrapper/wrapper';
import '../wxsys/comps/image/image'; 
import '../wxsys/comps/commonOperation/commonOperation'; 
import '../wxsys/comps/list/list'; 
import '../wxsys/comps/restData/restData'; 
import '../wxsys/comps/page/page'; 
import '../wxsys/comps/text/text'; 
import '../wxsys/comps/toptips/toptips'; 
import '../wxsys/comps/loading/loading'; 
import '../wxsys/comps/wxApi/wxApi'; 
var methods = {

 $items_list: function({listindex,restData,restData1,params,$page,props,listitem}){
 return restData.value ;
}

,
 $filter__system1__restData: function({isNotNull,$$dataObj,restData,like,nlike,RBRAC,lt,inn,restData1,is,params,eq,gt,props,LBRAC,not,isNull,gte,ilike,neq,lte,$page,nilike}){
 	return eq('fyonghuid',restData1.current.fyonghuid/*{"dependencies":["restData1"]}*/, $$dataObj);
 ;
}

,
 $attrBindFn_hidden_text2: function({listindex,restData,restData1,$item,params,$page,props,listitem}){
 try{return wx.Util.iif(listitem.fyuyuezt==1,false,true)}catch(e){return ''} ;
}

,
 $attrBindFn_hidden_text1: function({listindex,restData,restData1,$item,params,$page,props,listitem}){
 try{return wx.Util.iif(listitem.fyuyuezt==0,false,true)}catch(e){return ''} ;
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
					"share":{
						"name":"共享数据0"
					},
					"idColumn":"fid"
				},
				"id":"restData1",
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
				"options":{
					"depends":[
						"restData1"
					],
					"isMain":false,
					"className":"/main/yuyue",
					"autoMode":"load",
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
				"filters":{
					"_system1_":[
						"$filter__system1__restData"
					]
				}
			}
		}
	],
	{
		"cls":wx.compClass('$UI/wxsys/comps/page/page'),
		"props":{
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
		"cls":wx.compClass('$UI/wxsys/comps/list/list'),
		"props":{
			"$items":"$items_list",
			"item":"listitem",
			"autoRefresh":true,
			"dataId":"restData",
			"$template":[
				{
					"cls":wx.compClass('$UI/wxsys/comps/image/image'),
					"props":{
						"src":"$model/UI2/main/images/logo2-1.jpg",
						"id":"image"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text",
						"text":"临汾奥翔篮球训练基地"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text1",
						"text":"处理中",
						"$attrBindFns":{
							"hidden":"$attrBindFn_hidden_text1"
						}
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text2",
						"text":"已完成",
						"$attrBindFns":{
							"hidden":"$attrBindFn_hidden_text2"
						}
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text3",
						"text":"姓名"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text5",
						"text":"电话"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text7",
						"text":"备注"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text8"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text9"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text11"
					}
				},
				{
					"cls":wx.compClass('$UI/wxsys/comps/text/text'),
					"props":{
						"id":"text14"
					}
				}
			],
			"autoLoadNextPage":true,
			"index":"listindex",
			"id":"list",
			"items":"restData.value",
			"key":"_key"
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
	return _createPageConfig(PageClass, template, methods, {})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
