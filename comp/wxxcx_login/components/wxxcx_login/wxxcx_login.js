import wx from '../../../../wxsys/lib/base/wx';
/*! 
 * WeX5 v3 (http://www.justep.com) 
 * Copyright 2015 Justep, Inc.
 * Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
 */ 
import Component from "../../../../wxsys/lib/base/component";
import _String   from "../../../../wxsys/lib/base/string";
import Util      from "../../../../wxsys/lib/base/util";
import Base64    from "../../../../wxsys/lib/base/base64";
import helper    from "../../../../wxsys/comps/user/js/userHelper";
import uaa       from "../../../../wxsys/comps/user/js/uaa";
import User      from "../../../../wxsys/comps/user/user";
import Device    from "../../../../wxsys/lib/base/device";
import {intercept} from  "../../../../wxsys/lib/mobx/mobx-2.6.2.umd";

const apiGatewayUrl = wx.App.baseUrl || "";
const COOKIE_NAME = 'X-Uaa-JWT'; 
function request(option) {
    return new Promise(function(resolve, reject) {
        option = option || {};
        option.success = function(res){
            console.log(res);
            resolve(res);
        };
        option.fail = function(error){
            console.log(error);
            reject(error);
        };
        wx.request(option);
    });
}

var JQUERY = null;
function ajax(options) {
    return new Promise(function(resolve, reject) {
        if (JQUERY == null)
            JQUERY = require("jquery");
        JQUERY.ajax(options).done(function(resp) {
            console.log(resp);
            resolve(resp);
        }).fail(function(resp) {
            console.log(resp);
            reject(resp); 
        });
    });
}

function showWXAuthURL() {
    var url="/config/config/configs/search/like?key=com.qq.weixin.mp.appID";
    var params = {type: "mp", redirect_url: window.location.href};
    if (!Device.isWeChat()) {
        url="/config/config/configs/search/like?key=com.qq.weixin.open.appID";
        params.type = "open";
    }
    ajax({type:"GET", url}).then(function(data) {
        var appId = "wxb3efde94a26e25fe";
        if (data && data.length > 0)
            appId = data[0].fvalue.trim();
        var callback = [window.location.protocol, "//", window.location.host, window.location.port,
            "/wxxcx_login/thirdpartylogin/wxCallback?params=",
            Base64.encode(JSON.stringify(params))].join("");
        var authUrl = [];
        if (Device.isWeChat())
            authUrl.push("https://open.weixin.qq.com/connect/oauth2/authorize?appid=");
        else
            authUrl.push("https://open.weixin.qq.com/connect/qrconnect?appid=");
        authUrl.push(appId);
        if (Device.isWeChat())
            authUrl.push("&response_type=code&scope=snsapi_userinfo&state=justep_weixin_login&redirect_uri=")
        else
            authUrl.push("&response_type=code&scope=snsapi_login&state=justep_weixin_login&redirect_uri=");
        authUrl.push(encodeURI(callback));

        window.location.href = authUrl.join("");
    });
}

let WxUserInfo = {};    
//加载wx相关信息
let WxUserInfoDfd = null;   

function getWxUserInfo(){
    if(!WxUserInfoDfd){
        WxUserInfoDfd = new Promise(function(presolve, preject) {
            let resolve = presolve, reject = preject;
            //获取wx的用户信息
            wx.getUserInfo({
                lang: 'zh_CN',
                withCredentials: true,
                success: function(res) {
                    let userInfo = res.userInfo;
                    WxUserInfo.avatarUrl = userInfo.avatarUrl;
                    WxUserInfo.nickName = userInfo.nickName;
                    WxUserInfo.gender = userInfo.gender;
                    WxUserInfo.province = userInfo.province;
                    WxUserInfo.city = userInfo.city;
                    WxUserInfo.country = userInfo.country;
                    WxUserInfo.encryptedData = res.encryptedData;
                    WxUserInfo.iv = res.iv;
                    resolve(WxUserInfo);
                },
                fail: function(){
                    reject();
                }
            });
        });
    }
    return WxUserInfoDfd;
}

function _wxLogin(url) {
    return new Promise(function(resolve, reject) {
        request({
            method : "GET",
            url : apiGatewayUrl + url
        }).then(function(res) {
            resolve(res);
        },function(error) {
            reject(error);
        });
    });
}   

function login2Uaa(code) {
    return _wxLogin("/wxxcx_login/thirdpartylogin/login2Uaa?code=" + code);
}

function _getOpenId(code) {
    return _wxLogin("/wxxcx_login/thirdpartylogin/getOpenId?code=" + code);
}   

export default class Wxxcx_login extends Component {
    constructor(page, id, props, context){
        super(page, id, props, context);       
        (Device.isX5App()||Device.isMiniProgram()||Device.isWeChat()) && helper.addLoginComp(this);
    }

    destroy() {
        (Device.isX5App()||Device.isMiniProgram()||Device.isWeChat()) && helper.removeLoginComp(this);
        super.destroy();
    }

    getName() { return "wxxcx_login"; }
    getDisplayName() { return "微信小程序登录"; }
    getOpenId() {
        return this.wxLogin(_getOpenId);
    }

    login(option) {
        if (Device.isWeChat()) 
            return this.wxBrowserLogin();
        return this.wxLogin(login2Uaa, option);
    }

    _getUnionId(encryptedData, iv, resolve, reject) {
        var self = this;
        if (self.loginRet) {
            encryptedData = Base64.encode(encryptedData);
            _wxLogin("/wxxcx_login/thirdpartylogin/getUserInfo?encryptedData=" + encryptedData + "&iv=" + iv).then(function(ret) {
                resolve(ret);
            }, function(err) { reject(err); });
        } else {
            setTimeout(function() {
                self._getUnionId(encryptedData, iv, resolve, reject);
            }, 500);
        }
    }
    getUnionId() {
        var self = this;
        return new Promise(function(resolve, reject) {
            getWxUserInfo().then(function(ret) {
                if (ret.encryptedData && ret.iv) {
                    self._getUnionId(ret.encryptedData, ret.iv, resolve, reject);
                }
                else {
                    WxUserInfoDfd = null;   
                    getWxUserInfo().then(function(ret) {
                        if (ret.encryptedData && ret.iv) {
                            self._getUnionId(ret.encryptedData, ret.iv, resolve, reject);
                        }
                    }, function(err) { reject(err); });
                }
            }, function(err) { reject(err);});
        });
    }

    logout(option) {
        if (Device.isWeChat()) {
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            var cookieString = COOKIE_NAME + "=v; expires=" + date.toGMTString();
            document.cookie = cookieString + "; path=/";
        }
        return uaa.logout();
    }

    wxBrowserLogin() {
        var self = this;
        return new Promise(function(resolve, reject) {
            const promise = self.getUserInfo();
            if (promise) {
                promise.then(function(userInfo) { resolve(userInfo); });
            } else {
                showWXAuthURL();
            }
        });
    }

    wxLogin(func,option) {
        var self = this;
        return new Promise(function(resolve, reject) {
            wx.login({
                success: function(res) {
                    if (res.code) {
                        let wxCode = res.code;
                        func(wxCode).then(function(res){
                            self.loginRet = res.data;
                            if ((res.data.regStatusCode == 201 || res.data.regStatusCode == 200) && option) {
                                resolve(res.data);
                            } else if((res.data.error || res.data.regStatusCode==500)&& option){
                                reject(res.data);
                            } else { resolve(res.data); }
                        }, function(res) { reject(res); });
                    } else { reject(res); }
                },
                fail: function(res){ reject(res); }
            });
        });
    }

    getUserInfo(options){
        if (Device.isWeChat()) {
            var arr, reg = new RegExp("(^| )" + COOKIE_NAME + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg)) {
                var val = unescape(arr[2]);
                return new Promise(function(resolve, reject) {
                    resolve(JSON.parse(Base64.decode(decodeURI(val))));
                });
            } 
            return null;
        }
        return getWxUserInfo();
    }
}

wx.comp = wx.comp || {};
wx.comp.Wxxcx_login = Wxxcx_login;
