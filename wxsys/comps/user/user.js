import wx from '../../lib/base/wx';
/*! 
 * WeX5 v3 (http://www.justep.com) 
 * Copyright 2015 Justep, Inc.
 * Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
 */

import Component from "../../lib/base/component";
import uaa from "./js/uaa";
import UserHelper from "./js/userHelper";
import _String from "../../lib/base/string";
import Util from "../../lib/base/util";
import UUID from "../../lib/base/uuid";
import Device from "../../lib/base/device";

import {runInAction, observable, extendObservable, autorun, toJS, isObservableArray, isObservableObject, isObservable, observe} from  "../../lib/mobx/mobx-2.6.2.umd";


	//wx.getStorageSync
//	var oauth2 = require("./js/oauth2");
	let WxUserInfo = {};	
	//加载wx相关信息
	let WxUserInfoDfd = null;	

	function getWxUserInfo(useOpenid){
		if(!WxUserInfoDfd){
			WxUserInfoDfd = new Promise(function(resolve, reject) {
				Promise.all([
								new Promise(function(resolve, reject) {
									//获取wx的用户信息
									wx.getUserInfo({
										lang: 'zh_CN',
										success: function(res) {
											let userInfo = res.userInfo;
											WxUserInfo.avatarUrl = userInfo.avatarUrl;
											WxUserInfo.nickName = userInfo.nickName;
											WxUserInfo.gender = userInfo.gender;
											WxUserInfo.province = userInfo.province;
											WxUserInfo.city = userInfo.city;
											WxUserInfo.country = userInfo.country;
											resolve();
										},
										fail: function(){
											//兼容拒绝获取信息的情况
											resolve();
										}
									});
								}),
								new Promise(function(resolve, reject) {
							        //获取openID,特殊逻辑获取openID失败也返回
									if(useOpenid){
										wx.login({
											success: function(res) {
												if (res.code) {
													let wxCode = res.code;
													if(Device.isSimulate()){
														WxUserInfo.openId = res.code;
														resolve();
													}else{
														getOpenId(wxCode).then(function(res){
															console.log("==getOpenId(" + wxCode + ") returned:");
															console.log(res);
															WxUserInfo.openId = res.openid;
															resolve();
														}, function(res) {
															resolve();
														});
													}
												} else {
													resolve();
												}
											},
											fail: function(){
												resolve();
											}
										});
									}else resolve();
								})
								]).then(function(){
									resolve(WxUserInfo);
								},function(reason){
									reject(reason);
								});	
			});
		}
		return WxUserInfoDfd;
	}
	
	function getOpenId(code){
		var dfd = {};
		var promise = new Promise(function(resolve, reject) {
			var option = {
					method : "GET",
					url : (wx.App.baseUrl||"") + "/wxxcx_login/thirdpartylogin/getOpenId?code=" + code
				};
			option.success = function(res){
				if ((res.statusCode >= 200) && (res.statusCode < 300)){
					resolve(res.data);
				}else reject(res);
			};
			option.fail = function(error){
				reject(error);
			};
			wx.request(option);
		});
		//防止Uncaught (in promise)异常
		promise.catch(()=>{});
		return promise;
	}	

	var dialogUrls = {
			login:'{0}/userDialog/login.w',	
			register:'{0}/userDialog/register.w',	
			userInfo:'{0}/userDialog/user.w',
			authorize:'{0}/userDialog/authorize.w',
			bindphone:'{0}/userDialog/bindphone.w',
			changePassword:'{0}/userDialog/changePassword.w',
			forgetPassword:'{0}/userDialog/forgetPassword.w'
	};
	
	function getUrl(name,appPath){
		appPath = appPath || '$UI/system/components/justep/user';
		var url = _String.format(dialogUrls[name],appPath);
		return Util.toResUrl(url);
	}
	
	var password = [ 15, 52, 60, 66, 42, 31, 98, 35 ];
	var encrypt = function(str, key) {
		return uaa.encrypt(str, key);
	};

	var _loginData_;
	var loadLoginDataByStore = function() {
		if (_loginData_)
			return _loginData_;
		var data = wx.getStorageSync('wx_app_loginData');
		if (data) {
			data = encrypt(data, password);
			_loginData_ = JSON.parse(data);
			return _loginData_;
		}
	};

	var saveLoginDataToStore = function(data) {
		data = JSON.stringify(data);
		wx.setStorageSync('wx_app_loginData', encrypt(data, password));
		_loginData_ = null;
	};

	var clsLoginDataToStore = function() {
		_loginData_ = null;
		wx.setStorageSync('wx_app_loginData', encrypt('{}', password));
	};

	var needLogin = function() {
		var data = loadLoginDataByStore();
		return !data || !data.name || !data.password;
	};
	
	var getRequestVars = function() {
		var vars = [], hash;  
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');  
		for(var i = 0; i < hashes.length; i++)  
		{  
			hash = hashes[i].split('=');  
			vars.push(hash[0]);  
			vars[hash[0]] = hash[1];  
		}  
		return vars;	
	};
	
	var isLogined = observable(false);
	var loginCount = 0, logoutCount = 0;
	
	let authorizeUserInfoDfd = null;
	
	export default class User extends Component {
		constructor(page, id, props, context){
			super(page, id, props, context);       
			this.appPath = props.appPath;
			this.autoLogin = props.autoLogin;
			this.autoLoadUserInfo = props.autoLoadUserInfo;
			this.autoUpdateUserInfo = props.autoUpdateUserInfo;
			this.autoBindPhone = props.autoBindPhone;
			this.useOpenid = props.useOpenid;
			this.useSmsService = props.useSmsService;
			this.logoutAfterToLogin = props.logoutAfterToLogin;
			this.useOtherLogin = props.useOtherLogin;
			this.data = props.data;
			this.loginSuccessHint = props.loginSuccessHint;
			this.uuid = new UUID().toString();
			User.regUserComp(this);
			this.doInit();
		}
		
		getDlgUrl(name){
			User.regUserComp(this);
			return getUrl(name,this.getAppPath());
		}
		
		destroy() {
			if(this.isLoginedChangeHandle) this.isLoginedChangeHandle();
			User.unregUserComp(this);
			super.destroy();
		}
		
		hint(info, type){
			if(this.loginSuccessHint){
				this.page.hint(info);
			}
		}
		
	     hasDependence(){
	  		return true;
	  	 }
	     
		// 初始化
		doInit() {
			this.wxUserInfo = {};
			var self = this;
			var data = self.getData();
			if(data){
				data.loadData([{}]);
				data.first();
			}
				
			self.autoLoginDtd = {};
			self.autoLoadUserInfoDtd = {};
			
		    let autoLoginPromise = new Promise(function (resolve, reject) {
		          self.autoLoginDtd.resolve = resolve;
		          self.autoLoginDtd.reject = reject;
		    });
		    let autoLoadUserInfoPromise = new Promise(function (resolve, reject) {
		          self.autoLoadUserInfoDtd.resolve = resolve;
		          self.autoLoadUserInfoDtd.reject = reject;
		    });

		    Promise.all([autoLoginPromise, autoLoadUserInfoPromise]).then(function(){
		  				self.inited();
		  			},function(){
		  				self.inited();
		  	});
		  							
		  	//获取wx的用户信息
		  	if(!this.autoLoadUserInfo){
		  		self.autoLoadUserInfoDtd.resolve();
		  	}else{
		  		self.page.on('load',function(ev){
		  			self.getWXUserInfo(true);
		  		});
		  	}

		  	//自动登录
		  	self.page.on('load',function(ev){
		  		autoLoadUserInfoPromise.then(()=>{
				  	if(self.autoLogin){
				  		self.showLogin();
				  	}else{
						uaa.checkLogin().then(()=>{
							self._doLoginAfter();
						},()=>{
							self.autoLoginDtd.resolve();
						});
				  	}	
		  		},()=>{});
		  	});
			
			var doUpdateUserData = function(logined){
				var data = self.getData();
				if(data){
					var row = data.getCurrentRow();
					if(row){
						runInAction(() => {//放在一个事务内
							let items = data.getColumnDefs();
							var user = self.getUser();
							for ( let o in items) {
								row[o] = logined?user[o]:null;
							}
							row.isLogined = logined;
							row.group = user.groups;
						});
					}
				}
			};
			
			
			this.updateUserDataHandle = function(option){
				doUpdateUserData(option.logined);
			};
			
			var doLoginedChange = function(logined){
				doUpdateUserData(logined);
				if(logined){
					if(self.autoUpdateUserInfo || self.autoBindPhone){
						let p = [];
						if(self.autoUpdateUserInfo) p.push(self.doUpdateUserInfoByWx());
						if(self.autoBindPhone && self.useSmsService) p.push(self.execBindCurUserPhone());
						Promise.all(p).then(function(){//同步用户信息后才触发登录成功
							if(loginCount>0) self.fireEvent('login',{source:self});
						},function(){
							self.page.hint('同步微信用户信息失败!', 'warn');
							if(loginCount>0) self.fireEvent('login',{source:self});
						});
					}else if(loginCount>0) self.fireEvent('login',{source:self});
				}else{
					if(logoutCount>0) self.fireEvent('logout',{source:self});
				}
			};
			this.isLoginedChangeHandle = observe(isLogined,(newValue, oldValue) => {
				doLoginedChange(newValue);
			});
			if (isLogined.get()) doLoginedChange(true);
		}
		
		authorizeUserInfo(){
			if(authorizeUserInfoDfd) return authorizeUserInfoDfd;
			var dfd = {};
			authorizeUserInfoDfd = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			
			if(Device.isMiniProgram()){
				let self = this;
				wx.getSetting({
					success(res) {
						if (!res.authSetting['scope.userInfo']) {
				              let authorizeDlgCloseHandle = function(){
				                  self.page.off('show', authorizeDlgCloseHandle);
				                  authorizeDlgCloseHandle = null;
				                  wx.getSetting({
				                    success(res) {
				                      res.authSetting['scope.userInfo'] ? dfd.resolve() : dfd.reject();
				                      authorizeUserInfoDfd = null;
				                    },
				                    fail() {
									  authorizeUserInfoDfd = null;
				                      dfd.reject();
				                    }
				                  });
				                };
				                self.page.on('show', authorizeDlgCloseHandle);
	  							self.showAuthorize();
						}else dfd.resolve();
					},
					fail(){
						if(Device.isSimulate()){//模拟态，直接返回
							dfd.resolve();
						}else{
							authorizeUserInfoDfd = null;
							dfd.reject();
						}
					}
				});
			}else dfd.resolve();
			
			return authorizeUserInfoDfd;
		}
		
		//兼容原获取微信用户信息逻辑
		getWXUserInfo(init){
			let self = this;
			let ret = new Promise(function(presolve, preject) {
				let resolve = presolve, reject = preject;
				self.authorizeUserInfo().then(function(){
					//获取wx的用户信息
					let getUserInfoSuccessCallback = function(userInfo){
						//性能优化
						runInAction(() => {
							self.wxUserInfo = userInfo;
							let data = self.getData();
							if(data){
								var row = data.getCurrentRow();
								if(row){
									row.name = userInfo.nickName;
									row.avatarUrl = userInfo.avatarUrl;
									row.data2 = userInfo.province;
									row.data3 = userInfo.city;
									row.data6 = userInfo.country;
									row.data15 = userInfo.gender;
									
									//兼容
									row.nickName = userInfo.nickName;
									row.gender = userInfo.gender;
									row.province = userInfo.province;
									row.city = userInfo.city;
									row.country = userInfo.country;
									row.openId = userInfo.openId;
								}
							}
							init && self.autoLoadUserInfoDtd.resolve();
							self.fireEvent('wxUserInfoReady',{source:self,userInfo:userInfo});
							resolve(userInfo);
						});
					};
					let getUserInfoFailCallback = function(){
						runInAction(() => {
							if(Device.isX5App()||Device.isMiniProgram()){
								console.error('获取微信用户信息失败');
								init && self.autoLoadUserInfoDtd.resolve();
								reject();
							}else{
								resolve({});
							}
						});	
					};
					//let execDefault = true;
					let loginCompNames = UserHelper.getLoginCompNames() || [];
					if(loginCompNames.length>0){
						let loginComp = UserHelper.getLoginComp(loginCompNames[0]);
						if(typeof(loginComp.getUserInfo)==='function'){
							//execDefault = false;
							WxUserInfoDfd = loginComp.getUserInfo();//.then(getUserInfoSuccessCallback,getUserInfoFailCallback);
						}
					}
					//if(execDefault) 
					getWxUserInfo(self.useOpenid).then(getUserInfoSuccessCallback,getUserInfoFailCallback);
				},function(){
					self.page.hint('没有授权获取微信用户信息，获取微信用户信息失败！', 'warn');
					init && self.autoLoadUserInfoDtd.resolve();
					reject();
				});
			});
			//防止Uncaught (in promise)异常
			ret.catch(()=>{});
			return ret;
		}
		
		getData(){
			if(this.data)
				return this.page.comp(this.data);
		}
		
		getAppPath(){
			return this.appPath;
		}
		
		openWindowDialog(option){
			//option: url,params
			//options.params.userComp = this;
			option.params.userComp = this.uuid;
			wx.navigateTo(option);
		}
		
		_doLoginAfter(){
			loginCount++;
			logoutCount = 0;
			isLogined.set(true);
			this.autoLoginDtd && this.autoLoginDtd.resolve && this.autoLoginDtd.resolve();
		}
		
		_doLogoutAfter(){
			logoutCount++;
			loginCount = 0;
			isLogined.set(false);
			this.page.hint('注销成功!');
		}
		
		_doRegisterAfter(){
			this.page.hint('注册成功'+(this.useSmsService?'!':'，账号需管理员验证激活后才能使用!'));
			this.fireEvent('register',{source:this});
		}
		
		showAuthorize(options){
			options = options || {};
			options.url = this.getDlgUrl('authorize');
			if(!options.params) options.params = {};
			this.openWindowDialog(options);
		}
		
		showBindPhone(options){
			if(!this.useSmsService){
				this.page.hint('未开启使用短信服务，不支持手机号绑定!');
				return;
			}
			options = options || {};
			options.url = this.getDlgUrl('bindphone');
			if(!options.params) options.params = {};
			this.openWindowDialog(options);
		}
		
		showLogin(options){
			let loginCompNames = UserHelper.getLoginCompNames() || [];
			if(loginCompNames.length>0){
				//TODO 目前只考虑一个登录组件
				this.loginComp = UserHelper.getLoginComp(loginCompNames[0]);
			}
			if(!this.isLogined()){
				//先判断是否已经登录成功
				let _doLoginFn = ()=>{
					if(loginCompNames.length<=0){
						options = options || {};
						if((this.autoLogin||options.autoLogin) && !needLogin()) this.login(loadLoginDataByStore());
						else{
							//判断当前是不是登录页，如果是不在open
							let pages = getCurrentPages();
							if(pages.length>0){
								let route = pages[pages.length-1].route;
								if(route.endsWith('/userDialog/login')) return;
							}
							
							options.url = this.getDlgUrl('login');
							if(!options.params) options.params = {};
							this.openWindowDialog(options);
						}
					}else{
						//TODO 目前只考虑一个登录组件
						let self = this;
						this.loginComp = UserHelper.getLoginComp(loginCompNames[0]);
						this.loginComp.login({userComp:self,
							autoBindPhone:self.autoBindPhone,
							autoUpdateUserInfo:self.autoUpdateUserInfo}).then(function(userinfo){
								uaa.checkLogin().then(function(){
									self._doLoginAfter();
									self.hint('登录成功!');
								});
							},function(){
								self.page.hint('登录失败!', 'warn');
							});
					}
				};
				if(!Device.isSimulate()){
					uaa.checkLogin().then(()=>{
						this._doLoginAfter();
					},_doLoginFn);
				}else{//如果是模拟环境直接忽略检查
					_doLoginFn();
				}
			} else this._doLoginAfter();
		}
		
		showUserInfo(options){
			if(this.isLogined()){
				options = options || {};
				options.url = this.getDlgUrl('userInfo');
				if(!options.params) options.params = {};
				this.openWindowDialog(options);
			}else{
				this.showLogin(options);
			}
		}
		
		showRegister(options){
			options = options || {};
			options.url = this.getDlgUrl('register');
			if(!options.params) options.params = {};
			this.openWindowDialog(options);
		}
		
		showForgetPassword(options){
			if(!this.useSmsService){
				this.page.hint('未开启使用短信服务，不支持短信验证码重置密码!');
				return;
			}
			
			options = options || {};
			options.url = this.getDlgUrl('forgetPassword');
			if(!options.params) options.params = {};
			this.openWindowDialog(options);
		}
		
		showChangePassword(options,page){
			page = page || this.page;
			if(this.isLogined()){
				options = options || {};
				options.url = this.getDlgUrl('changePassword');
				if(!options.params) options.params = {};
				this.openWindowDialog(options);
			}else 
				page.hint("登陆后才能修改密码!", 'warn');
		}

		login(user,page){
			//name,password
			page = page || this.page;
			let self = this;
			let ret = uaa.login(user.name,user.password);
			ret.then(function(){
				saveLoginDataToStore(user);
				self._doLoginAfter();
				self.hint('登录成功!');
			},function(error){
				var errorMsg = {};
				try{
					if(error && error.data && error.data.message){
						typeof(error.data.message)=='string'?(errorMsg = JSON.parse(error.data.message)):(errorMsg = error.data.message);
					}
				}catch(e){/*忽略错误*/}
				if(typeof(errorMsg.error_description)=='string'&&errorMsg.error_description.indexOf("Your account has been locked because of too many failed attempts to login") != -1){
					page.hint('由于多次输入错误，该帐号已被锁定，请半个小时后重试！', 'warn');
				}else if(typeof(errorMsg.error_description)=='string'&&errorMsg.error_description.indexOf("Account not verified")!=-1){
					page.hint('账号需管理员验证激活后才能使用！', 'warn');
				}else{
					page.hint('登录失败，确定用户名密码或者验证码是否正确，或者账户已被禁用！', 'warn');
				}				
				clsLoginDataToStore();
				self.showLogin();
			});
			return ret;
		}
		
		logout(page){
			page = page || this.page;
			let self = this;
			let ret = !(this.loginComp&&typeof(this.loginComp.logout)==='function')?uaa.logout():this.loginComp.logout();
			ret.then(function(){
				self._doLogoutAfter();
				clsLoginDataToStore();
				if(self.logoutAfterToLogin && !self.loginComp) 
					setTimeout(()=>{
						self.showLogin();
					},100);
			},function(){
				page.hint('注销失败!', 'warn');
			});
			return ret;
		}
		
		changePassword(oldPassword,password,page){
			page = page || this.page;
			let self = this;
			let ret = uaa.changePassword(oldPassword,password);
			ret.then(function(){
				clsLoginDataToStore();
				page.hint("密码修改成功！");
			},function(error){
				page.hint("密码修改失败!", 'warn');
			});
			return ret;
		}
		
		register(user,page){
			//name,phone,email,password
			page = page || this.page;
			let self = this;
			user.active = true;
			//当没有短信服务时verified=false，不需要短信验证码
			if(!this.useSmsService){
				user.verified = false;
				user.code = null;
				user.phone = "";
			}			
            console.log("Will register user:");
            console.log(user);
			let ret = uaa.register(user,user.code);
			ret.then(function(u){
				saveLoginDataToStore({name:user.userName,password:user.password||u.password});
				self._doRegisterAfter();
				if(self.useSmsService){
					setTimeout(()=>{
						self.showLogin({autoLogin:true});
					},100);
				}
			},function(error){
				let txt = '';
				if(error && (error.statusCode=='409' || (error.response && error.response.status=='409'))) txt = self.useSmsService?"手机已经被注册":"用户名已经被注册";
				page.hint('注册失败！'+txt, 'warn');
			});
			return ret;
		}
		
		sendVerifyCode(type,tel,page){
			page = page || this.page;
			if(!this.useSmsService){
				page.hint('未开启使用短信服务，不支持发送短信验证码!');
				return;
			}
			let ret = uaa.sendVerifyCode(type,tel);
			ret.then(function(){
				page.hint("发送验证码成功！");
			},function(error){
				page.hint('发送验证码失败！', 'warn');
			});
			return ret;
		}
		
		resetPassword(tel,code,newPassword,page){
			page = page || this.page;
			if(!this.useSmsService){
				page.hint('未开启使用短信服务，不支持短信验证码重置密码!');
				return;
			}
			let self = this;
			let ret = uaa.resetPassword(tel,code,newPassword);
			ret.then(function(){
				page.hint("重置密码成功！");
			},function(error){
				page.hint('重置密码失败，验证码无效或者新旧密码相同！', 'warn');
			});
			return ret;
		}
		
		isLogined(){
			return uaa.isLogined();
		}
		
		getUser(){
			return Object.assign({}, this.wxUserInfo, User.getCurrentUser());
		}
		
		updateCurUser(u){
			let page = this.page;
			let dfd = {};
			let promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//防止Uncaught (in promise)异常
			promise.catch(()=>{});

			if(this.isLogined() && User.getCurrentUser()){
				let self = this;
				uaa.updateCurUser(u).then(function(){	
					User.updateUserData({logined:true});//修改应用中所有用户组件用户数据修改
					dfd.resolve();
				},function(e){
					page.hint('更新用户信息失败！'+(e||""), 'warn');
					dfd.reject();
				});
			}else{
				page.hint('请先登录再更新用户信息！', 'warn');
				dfd.reject();
			}
			
			return promise;
		}
		
		execBindCurUserPhone(){
	    	let self = this;
			let dfd = {};
			let promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//防止Uncaught (in promise)异常
			promise.catch(()=>{});

			if(this.isLogined()){
				//调用用户组件接口更新
				let cUser = User.getCurrentUser();
				if(!cUser.phone){
					let bindPhoneDlgCloseHandle = function(){
						self.page.off('show', bindPhoneDlgCloseHandle);
						bindPhoneDlgCloseHandle = null;
						cUser = User.getCurrentUser();
						dfd.resolve();
						if(!cUser.phone) console.log("手机号未绑定");
						else{//更新data上的phone
							let data = self.getData();
							if(data){
								let row = data.getCurrentRow();
								if(row){
									runInAction(() => {//放在一个事务内
										row.phone = cUser.phone;
									});
								}
							}
						}
					};
					self.page.on('show', bindPhoneDlgCloseHandle);
					self.showBindPhone();
				}else dfd.resolve();
			}else{
				page.hint('请先登录再进行手机号绑定！', 'warn');
				dfd.resolve();
			}
			return promise;
		}
		
		bindCurUserPhone(phone,code){
			return uaa.bindCurUserPhone(phone,code);
		}
		
	    doUpdateUserInfoByWx() {
	    	let userComp = this;
			let dfd = {};
			let promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//防止Uncaught (in promise)异常
			promise.catch(()=>{});

			if(Device.isX5App()||Device.isMiniProgram()){//
				//调用用户组件接口更新
				let cUser = User.getCurrentUser();
				userComp.getWXUserInfo().then(function(userInfo){
					if(cUser.name!==userInfo.nickName 
							|| cUser.avatarUrl!==userInfo.avatarUrl){//目前判断条件name或者avatarUrl不同
						let u = {
								name : userInfo.nickName,
								avatarUrl : userInfo.avatarUrl,
								data2 : userInfo.province,
								data3 : userInfo.city,
								data6 : userInfo.country,
								data15 : userInfo.gender,
						};
						userComp.updateCurUser(u).then(function(){
							dfd.resolve();
						},function(){
							dfd.reject();
						});
					}else dfd.resolve();
				},function(){
					dfd.reject();
				});
			}else dfd.resolve();
	    	
	    	return promise;
	    }

		initOperation(){
	    	 super.initOperation();
	    	 var operations = {
	    				'login' : {
	    					label : '',//登录
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.showLogin();
	    					}
	    				},
	    				'logout' : {
	    					label : '',//注销
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.logout();
	    					}
	    				},
	    				'register' : {
	    					label : '',//注册用户
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.showRegister();
	    					}
	    				},
	    				'showUser' : {
	    					label : '',//显示用户
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.showUserInfo();
	    					}
	    				},
	    				'changePassword' : {
	    					label : '',//修改密码
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.showChangePassword();
	    					}
	    				},
	    				'showForgetPassword' : {
	    					label : '',//忘记密码
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.showForgetPassword();
	    					}
	    				},
	    				'getUserInfo' : {
	    					label : '',//获取用户信息
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.getWXUserInfo();
	    					}
	    				},
	    				'updateCurUser' : {
	    					label : '',//更新当前用户
	    					argsDef : [{name:'user',displayName:'用户数据'}],
	    					method : function(args) {				
	    						let uData = {};
	    						if(Util.isArray(args.user)&&args.user.length>0){
	    							for(let i=0; i<args.user.length; i++){
	    								uData[args.user[i].filed] = args.user[i].value; 
	    							}
	    						}
	    						return this.owner.updateCurUser(uData);
	    					}
	    				},
	    				'bindCurUserPhone' : {
	    					label : '',//账号绑定手机
	    					argsDef : [],
	    					method : function(args) {				
	    						return this.owner.execBindCurUserPhone();
	    					}
	    				}
	    			};
	    	 for (let name in operations)
	    		 this.defineOperation(name, operations[name]);
	     }
	}
	
	User.getLoginedObservable = function(){
		return isLogined;
	};
	
	User.getCurrentUser = function(){
		return uaa.getCurrentUser();
	};
	
	User.phoneNumExist = function(num){
		return uaa.phoneNumExist(num);
	};

	User.userNameExist = function(name){
		return uaa.userNameExist(name);
	};
	
	User.phoneReg = /^[1][0-9][0-9]{9}$/;
	User.phoneHint = "手机号码格式不正确!";
	User.userNameReg = /^[a-zA-Z][a-zA-Z0-9_]{2,31}$/;
	User.userNameHint = "请输入首位为字母由3-32位字母和数字的组合的用户名!";
	User.emailReg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	User.emailHint = "邮箱格式不正确!";
	User.passwordReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]{6,16}$/;
	User.passwordHint = "请输入由6-16位字母和数字的组合的密码!";

	User.bindTimmer = function(data, loopSecond, title1, title2) {
		var waittime = loopSecond;
		var mytimer = function() {
			if (waittime <= 0) {
				data.setValue("btnDisabled",false);
				data.setValue("btnLabel",title1);
			} else {
				data.setValue("btnDisabled",true);
				data.setValue("btnLabel",title2 + "(" + waittime + ")");
				waittime--;
				setTimeout(function() {
					mytimer();
				}, 1000);
			}
		};
		mytimer();
	};
	
	let UserComp = {};	
	User.regUserComp = function(comp){
		comp && comp.uuid && (UserComp[comp.uuid] = comp);
	};
	
	User.unregUserComp = function(comp){
		comp && comp.uuid && (delete UserComp[comp.uuid]);
	};
	
	User.updateUserData = function(option){
		for(let uid in UserComp){
			let comp = UserComp[uid];
			try{
				comp && comp.updateUserDataHandle && comp.updateUserDataHandle(option);
			}catch(e){}//屏蔽错误
		}
	};

	User.getUserComp = function(id){
		return UserComp[id];
	};
	
wx.comp = wx.comp || {};
wx.comp.User = User;
