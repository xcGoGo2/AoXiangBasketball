import wx from '../../../lib/base/wx';
import PageImpl from "../../../lib/base/pageImpl";
import User from "../user";
import Util from "../../../lib/base/util";


var app = getApp();
export default class EditPage extends PageImpl {
  constructor(...args){super(...args);}
  
  pageLoad(event){
	  let ctrl = this.comp('ctrl');
	  ctrl.refreshData();
	  if(this.params.userComp){
		  this.userComp = User.getUserComp(this.params.userComp);
		  ctrl.setValue('useSmsService',this.userComp && this.userComp.useSmsService);
	  }
  }
 
 	pageUnload(event){
	}
 
 	setUserInfo(event){
 		if(event.originalEvent && event.originalEvent.detail && event.originalEvent.detail.userInfo){
 			let data = this.comp('data');
 			this.userInfo = event.originalEvent.detail.userInfo;
 			data.setValue("name", this.userInfo.nickName);
 		}
 	}
 	
	sendSmsBtnClick(event) {
		let ctrldata = this.comp('ctrl');
		if(ctrldata.getValue('btnDisabled')) return;
		let data = this.comp('data');
		let phoneNumber = data.getValue("phone");
		if(!User.phoneReg.test(phoneNumber)){
			this.hint(User.phoneHint,'warn');
			return;			
		}
		User.phoneNumExist(phoneNumber).then((exist)=>{
			if(!exist){
				this.userComp && this.userComp.sendVerifyCode("sms-user-reg",phoneNumber,this).then(()=>{
					User.bindTimmer(ctrldata,60,"获取验证码","重发");
				},()=>{});
			}else this.hint('手机号已经被注册！', 'warn');
		},()=>{
			this.hint('校验手机号失败请重试！', 'warn')
		});
	}

	moreBtnClick(event) {
		let data = this.comp('data');
		let more = data.getValue('more');
		data.setValue('more', !more);
	}
	
	okBtnClick(event) {
		let useSmsService = this.userComp.useSmsService;
		let data = this.comp('data');
		let newPassword = data.getValue("newPassword");
		let confirmPassword = data.getValue("confirmPassword");
		let verifyCode = data.getValue("verifyCode");
		let phoneNumber = data.getValue("phone");
		let userName = data.getValue("userName");
		let name = data.getValue("name") || phoneNumber || userName;
		let email = data.getValue("email");
		let openId = data.getValue("openId");

		if(useSmsService && !User.phoneReg.test(phoneNumber)){
			this.hint(User.phoneHint,'warn');
			return;			
		}

		if (useSmsService && !verifyCode) {
			this.hint("请输入验证码",'warn');
			return;
		}

		if(!useSmsService && !User.userNameReg.test(userName)){
			this.hint(User.userNameHint,'warn');
			return;			
		}

		if (newPassword !== confirmPassword) {
			this.hint('密码输入不一致','warn');
			return;
		}
		
		if (!User.passwordReg.test(newPassword)) {
			this.hint(User.passwordHint,'warn');
			return;
		}
		
		let regFN = ()=>{
			if(this.userComp){
				let user = {
					openId: openId,
					userName: userName || phoneNumber,
					name: name,
					code: verifyCode,
					phone: phoneNumber,
					password: newPassword
				}; 
				if(this.userInfo){
					user.data6 = this.userInfo.country;
					user.data2 = this.userInfo.province;
					user.data3 = this.userInfo.city;
					user.avatarUrl = this.userInfo.avatarUrl;
					user.data15 = this.userInfo.gender;
				}
				
				if(data){
						var row = data.getCurrentRow();
						if(row){
							let items = data.getColumnDefs();
							for ( let o in items) {
								if(!user[o]&&row[o]&&o!=='id')
									user[o] = row[o];
							}
						}
				}
				user.email = email;
				this.userComp.register(user,this).then(()=>{
					let pages = getCurrentPages();
					let delta = 1;
					if(pages.length>=2){
						let route = pages[pages.length-2].route;
						delta = route.endsWith('/userDialog/login')?2:1;
					}
					wx.navigateBack({delta});
				},()=>{});
			}
		};
		
		if(useSmsService){
			regFN();
		}else{
			User.userNameExist(userName).then((exist)=>{
				if(!exist){
					regFN();
				}else this.hint('用户名已经被注册！', 'warn');
			},()=>{
				this.hint('校验用户名失败请重试！', 'warn');
			});
		}
	}
  
}
