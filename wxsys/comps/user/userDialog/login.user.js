import wx from '../../../lib/base/wx';
import PageImpl from "../../../lib/base/pageImpl";
import User from "../user";
import Util from "../../../lib/base/util";


var app = getApp();
export default class EditPage extends PageImpl {
  constructor(...args){super(...args);}
  
  login() {
	  let data = this.comp('loginData');
	  let name = data.getValue('name');
	  let password = data.getValue('password');
	  let type = data.getValue('type');
	  let params = {};
	  params.name = name;
		// 自动设置参数的情况
	  params.password = password;
	  if (!params.name) {
			this.hint(type==='password'?'请输入登录账号!':'请输入手机号码','warn');
			return;
		}
	  if (type!=='password' && !params.password) {
			this.hint('请输入短信验证码!','warn');
			return;
		}
	  if (this.userComp) {
		  if(type==='password'){
			  this.userComp.login(params,this).then(() => {
				  wx.navigateBack();
			  },()=>{});
		  }else{
			  User.phoneNumExist(name).then((exist)=>{
				  if(exist){
					  this.userComp.login(params,this).then(() => {
						  wx.navigateBack();
					  },()=>{});
				  }else{
					  this.userComp.register({userName:name,phone:name,code:password},this).then(() => {
						  wx.navigateBack();
					  },()=>{});
				  }
			  },()=>{
				  this.hint('校验手机号失败请重试！', 'warn');
			  });
		  }
		}
  }
	
  pageLoad(event){
	  let ctrl = this.comp('ctrl');
	  ctrl.refreshData();
	  if(this.params.userComp){
	  	this.userComp = User.getUserComp(this.params.userComp);
	  	ctrl.setValue('useSmsService',this.userComp && this.userComp.useSmsService);
	  }	
  }
  
  sendSmsBtnClick(event) {
		let ctrldata = this.comp('ctrl');
		if(ctrldata.getValue('btnDisabled')) return;
		let data = this.comp('loginData');
		let phoneNumber = data.getValue("name");
		if(!User.phoneReg.test(phoneNumber)){
			this.hint(User.phoneHint,'warn');
			return;			
		}
		let self = this;
		this.userComp && this.userComp.sendVerifyCode("sms-verify-code",phoneNumber,this).then(()=>{
			User.bindTimmer(ctrldata,60,"获取验证码","重发");
		},()=>{});
  }
  
  loginBtnClick(event) {
	  this.login();
  }
  
  regBtnClick(event) {
	  if (this.userComp)
		  this.userComp.showRegister();
  }

  btnForgetClick(event) {
	  if (this.userComp)
		  this.userComp.showForgetPassword();
  }
  
}
