import wx from '../../../lib/base/wx';
import PageImpl from "../../../lib/base/pageImpl";
import User from "../user";
import Util from "../../../lib/base/util";

var app = getApp();
export default class EditPage extends PageImpl {
  constructor(...args){super(...args);}
  
  pageLoad(event){
	if(this.params.userComp){
		this.userComp = User.getUserComp(this.params.userComp);
		this.comp('data').refreshData();
	}
  }
  
	quitBtnClick(event){
		if(this.userComp)
			this.userComp.logout(this).then(()=>{
				wx.navigateBack();
			},()=>{});
	}

	changepwBtnClick(event){
		if(this.userComp)
			this.userComp.showChangePassword(this);
	} 
	
	customRefresh(event){
		let data = this.comp('data');
		if(this.userComp){
			var user = this.userComp.getUser();
			data.loadData([user]);
			data.first();
		}
	} 
  
}
