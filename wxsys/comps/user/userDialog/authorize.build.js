import wx from '../../../lib/base/wx';
import _createPageConfig from '../../../lib/base/createPageConfig';
import PageClass from './authorize.user';

import '../../wrapper/wrapper';
import '../../page/page'; 
import '../../commonOperation/commonOperation'; 
import '../../text/text'; 
import '../../toptips/toptips'; 
import '../../loading/loading'; 
import '../../button/button'; 
import '../../wxApi/wxApi'; 
var methods = {
$evtH_button1_tap: function({$event,$data,$item,params,$page,props}){
let $$$args = arguments[0];
	let args={};
	return $page.$compByCtx('commonOperation',$event.source).executeOperation('close', args, $$$args);

}

,$evtH_button_getUserInfo: function({$event,$data,$item,params,$page,props}){
let $$$args = arguments[0];
	let args={};
	return $page.$compByCtx('commonOperation',$event.source).executeOperation('close', args, $$$args);

}

}
var template = [
	{
		"cls":wx.compClass('$UI/wxsys/comps/page/page'),
		"props":{
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
			"text":"需要您授权获取您的公开信息（昵称、头像等）"
		}
	},
	{
		"cls":wx.compClass('$UI/wxsys/comps/button/button'),
		"props":{
			"$events":{
				"getUserInfo":"$evtH_button_getUserInfo"
			},
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
	return _createPageConfig(PageClass, template, methods, {"navigationBarTitleText":"授权"})
}
export function createPage(owner, pageid, props){
	var page = new PageClass(owner, props);
	page.$init(template, methods, pageid);
	return page;
}
