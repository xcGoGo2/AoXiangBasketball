import wx from '../wxsys/lib/base/wx';
import _createPageConfig from '../wxsys/lib/base/createPageConfig';
import PageClass from './index.user';

 var $g_fns_restData2 = {
		get _userdata(){
			return {

			};
		}
}; 


import '../wxsys/comps/wrapper/wrapper';

 var $g_fns_restData3 = {
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
				country: {
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
				gender: {
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
				city: {
					readonly: 	function($self){
							try{
								let $data=$self.$data;
					 			return $data.getReadonly()
							}catch(_$e){
								return null;
							}
						}(this)
				},
				openId: {
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
				groups: {
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
				province: {
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
import '../comp/wxxcx_login/components/wxxcx_login/wxxcx_login'; 
import '../wxsys/comps/page/page'; 
import '../wxsys/comps/text/text'; 
import '../wxsys/comps/toptips/toptips'; 
import '../wxsys/comps/wxApi/wxApi'; 
var methods = {
$evtH_col5_tap: function({$event,$data,$item,params,$page,restData2,props,restData3}){
let $$$args = arguments[0];
	let args={};
	args={"url":"$UI/main/yuyue.w"};
	return $page.$compByCtx('wxapi',$event.source).executeOperation('switchTab', args, $$$args);

}

,
 $filter__system1__restData2: function({isNotNull,$$dataObj,like,nlike,RBRAC,lt,inn,is,params,eq,gt,restData2,props,restData3,LBRAC,not,isNull,gte,ilike,neq,lte,$page,nilike}){
 	return eq('fyonghuid',restData3.current.id/*{"dependencies":["user"]}*/, $$dataObj);
 ;
}

,
 $roFn_restData3: function($data){
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
					"id":"restData2",
					"type":"array",
					"items":{
						"fns":$g_fns_restData2,
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
				"$events":{
					"afterRefresh":"yonghuEvent"
				},
				"options":{
					"depends":[
						"user"
					],
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
				"id":"restData2",
				"filters":{
					"_system1_":[
						"$filter__system1__restData2"
					]
				}
			}
		},
		{
			"cls":wx.compClass('$UI/wxsys/comps/restData/restData'),
			"props":{
				"schema":{
					"limit":20,
					"orderBy":[],
					"keyItems":"_key",
					"id":"restData3",
					"type":"array",
					"items":{
						"fns":$g_fns_restData3,
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
							"country":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"国家",
								"type":"string"
							},
							"data5":{
								"readonly":"$data.getReadonly()",
								"define":"data5",
								"label":"微博",
								"type":"string",
								"extType":"String"
							},
							"gender":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"性别",
								"type":"string"
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
							"city":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"市",
								"type":"string"
							},
							"openId":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"openId",
								"type":"string"
							},
							"nickName":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"昵称",
								"type":"string"
							},
							"isLogined":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"是否登录",
								"type":"boolean"
							},
							"groups":{
								"readonly":"$data.getReadonly()",
								"define":"groups",
								"label":"群组",
								"type":"string",
								"extType":"String"
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
							"province":{
								"readonly":"$data.getReadonly()",
								"isCal":true,
								"define":"EXPRESS",
								"label":"省",
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
				"$roFn":"$roFn_restData3",
				"id":"restData3",
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
		"cls":wx.compClass('$UI/wxsys/comps/user/user'),
		"props":{
			"useOtherLogin":false,
			"autoUpdateUserInfo":true,
			"useSmsService":true,
			"data":"restData3",
			"loginSuccessHint":true,
			"useOpenid":true,
			"autoLoadUserInfo":true,
			"id":"user",
			"autoBindPhone":false,
			"appPath":"$UI/main",
			"logoutAfterToLogin":true,
			"autoLogin":false
		}
	},
	{
		"cls":wx.compClass('$UI/comp/wxxcx_login/components/wxxcx_login/wxxcx_login'),
		"props":{
			"id":"wxxcx_login"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/wrapper/wrapper'),
		"props":{
			"id":"col5"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/image/image'),
		"props":{
			"src":"$model/UI2/main/images/2.jpg",
			"id":"image3"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/text/text'),
		"props":{
			"id":"text3",
			"text":"预约看房"
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarBackgroundColor":"#58ABED","navigationBarTitleText":"鼎壹房地产","navigationBarTextStyle":"white"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
