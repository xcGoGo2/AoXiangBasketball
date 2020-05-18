//app.js
import wx from './wxsys/lib/base/wx';
import {initenv} from './wxsys/lib/base/initenv';
 wx.App = {baseUrl: 'https://dingsheng-app.newdaoapp.cn', resPath: 'https://dingsheng-app.newdaoapp.cn/mainapp'};
initenv();
new wx.ShareData({"name":"共享数据0","className":"/main/yonghub","type":"rest-data"});
App({
})