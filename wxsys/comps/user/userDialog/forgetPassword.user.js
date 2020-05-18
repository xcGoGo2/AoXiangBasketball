import wx from '../../../lib/base/wx';
import PageImpl from "../../../lib/base/pageImpl";
import User from "../user";
import Util from "../../../lib/base/util";


var app = getApp();
export default class EditPage extends PageImpl {
  constructor(...args){super(...args);}
  
  pageLoad(event){
	  if(this.params.userComp) this.userComp = User.getUserComp(this.params.userComp);	
  }
 
	sendSmsBtnClick(event) {
		let ctrldata = this.comp('ctrl');
		if(ctrldata.getValue('btnDisabled')) return;
		let data = this.comp('data');
		let phoneNumber = data.getValue("phonenumber");
		if(!User.phoneReg.test(phoneNumber)){
			this.hint(User.phoneHint,'warn');
			return;			
		}
		let self = this;
		this.userComp && this.userComp.sendVerifyCode("sms-password-reset",phoneNumber,this).then(()=>{
			User.bindTimmer(ctrldata,60,"获取验证码","重发");
		},()=>{});
	}

	okBtnClick(event) {
		let data = this.comp('data');
		let newPassword = data.getValue("newPassword");
		let confirmPassword = data.getValue("confirmPassword");
		let verifyCode = data.getValue("verifyCode");
		let phoneNumber = data.getValue("phonenumber");

		if(!User.phoneReg.test(phoneNumber)){
			this.hint(User.phoneHint,'warn');
			return;			
		}

		if (!verifyCode) {
			this.hint("请输入验证码",'warn');
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
		
		if(this.userComp){
			let self = this;
			this.userComp.resetPassword(phoneNumber,verifyCode,newPassword,this).then(()=>{
				wx.navigateBack();
			},()=>{});
		}
	}
  
}
