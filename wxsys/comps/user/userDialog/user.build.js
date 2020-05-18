import wx from '../../../lib/base/wx';
import _createPageConfig from '../../../lib/base/createPageConfig';
import PageClass from './user.user';

 var $g_fns_data = {
		get _userdata(){
			return {

			};
		}
}; 


import '../../wrapper/wrapper';
import '../../image/image'; 
import '../../page/page'; 
import '../../commonOperation/commonOperation'; 
import '../../toptips/toptips'; 
import '../../restData/restData'; 
import '../../wxApi/wxApi'; 
var methods = {

 $imageUrlFn_image1: function({data,params,$page,props}){
 return data.current.avatarUrl ;
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
							"name":{
								"define":"name",
								"label":"姓名",
								"type":"string",
								"extType":"String"
							},
							"id":{
								"define":"id",
								"label":"id",
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
				"$events":{
					"customRefresh":"customRefresh"
				},
				"options":{
					"isMain":false,
					"className":"/uaa/user",
					"autoMode":"",
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
		"cls":wx.compClass('$UI/wxsys/comps/image/image'),
		"props":{
			"$urlFn":"$imageUrlFn_image1",
			"id":"image1"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"label4"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"label5"
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"个人信息"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
