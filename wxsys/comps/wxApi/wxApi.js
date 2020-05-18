import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import {observable, autorun, toJS, untracked} from  "../../lib/mobx/mobx-2.6.2.umd";
export default class WxApi extends Component {
    constructor(page, id, props, context) {
        super(page, id, props, context);
        this.data = {};
    }

    // 显示提示框
    showToast(args) {
        var params = {
            title: args.title || "提示",
            icon: args.icon || "success",
            duration: 1500,
            mask: ((args.mask != "false") && (args.mask !== false))
        };
        if (args.duration) {
            params.duration = parseInt(args.duration);
        }
        if (args.image) {
            params.image = args.image;
        }
        return wx.showToast(params);
    }

    // 隐藏提示框
    hideToast() {
        return wx.hideToast()
    }

    // 动态设置当前页面的标题
    setNavigationBarTitle(args) {
        return wx.setNavigationBarTitle({
            title: args.title
        })
    }

    // 显示页面导航条加载动画
    showNavigationBarLoading() {
        return wx.showNavigationBarLoading()
    }

    // 隐藏页面导航条加载动画
    hideNavigationBarLoading() {
        return wx.hideNavigationBarLoading()
    }

    // 保留当前页面，跳转到应用内的某个页面，使用wx.navigateBack可以返回到原页面。
    // url :需要跳转的应用内非 tabBar 的页面的路径 ,
    // 路径后可以带参数。参数与路径之间使用?分隔，参数键与参数值用=相连，不同参数用&分隔；如 'path?key=value&key2=value2'
    navigateTo(args) {
        return wx.navigateTo(args)
    }

    // 关闭当前页面，跳转到应用内的某个页面。
    redirectTo(args) {
        return wx.redirectTo(args)
    }

    // 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面。注：需要跳转的 tabBar 页面的路径（需在 app.json 的
    // tabBar 字段定义的页面），路径后不能带参数
    switchTab(args) {
        return wx.switchTab(args)
    }

    // 闭当前页面，返回上一页面或多级页面。可通过 getCurrentPages() 获取当前的页面栈，决定需要返回几层。
    navigateBack(args) {
        return wx.navigateBack(args)
    }

    reLaunch(args) {
        return wx.reLaunch(args)
    }

    // 媒体API (图像，音频，视频)
    //从本地相册选择图片或使用相机拍照。
    chooseImage(args) {
        var self = this;
        return wx.chooseImage({
            count: args.count,
            sizeType: args.sizeType,
            sourceType: args.sourceType
        })
    }

    getImageInfo(args) {
        return wx.getImageInfo({
            src: args.src
        })
    }

    makePhoneCall(phoneNumber) {
        return wx.makePhoneCall({
            phoneNumber: phoneNumber
        })
    }
    
    navigateToMiniProgram(args){
    	return wx.navigateToMiniProgram(args || {});
    }
    
    startPullDownRefresh(args){
    	return wx.startPullDownRefresh(args || {});
    }

    stopPullDownRefresh(args){
    	return wx.stopPullDownRefresh(args || {});
    }
    
    initOperation() {
        super.initOperation();
        this.defineOperation('startPullDownRefresh', {
            label: "开始下拉刷新",
            method: function (args) {
                return this.owner.startPullDownRefresh();
            }
        });
        this.defineOperation('stopPullDownRefresh', {
            label: "停止下拉刷新",
            method: function (args) {
                return this.owner.stopPullDownRefresh();
            }
        });
        
        
        this.defineOperation('showToast', {
            label: "显示提示框",
            argsDef: [{
                name: 'title',
                displayName: "标题"
            }, {
                name: 'icon',
                displayName: "图标"
            }, {
                name: "duration",
                displayName: "提示时间"
            }, {
                name: "mask",
                displayName: "透明蒙层"
            }],
            method: function (args) {
                return this.owner.showToast(args);
            }
        });
            this.defineOperation('hideToast', {
                label: "显示提示框",
                method: function (args) {
                    return this.owner.hideToast();
                }
            });
            this.defineOperation('setNavigationBarTitle', {
                label: "设置页面标题",
                argsDef: [{
                    name: "title",
                    displayName: "页面标题"
                }],
                method: function (args) {
                    return this.owner.setNavigationBarTitle(args)
                }
            });
            this.defineOperation('showNavigationBarLoading', {
                label: '显示导航条加载动画',
                argsDef: [],
                method: function (args) {
                    return this.owner.showNavigationBarLoading()
                }
            });
            this.defineOperation('hideNavigationBarLoading', {
                label: '隐藏导航条加载动画',
                argsDef: [],
                method: function (args) {
                    return this.owner.hideNavigationBarLoading()
                }
            });
            this.defineOperation('navigateTo', {
                label: '保留当前页跳转',
                argsDef: [{
                    name: 'url',
                    displayName: "路径"
                }, {name: 'params', displayName: '参数'}],
                method: function (args) {
                    return this.owner.navigateTo(args)
                }
            });
            this.defineOperation('redirectTo', {
                label: "关闭当前页跳转",
                argsDef: [{
                    name: 'url',
                    displayName: "路径"
                }, {name: 'params', displayName: '参数'}],
                method: function (args) {
                    return this.owner.redirectTo(args)
                }
            });
            this.defineOperation('switchTab', {
                label: "跳转到TabBar页面",
                argsDef: [{
                    name: 'url',
                    displayName: "路径"
                }, {name: 'params', displayName: '参数'}],
                method: function (args) {
                    return this.owner.switchTab(args)
                }
            });
            this.defineOperation('navigateBack', {
                label: '关闭当前返回',
                argsDef: [{
                    name: 'delta',
                    displayName: "返回的页面数"
                }],
                method: function (args) {
                    args.delta = args.delta * 1;
                    return this.owner.navigateBack(args)
                }
            });
        this.defineOperation('reLaunch', {
            label: "关闭所有打开",
            argsDef: [{
                name: 'url',
                displayName: "路径"
            }, {name: 'params', displayName: '参数'}],
            method: function (args) {
                return this.owner.reLaunch(args)
            }
        });
        this.defineOperation('makePhoneCall', {
            label: "拨打电话",
            argsDef: [{
                name: 'phoneNumber',
                displayName: "电话号码"
            }],
            method: function (args) {
                return this.owner.makePhoneCall(args.phoneNumber)
            }
        });
        this.defineOperation('navigateToMiniProgram', {
            label: "打开小程序",
            argsDef: [{
                name: 'appId',
                displayName: "小程序appId"
            },{
                name: 'path',
                displayName: "打开的页面"
            },{
                name: 'envVersion',
                displayName: "小程序版本"
            }],
            method: function (args) {
                return this.owner.navigateToMiniProgram(args)
            }
        });
    }
}
wx.comp = wx.comp || {};
wx.comp.WxApi = WxApi;
