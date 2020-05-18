import wx from '../../../lib/base/wx';
import PageImpl from "../../../lib/base/pageImpl";
import User from "../user";

export default class IndexPage extends PageImpl {
	constructor(...args){
		super(...args);
	}
	
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

		User.phoneNumExist(phoneNumber).then((exist)=>{
			let smsFn = ()=>{
				this.userComp && this.userComp.sendVerifyCode("sms-verify-code",phoneNumber,this).then(()=>{
					User.bindTimmer(ctrldata,60,"获取验证码","重发");
				},()=>{});
			};
			if(exist){
				wx.showModal({
					title:'友情提示',
					content:'手机号已经被注册，确定继续绑定？', 
					success: function(res) {
						if (res.confirm) smsFn();
					}
				});
			}else smsFn();
		},()=>{
			this.hint('校验手机号失败请重试！', 'warn')
		});
	}
	
	bindPhone(event){
		let data = this.comp('data');
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
		
		this.userComp && this.userComp.bindCurUserPhone(phoneNumber,verifyCode).then(()=>{
			wx.navigateBack();
		},(error)=>{
			this.hint("手机号码绑定失败！"+(typeof(error)==="string"?error:""),'warn');
		});
		
	}
}
