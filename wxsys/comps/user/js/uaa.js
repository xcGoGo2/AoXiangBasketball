import wx from '../../../lib/base/wx';
import _Date from "../../../lib/base/date";
import {isArray} from "../../../lib/base/util";
import _String from "../../../lib/base/string";

	const baseUrl = (wx.App.baseUrl||"") + "/uaa";
	const apiGatewayUrl = wx.App.baseUrl||"";
	const smsUrl = (wx.App.baseUrl||"") + "/sms";
	const _password = [ 33, 44, 55, 66, 42, 31, 12, 27 ];	

	let isLogined = false;
	let curUser = null;
	
	function getGroupsName(groups) {
		var sysGroups = [ 'uaa.offline_token', 'approvals.me', 'user_attributes', 'cloud_controller.read', 'roles', 'oauth.approvals',
				'cloud_controller_service_permissions.read', 'scim.me', 'openid', 'uaa.user', 'profile', 'cloud_controller.write', 'password.write',
				'scim.userids' ,"scim.read","acme","acme.dev"];
		var ret = [];
		for(let i=0,len=groups.length;i<len;i++){
			let group = groups[i];
			var name = group.display;
			if (sysGroups.indexOf(name) < 0)
				ret.push(decodeURI(name));
		}
		return ret;
	}
	
	function createHttpHeaders(token){
		var ret = {
				'content-type': 'application/json'
		};
		return ret;
	}
	
	function processPassword(pw){
		return typeof(pw)==='string'?_String.trim(pw):pw;  
	}
	
	/*
	   user上扩展的字段
	   data1 VARCHAR(128),openid
	   data2 VARCHAR(128),----省--province
	   data3 VARCHAR(128),----市--city
	   data4 VARCHAR(128)----QQ
	   data5 VARCHAR(128)----weibo
	   data6 VARCHAR(128)----国家--country
	   data7 VARCHAR(128)
	   data8 VARCHAR(128)
	   data9 VARCHAR(255)----地址--address
	   data10 VARCHAR(255)
	   data11 VARCHAR(255)
	   data12 VARCHAR(255)
	   data13 VARCHAR(4096)
	   data14 VARCHAR(4096)
	   data15 INTEGER----性别--gender--值为1时是男性，值为2时是女性，值为0时是未知
	   data16 INTEGER
	   data17 TIMESTAMP----出生年月日--birthday
	   data18 TIMESTAMP
	 */
	function processUser(user){
		user.name = user.name.formatted || user.name.givenName || user.userName;
		try{
			user.name = decodeURI(user.name);
		}catch(e){/*忽略异常*/}
		user._emails = user.emails;
		user.email = user.emails[0].value;
		user._groups = user.groups;
		user.groups = getGroupsName(user.groups);
		user._meta = user.meta;
		user.createTime = new Date(user.meta.created);
		user._phoneNumbers = user.phoneNumbers;
		user.phone = ((user.phoneNumbers&&user.phoneNumbers[0]) ? user.phoneNumbers[0].value : "")||"";
	}
	
	/*
	   group上扩展的字段
	   data1 VARCHAR(128)
	   data2 VARCHAR(255)
	   data3 INTEGER
	   data4 TIMESTAMP
	 */
	function processGroup(group){
		try{	
			group.displayName = decodeURI(group.displayName);
		}catch(e){/*忽略异常*/}
		group.name = group.displayName;
		if(group.description=="_user_create_") group.description = "";
	}
	
	function processUserToSave(user){
		var name = user.name||"";
		var ret = {
				id : user.id,
				userName: user.userName,
				name : {formatted: name,givenName:name},
				emails : [{value:user.email|| (user.userName + "@newdao.net"),primary:true}],
				phoneNumbers : [user.phone]
		};
		if(user.active!==undefined)	ret.active = user.active;
		if(user.verified!==undefined)	ret.verified = user.verified;
		if(user.origin!==undefined)	ret.origin = user.origin;
		if(user.externalId!==undefined)	ret.externalId = user.externalId;
		if(user.password!==undefined)	ret.password = processPassword(user.password);//encrypt(user.password,_password);
		if(user.avatarUrl!==undefined)	ret.avatarUrl = user.avatarUrl;
		if(user.description!==undefined)	ret.description = user.description;

		if(user.data2) ret.data2 = user.data2; 
		if(user.data3) ret.data3 = user.data3; 
		if(user.data4) ret.data4 = user.data4; 
		if(user.data5) ret.data5 = user.data5; 
		if(user.data6) ret.data6 = user.data6; 
		if(user.data7) ret.data7 = user.data7; 
		if(user.data8) ret.data8 = user.data8; 
		if(user.data9) ret.data9 = user.data9; 
		if(user.data10) ret.data10 = user.data10; 
		if(user.data11) ret.data11 = user.data11; 
		if(user.data12) ret.data12 = user.data12; 
		if(user.data13) ret.data13 = user.data13; 
		if(user.data14) ret.data14 = user.data14; 
		if(undefined!==user.data15) ret.data15 = user.data15;
		if(undefined!==user.data16) ret.data16 = user.data17;
		if(user.data17 instanceof Date) ret.data17 = user.data17.toISOString();
		else if(user.data17) ret.data17 = user.data17;
		if(user.data18 instanceof Date) ret.data18 = user.data18.toISOString();
		else if(user.data18) ret.data18 = user.data18;

		return ret;
	}
	
	function processGroupToSave(group){
		var name = group.name||"";
		var ret = {
				displayName : name,
				type : group.type || 'default'
		};
		if(group.description) ret.description = group.description;
		if(group.members) ret.members = group.members;
		if(group.data1) ret.data1 = group.data1; 
		if(group.data2) ret.data2 = group.data2; 
		if(undefined!==group.data3) ret.data3 = group.data3;
		if(group.data4 instanceof Date) ret.data4 = group.data4.toISOString();
		else if(group.data4) ret.data4 = group.data4;
		return ret;
	}
	
	function errorInfo(status){
		var error = {
				"400" : "请求无效JSON格式或缺少的字段",
				"401" : "无效的Token",
				"403" : "没有权限修改",
				"404" : "不存在",
				"409" : "已经存在"
		};
		return error[status];
	}
	
	var tokenDfd = new Promise(function(resolve, reject) {
		  resolve({});
	});

	function getToken(){
		return tokenDfd;
	}
	
	function request(option){
		return new Promise(function(resolve, reject) {
			option = option || {};
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
	}
	
	function encrypt(str, key) {
		var ret = '', keyLen = key.length;
		for (var i = 0; i < str.length; i++) {
			ret += String.fromCharCode(str.charCodeAt(i) ^ key[i % keyLen]);
		}
		return ret;
	}
	
	var uaa = {
		encrypt: function(str, key){
			return encrypt(str, key);
		},	
		getCurrentUser: function(){
			return curUser;
		},
		isLogined : function() {
			return isLogined;
		},
		sendVerifyCode: function(type,tel){
			var headers = createHttpHeaders();
			return request({
				method : "POST",
				url : smsUrl + "/verifyCode",
				header: headers,
				data : {
					template : type,
					phone : tel
				}
			});
		},
		phoneNumExist: function(num){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			var filter = 'phoneNumber eq "'+num+'"';
			var params = {filter:filter,_:(new Date()).getTime()};
			var headers = createHttpHeaders();
			headers.Accept = "application/json";
			request({
				method : "GET",
				url : baseUrl + "/ids/Users",
				header : headers,
				data : params
			}).then(function(data) {
				dfd.resolve(isArray(data.resources) && data.resources.length>0);
			},function(error) {
				dfd.reject(error);
			});
			return promise;
		},
		userNameExist: function(name){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			var filter = 'userName eq "'+name+'"';
			var params = {filter:filter,_:(new Date()).getTime()};
			var headers = createHttpHeaders();
			headers.Accept = "application/json";
			request({
				method : "GET",
				url : baseUrl + "/ids/Users",
				header : headers,
				data : params
			}).then(function(data) {
				dfd.resolve(isArray(data.resources) && data.resources.length>0);
			},function(error) {
				dfd.reject(error);
			});
			return promise;
		},
		resetPassword: function(tel,code,newPassword){
			//newPassword = this.encrypt(newPassword,_password);
			var headers = createHttpHeaders();
			return request({
				method : "POST",
				url : baseUrl + "/reset_password",
				dataType:"json",
				header : {
					Accept : "application/json",
					"Content-Type":"application/x-www-form-urlencoded"
				},
				data : {
					code : code,
					tel : tel,
					password: processPassword(newPassword)
				}
			});
		},
		register: function(user,code){
			var headers = createHttpHeaders();
			headers['code'] = code;
			headers['tel'] = user.userName;
			headers['openid'] = user.openId;
			var data = processUserToSave(user);

			return request({
				method : "POST",
				url : baseUrl + "/Users/register",
				header : headers,
				data : data
			});
		},
		checkLogin : function(){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			if(!uaa.isLogined()){
				var self = this;
				request({
					method : "GET",
					url : baseUrl + "/userinfo",
					dataType:"json",
					cache: false
				}).then(function(data) {
					if(data && data.error) dfd.reject(data.error);
					else{
						//获取分组信息
						uaa.getUser(data.user_id).then(function(user) {
							self.loginAfter(user);
							dfd.resolve(user);
						},function(err){dfd.reject(err);});
					}	
				},function(error) {
					dfd.reject(error);
				});
			}else dfd.resolve(curUser);
			return promise;
		},
		bindCurUserPhone : function(phone,code){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			if(this.isLogined()){
				var self = this;
				let cu = this.getCurrentUser();
				if(cu){
					request({
						method : "GET",
						url : baseUrl + "/Users/verify/phone/" + phone,
						header : {
							Accept : "application/json"
						},
						data : {
							code : code,
							userId : cu.id
						}
					}).then(function(data) {
						//重新加载当前用户信息
						uaa.getUser(cu.id).then(function(user) {
							self.loginAfter(user);
							dfd.resolve(user);
						},function(err){dfd.reject(err);});
					},function(error) {
						dfd.reject(error);
					});
				}else dfd.reject("获取当前登录人信息失败");
			}else dfd.reject("请先登录");
			return promise;
		},
		login : function(username, password) {
			//password = this.encrypt(password,_password);
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			var self = this;
			request({
				method : "POST",
				url : apiGatewayUrl + "/login",
				dataType:"json",
				header : {
					Accept : "application/json",
					"Content-Type":"application/x-www-form-urlencoded"
				},
				data : {
					username : username,
					password : processPassword(password)
				}
			}).then(function(data) {
				if(data && data.error) dfd.reject(data.error);
				else{
	                //获取分组信息
					uaa.getUser(data.user_id).then(function(user) {
						self.loginAfter(user);
						dfd.resolve(user);
					},function(err){dfd.reject(err);});
				}
			}).catch(function(error) {
				dfd.reject(error);
			});
			return promise;
		},
		loginAfter : function(data) {
			/*
			data.id = data.user_id;
			data.userName = data.user_name;
			data.name = decodeURI(data.given_name);
			data.phone = data.phone_number;
			*/
			isLogined = true;
			curUser = data;			
		},
		logout : function() {
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			request({
				url : apiGatewayUrl + "/logout",
				xhrFields : {
					withCredentials : true
				},
				dataType : "text",
				cache: false
			}).then(function(data) {
				curUser = null;
				isLogined = false;
				dfd.resolve(data);
			}).catch(function(error) {
				dfd.reject(error);
			});

			return promise;
		},
		changePassword : function(oldPassword, password) {
			//oldPassword = this.encrypt(oldPassword,_password);
			//password = this.encrypt(password,_password);
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			if (uaa.isLogined()) {
				getToken().then(function(token){
					var headers = createHttpHeaders(token.access_token);
					headers['Accept'] = "application/json";

					request({
						method : "PUT",
						url : baseUrl + "/Users/"+curUser.id+"/password",
						header: headers,
						data : JSON.stringify({
							oldPassword : processPassword(oldPassword),
							password : processPassword(password)
						})
					}).then(function(data){
						dfd.resolve(data);
					},function(error){
						dfd.reject(errorInfo(error.status));
					});
				},function(){
					dfd.reject("token error");
				});
			} else {
				dfd.reject({
					errorCode : 'NOT_LOGINED'
				});
			}
			return promise;
		},
		getGroups : function(params){
			params = params || {};
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method : "GET",
					url : baseUrl + "/Groups",
					header:headers,
					data : params
				}).then(function(data) {
					var rows = [];
					if (isArray(data.resources)) {
						for(let i=0,len=data.resources.length;i<len;i++){
							let group = data.resources[i];
							if(group.type || group.description==="_user_create_"){//group.description==="_user_create_"兼容老的创建，新的使用data3===1标识用户创建组
								processGroup(group);
								rows.push({
									id:group.id,
									name : group.displayName
								});
							}
						}
					}
					dfd.resolve(rows);
				}).catch(function(error) {
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		getUsers : function(params) {
			params = params || {};
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method : "GET",
					url : baseUrl + "/Users",
					header:headers,
					data : params
				}).then(function(data) {
					if (isArray(data.resources)) {
						for(let i=0,len=data.resources.length;i<len;i++){
							let user = data.resources[i];
							processUser(user);
						}
					}
					dfd.resolve(data);
				}).catch(function(error) {	
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		createUser : function(user) {
			user = processUserToSave(user);
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method : "POST",
					url : baseUrl + "/Users",
					header:headers,
					data : JSON.stringify(user)
				}).then(function(data) {
					processUser(data);
					dfd.resolve(data);
				}, function(error) {
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		createGroup : function(group){
			group = processGroupToSave(group);
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method : "POST",
					url : baseUrl + "/Groups",
					header:headers,
					data : JSON.stringify(group)
				}).then(function(data) {
					processGroup(data);
					var group = {
						id:data.id,
						name : data.displayName
					};
					dfd.resolve(group);
				}, function(error) {
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		updateUser: function(user){
			var version = user.meta.version;
			user = processUserToSave(user);
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//处理user字段
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				headers['If-Match'] = version;
				request({
					method:"PUT",
					url:baseUrl+"/Users/"+user.id,
					header:headers,
					data : JSON.stringify(user)
				}).then(function(data){
					processUser(data);
					dfd.resolve(data);
				},function(error){
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		updateCurUser: function(user){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			if(uaa.isLogined()){
				let cuser = uaa.getCurrentUser();
				if(cuser){
					if(user){
						let u = Object.assign({},cuser);
						Object.assign(u,user);
						u.id = cuser.id;
						u.meta || (user.meta = {});
						u.meta.version = cuser.meta.version;
						uaa.updateUser(u).then(function(data){
							uaa.loginAfter(data);
							dfd.resolve(data);
						},function(error){
							dfd.reject(error);
						});
					}else dfd.resolve(cuser);
				}else dfd.reject("请先登录");
			}else dfd.reject("请先登录");
			return promise;
		},
		getUser : function(uid){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//处理user字段
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method:"GET",
					url:baseUrl+"/Users/"+uid,
					header:headers
				}).then(function(data){
					processUser(data);
					dfd.resolve(data);
				},function(error){
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		deleteGroup :function(gid){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//处理user字段
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method:"DELETE",
					url:baseUrl+"/Groups/"+gid,
					header:headers
				}).then(function(data){
					dfd.resolve(data.id);
				},function(error){
					dfd.reject(error);
				});
			});
			return promise;
		},
		addMember : function(gid,uid){
			var params = {"origin":"uaa","type":"USER","value":uid};
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method : "POST",
					url : baseUrl + "/Groups/"+gid+"/members",
					header:headers,
					data : JSON.stringify(params)
				}).then(function(data) {
					dfd.resolve(data);
				}, function(error) {
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		removeMember : function(gid,uid){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method : "DELETE",
					url : baseUrl + "/Groups/"+gid+"/members/"+uid,
					header:headers,
				}).then(function(data) {
					dfd.resolve(data);
				}, function(error) {
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		listMember : function(gid){
			var  params = {
					"returnEntities":true
			};
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//处理user字段
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method:"GET",
					url:baseUrl+"/Groups/"+gid+"/members",
					header:headers,
					data : params
				}).then(function(data){
					var uids = [];
					if(data.length>0){
						for(let i=0,len=data.length;i<len;i++){
							let v = data[i];
							uids.push(v.value);
						}
					}
					dfd.resolve(uids);
				},function(error){
					dfd.reject(errorInfo(error.status));
				});
			});
			return promise;
		},
		deleteUser: function(uid){
			var dfd = {};
			var promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			//处理user字段
			getToken().then(function(token){
				var headers = createHttpHeaders(token.access_token);
				headers['Accept'] = "application/json";
				request({
					method:"DELETE",
					url:baseUrl+"/Users/"+uid,
					header:headers
				}).then(function(data){
					dfd.resolve(data);
				},function(error){
					dfd.reject(error);
				});
			});
			return promise;
		}
	};

export default uaa;
