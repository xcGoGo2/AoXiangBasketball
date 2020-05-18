import wx from '../wxsys/lib/base/wx';
import PageImpl from "../wxsys/lib/base/pageImpl";var app = getApp();export default class IndexPage extends PageImpl {constructor(...args){super(...args);}

clickNum(e) {//手机号验证
        this.setData({
            Name: e.detail.value
        })
        var value = this.data.Name;
        var regMobile = /^1\d{10}$/;//位数
        var relMobile = /^1(3|4|5|7|8)\d{9}$/;//以1开头，第二位可能是3/4/5/7/8中的的任意一个，后面9位为0-9任意一个数字
        if (value == "") {
            this.comp('wxapi').showToast({              
                "title": "手机号码不能为空"            
                });           
        }
        else if (!regMobile.test(value)) {
            this.comp('wxapi').showToast({              
                "title": "请输入11位电话号码！"            
                });            
        }else if (!relMobile.test(value)) {
            this.comp('wxapi').showToast({              
                "title": "请输入正确的电话号码！"            
                });           
        }       
    }

clickName(e){
    this.setData({
            Name: e.detail.value
        })
        var value = this.data.Name;       
        if (value == "") {
            this.comp('wxapi').showToast({              
                "title": "姓名不能为空！"            
                });           
        }  
    }

submit(){//预约表restData
    if(this.$compRefs.tableData.current.fxingming==""){
            wx.showToast({title:"请填写姓名！"});
        }else if(this.$compRefs.tableData.current.fdianhua==""){
            wx.showToast({title:"请填写电话号码！"});     
        }else{
            this.comp('restData').setValue("fyonghuid", this.$compRefs.restData1.current.fyonghuid);//用户表restData1
            this.comp('restData').setValue("fxingming", this.$compRefs.tableData.current.fxingming);//静态数据集tableData
            this.comp('restData').setValue("fdianhua", this.$compRefs.tableData.current.fdianhua);
            this.comp('restData').setValue("fbeizhu", this.$compRefs.tableData.current.fbeizhu);
            this.comp('restData').setValue("fyuyuesj",  wx.Date.now());
            this.comp('restData').setValue("fyuyuezt", 0);
            this.comp('restData').saveData();           
            wx.showToast({              
                "title":"预约成功！",
            });
            //保留当前页跳转
            wx.navigateTo({
                "url":"$UI/main/wode_yy.w"
            });
           
            // this.comp('tableData').refreshData();    
        }
        
    this.comp('tableData').refreshData();  
}
    

    

}
