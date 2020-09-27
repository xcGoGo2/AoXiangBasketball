//index.js
const app = getApp()
const myaudio = wx.createInnerAudioContext();
Page({
  data: {
    isplay: true,//是否播放
    // 弹幕数据
    iconGood: app.globalData.IconGood,
    iconBoy: app.globalData.IconBoy,
    iconGirl: app.globalData.IconGirl,
    banner: app.globalData.Banner,
    baseData: app.globalData.BaseData,
    copyRight: app.globalData.CopyRight,
    dmData: [],
    symbolLeft: '{{',
    symbolRight: '}}',

    dm_show: !0,
    // 弹出框
    hideFlag: true, //true-隐藏  false-显示
    header: "",
    animationData: {},
    // 用户数据，轮播图
    "bnrUrl": [{
      "url": "http://qncdn.cwcoolboy.xyz/imgs/11.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/12.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/13.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/14.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/15.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/16.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/17.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/18.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/19.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/20.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/21.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/22.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/23.jpg"
    }, {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/24.jpg"
    },
    {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/25.jpg"
    },
    {
      "url": "http://qncdn.cwcoolboy.xyz/imgs/26.jpg"
    },
    ],
    isChecked: false,
  },
  // 处理弹幕位置
  setDM: function () {
    // 处理弹幕参数
    const dmArr = [];
    const _b = this.data.baseData;
    for (let i = 0; i < _b.length; i++) {
      const _p = {
        id: _b[i].id,
        avatar: _b[i].avatar,
        sex: _b[i].sex,
        content: _b[i].content,
        zanNumber: _b[i].zanNumber
      };
      dmArr.push(_p);
    }
    this.setData({
      dmData: dmArr
    });
  },
  goPhone: function () {

    wx.makePhoneCall({

      phoneNumber: '15003479870',

    })

  },

  // 页面跳转
  goBuy: function () {
    wx.navigateTo({
      url: '../discount/discount'
    })
  },


  // 音乐
  onShow: function () {
    myaudio.src = "cloud://go-w1pgy.676f-go-w1pgy-1302180072/songs/Pitbull、Kesha - Timber_0.ogg"
    myaudio.autoplay = true;
    myaudio.play()
    // 背景音乐
    console.log(this.data.isplay);
    this.setData({
      ispaly: this.data.isplay
    });
  },
  //播放
  play: function () {

    myaudio.play();
    console.log(myaudio.duration);
    this.setData({ isplay: true });
  },
  // 停止
  stop: function () {
    myaudio.pause();
    this.setData({ isplay: false });
  },

  onLoad: function () {
    
    // 弹幕
    this.setDM();
  },
  // 分享
  onShareAppMessage: function(res) {
    return {
      path: '/pages/index/index',
      imageUrl:  "https://s1.ax1x.com/2020/09/28/0AN6f0.jpg",
      success: function (shareTickets) {
        console.info(shareTickets + '成功');
        // 转发成功
      },
      fail: function (res) {
        console.log(res + '失败');
        // 转发失败
      },
      complete:function(res){
        // 不管成功失败都会执行
      }
    }
  },


  onReady() {

    // 获取计时器
    var that = this
    setInterval(function () {
      var t1 = new Date("2020/06/30 23:59:59")
      var t2 = new Date()
      var t = new Date(t1 - t2 + 16 * 3600 * 1000)
      that.setData({
        d: parseInt(t.getTime() / 1000 / 3600 / 24),
        h: t.getHours(),
        m: t.getMinutes(),
        s: t.getSeconds()
      })
    }, 1000)


  },
  onHide() {
  },
  onUnload() {
  },
  change: function () {
    this.setData({
      dm_show: !this.data.dm_show,
      isChecked: !this.data.isChecked,
    })
  },
  // 管理员跳转
  goAdmin: function() {
    wx.redirectTo({
      url: '/pages/adminOne/adminOne'
    })
  }
})