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
  
  passwordSaveBtnClick(event) {
	  	let data = this.comp('data');
		let oPassword = data.getValue('oldPassword');
		let newPassword = data.getValue("newPassword");
		let confirmPasswd = data.getValue("confirmPasswd");
		let passwordReg = User.passwordReg;

		if (newPassword !== confirmPasswd) {
			this.hint("新密码不一致！",'warn');
			return;
		}

		if (!passwordReg.test(newPassword)) {
			this.hint(User.passwordHint,'warn');
			return;
		}

		if(this.userComp){
			let self = this;
			this.userComp.changePassword(oPassword,newPassword,this).then(
				()=>{
					wx.navigateBack();
				},()=>{}
			);
		}
	}
}
