import wx from '../wxsys/lib/base/wx';
import _createPageConfig from '../wxsys/lib/base/createPageConfig';
import PageClass from './fenxiang_hb.user';

import '../wxsys/comps/wrapper/wrapper';

 var $g_fns_restData = {
		get _userdata(){
			return {
				data9: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data17: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data6: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data5: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				avatarUrl: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data4: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data3: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				nickName: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data2: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				isLogined: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				description: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				userName: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				phone: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				name: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				id: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				email: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				data15: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				group: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				}
			};
		}
}; 

import '../wxsys/comps/user/user'; 
import '../wxsys/comps/image/image'; 
import '../wxsys/comps/commonOperation/commonOperation'; 
import '../wxsys/comps/restData/restData'; 
import '../wxsys/comps/page/page'; 
import '../wxsys/comps/share/share'; 
import '../wxsys/comps/toptips/toptips'; 
import '../wxsys/comps/loading/loading'; 
import '../wxsys/comps/wxApi/wxApi'; 
var methods = {

 $imageUrlFn_image1: function({restData,params,$page,props}){
 return restData.current.avatarUrl ;
}

,
 $roFn_restData: function($data){
return true;
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
							"data9":{
								"readonly":"$data.getReadonly()",
								"define":"data9",
								"label":"地址",
								"type":"string",
								"extType":"String"
							},
							"data17":{
								"readonly":"$data.getReadonly()",
								"define":"data17",
								"label":"生日",
								"type":"date",
								"extType":"Date"
							},
							"data6":{
								"readonly":"$data.getReadonly()",
								"define":"data6",
								"label":"国家",
								"type":"string",
								"extType":"String"
							},
							"data5":{
								"readonly":"$data.getReadonly()",
								"define":"data5",
								"label":"微博",
								"type":"string",
								"extType":"String"
							},
							"avatarUrl":{
								"readonly":"$data.getReadonly()",
								"define":"avatarUrl",
								"label":"头像",
								"type":"string",
								"extType":"String"
							},
							"data4":{
								"readonly":"$data.getReadonly()",
								"define":"data4",
								"label":"QQ",
								"type":"string",
								"extType":"String"
							},
							"data3":{
								"readonly":"$data.getReadonly()",
								"define":"data3",
								"label":"市",
								"type":"string",
								"extType":"String"
							},
							"nickName":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"昵称",
								"type":"string"
							},
							"data2":{
								"readonly":"$data.getReadonly()",
								"define":"data2",
								"label":"省",
								"type":"string",
								"extType":"String"
							},
							"isLogined":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"是否登录",
								"type":"boolean"
							},
							"description":{
								"readonly":"$data.getReadonly()",
								"define":"description",
								"label":"备注",
								"type":"string",
								"extType":"String"
							},
							"userName":{
								"readonly":"$data.getReadonly()",
								"define":"userName",
								"label":"登录名",
								"type":"string",
								"extType":"String"
							},
							"_key":{
								"type":"string"
							},
							"phone":{
								"readonly":"$data.getReadonly()",
								"define":"phone",
								"label":"手机",
								"type":"string",
								"extType":"String"
							},
							"name":{
								"readonly":"$data.getReadonly()",
								"define":"name",
								"label":"姓名",
								"type":"string",
								"extType":"String"
							},
							"id":{
								"readonly":"$data.getReadonly()",
								"define":"id",
								"label":"id",
								"type":"string",
								"extType":"String"
							},
							"email":{
								"readonly":"$data.getReadonly()",
								"define":"email",
								"label":"邮箱",
								"type":"string",
								"extType":"String"
							},
							"data15":{
								"readonly":"$data.getReadonly()",
								"define":"data15",
								"label":"性别",
								"type":"integer",
								"extType":"Integer"
							},
							"group":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"群组",
								"type":"array"
							}
						}
					}
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
				"$roFn":"$roFn_restData",
				"id":"restData",
				"filters":{}
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
		"cls":wx.compClass('$UI/wxsys/comps/image/image'),
		"props":{
			"src":"$model/UI2/main/images/fenxianghaibao-1.jpg",
			"id":"image2"
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
		"cls":wx.compClass('$UI/wxsys/comps/share/share'),
		"props":{
			"id":"share"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/user/user'),
		"props":{
			"useOtherLogin":false,
			"autoUpdateUserInfo":true,
			"useSmsService":true,
			"data":"restData",
			"loginSuccessHint":true,
			"useOpenid":false,
			"autoLoadUserInfo":true,
			"id":"user",
			"autoBindPhone":false,
			"appPath":"$UI/main",
			"logoutAfterToLogin":true,
			"autoLogin":false
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
		"cls":wx.compClass('$UI/wxsys/comps/image/image'),
		"props":{
			"src":"$model/UI2/main/images/fenxianghaibao-2.jpg",
			"id":"image"
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
