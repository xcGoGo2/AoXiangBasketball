import wx from '../wxsys/lib/base/wx';
import PageImpl from "../wxsys/lib/base/pageImpl";
var app = getApp();
export default class IndexPage extends PageImpl {
	constructor(...args){
		super(...args);
	}

    // //登录事件
    // loginEvent(e){
    //     this.comp('restData2').setFilter("fyonghuid",[{ "op": "eq", "name": "fyonghuid", "value": this.$compRefs.restData3.current.openId }]);
    //     this.comp('restData2').refreshData();
    // }

    //刷新后事件
    yonghuEvent(e){       
        if(this.comp("restData2").count()==0){
            this.comp('restData2').newData({
                    "defaultValues": [{
                        "fyonghuid": this.$compRefs.restData3.current.id,
                        "fnicheng": this.$compRefs.restData3.current.nickName,
                        "ftouxiang": this.$compRefs.restData3.current.avatarUrl,
                        "fdianhua": this.$compRefs.restData3.current.phone,
                        "fyouxiang": this.$compRefs.restData3.current.email,
                        "fxingming": this.$compRefs.restData3.current.name
                    }]
                });
                this.comp('restData2').saveData(undefined);
            }
        }













}
