import wx from '../../../lib/base/wx';
let thirdLoginComps = {};

/*
 * 登录组件接口约定：
 * getName()---获取组件的名称，唯一标识
 * getDisplayName()---获取显示名
 * getIcon()---获取登录组件图标Url
 * getUserInfo(option)---获取用户信息，返回promise，参数option为object，目前无，留为扩展
 * WXDataCrypt(encryptedData,iv,option)---微信加密数据解密，返回promise，参数encryptedData:微信给出的加密数据,iv:加密初始化向量，option为object，目前无，留为扩展
 * login(option)---登录，返回promise，参数option为object，userComp:用户组件
 * logout(option)---注销，返回promise，参数option为object，目前无，留为扩展
 * constructor()---须在组件创建后调用helper.addLoginComp(comp)注册登录组件
 * destroy()---须在组件释放时调用helper.removeLoginComp(comp)注销登录组件
 */
let helper = {
	addLoginComp: function(comp){
		if(!comp) throw new Error("无效的登录组件");
		if(typeof(comp.getName)!=='function') throw new Error("登录组件缺少getName方法");
		if(typeof(comp.getDisplayName)!=='function') throw new Error("登录组件缺少getDisplayName方法");
		if(typeof(comp.login)!=='function') throw new Error("登录组件缺少login方法");
		thirdLoginComps[comp.getName()] = comp;
	},
	removeLoginComp: function(comp){
		if(typeof(comp)==='string') delete thirdLoginComps[comp];
		else if(comp && typeof(comp.getName)==='function') delete thirdLoginComps[comp.getName()];
	},
	getLoginComp: function(name){
		return thirdLoginComps[name];
	},
	hasLoginComp: function(){
		return helper.loginCompCount()>0;
	},
	loginCompCount: function(){
		let keys = helper.getLoginCompNames();
		return keys?keys.length:0;
	},
	eachLoginComp: function(callback){
		if(typeof(callback)==='function')
			for(let n in thirdLoginComps){
				callback(thirdLoginComps[n]);
			}
	},
	getLoginCompNames: function(){
		return Object.keys(thirdLoginComps);
	}
};

export default helper;
