//index.js
var that = undefined;
var doommList = [];
var i = 0;
var ids = 0;
var cycle = null //计时器

// 弹幕参数
class Doomm {
  constructor(text, top, time, color) { //内容，顶部距离，运行时间，颜色（参数可自定义增加）
    this.text = text;
    this.top = top;
    this.time = time;
    this.color = "#ffffff";
    this.display = true;
    this.id = i++;
  }
}

Page({
  data: {
    doommData: [],
    dm_show: !0,
    // 弹出框
    hideFlag: true, //true-隐藏  false-显示
    play_music: !0,   // 控制音乐的状态，以及图标是否旋转
    animationData: {},
    // 用户数据，轮播图
    "bnrUrl": [{
        "url": "../../images/index/wx_header/11.jpg"
      }, {
        "url": "../../images/index/wx_header/12.jpg"
      }, {
        "url": "../../images/index/wx_header/13.jpg"
      }, {
        "url": "../../images/index/wx_header/14.jpg"
      },{
        "url": "../../images/index/wx_header/15.jpg"
      }, {
        "url": "../../images/index/wx_header/16.jpg"
      }, {
        "url": "../../images/index/wx_header/17.jpg"
      }, {
        "url": "../../images/index/wx_header/18.jpg"
      },{
        "url": "../../images/index/wx_header/19.jpg"
      }, {
        "url": "../../images/index/wx_header/20.jpg"
      }, {
        "url": "../../images/index/wx_header/21.jpg"
      }, {
        "url": "../../images/index/wx_header/22.jpg"
      },{
        "url": "../../images/index/wx_header/23.jpg"
      }, {
        "url": "../../images/index/wx_header/24.jpg"
      }, {
        "url": "../../images/index/wx_header/25.jpg"
      }, {
        "url": "../../images/index/wx_header/26.jpg"
      }
    ],
    isChecked: false,
    arr: ["关大哥刚刚成功参加抢购", "孙小姐刚刚成功参加抢购", "帅哥一号刚刚成功参加抢购", "天下无敌刚刚成功参加抢购", "李永飞刚刚成功参加抢购","托马斯小果果刚刚成功参加抢购", "詹姆斯刚刚成功参加抢购", "唯爱刚刚成功参加抢购", "丑八怪刚刚成功参加抢购", "邢国星刚刚成功参加抢购"]
  },
  onLoad: function () {

    // 获取计时器
    var that = this
      setInterval(function() {
          var t1 = new Date("2020/06/18 23:59:59")
          var t2 = new Date()
          var t = new Date(t1 - t2 + 16 * 3600 * 1000)
          that.setData({
              d: parseInt(t.getTime() / 1000 / 3600 / 24),
              h: t.getHours(),
              m: t.getMinutes(),
              s: t.getSeconds()
          })
      }, 1000)

    cycle = setInterval(function () {
      let arr = that.data.arr
      if (arr[ids] == undefined) {
        ids = 0
        // 1.循环一次，清除计时器
        // doommList = []
        // clearInterval(cycle)

        // 2.无限循环弹幕
        doommList.push(new Doomm(arr[ids], Math.ceil(Math.random() * 40), 5, "#ffffff"));
        if (doommList.length > 5) { //删除运行过后的dom
          doommList.splice(0, 1)
        }
        that.setData({
          doommData: doommList
        })
        ids++
      } else {
        doommList.push(new Doomm(arr[ids], Math.ceil(Math.random() * 40), 5, "#ffffff"));
        if (doommList.length > 5) {
          doommList.splice(0, 1)
        }
        that.setData({
          doommData: doommList
        })
        ids++
      }
    }, 1500)
  },
  // 放在onReady函数中，使在进入页面后，音乐就自动开始
  onReady () {
  	// 获取BackgroundAudioManager 实例
    this.back = wx.getBackgroundAudioManager() 
   
	// 对实例进行设置
    this.back.src = "../../images/index/music/baobei.mp3"
    this.back.title = 'Tassel'   // 标题为必选项
    this.back.play()               // 开始播放
  },
   onHide() {
    clearInterval(cycle)
    ids = 0;
    doommList = []
  },
  onUnload() {
    clearInterval(cycle)
    ids = 0;
    doommList = []
  },
  change: function () {
    this.setData({
      dm_show: !this.data.dm_show,
      isChecked: !this.data.isChecked,
    });
  },
  // 点击音乐图标按钮
	stop() { this.back.pause(); // 点击音乐图标后出发的操作
		this.setData({ on: !this.data.on })
		 if (this.data.on) { 
			this.back.play() 
		}else{
	 	this.back.pause()
	    }
  }
  // 联系客服
  // actioncnt: function () {
  //   wx.showActionSheet({
  //     itemList: ['15803769527', '呼叫'],
  //     success: function (res) {
  //       console.log(res.tapIndex)
  //     },
  //     fail: function (res) {
  //       console.log(res.errMsg)
  //     }
  //   })
  // },
  // // 弹出框
  // getOption: function (e) {
  //   var that = this;
  //   that.setData({
  //     value: e.currentTarget.dataset.value,
  //     hideFlag: true
  //   })
  // },
  // //取消
  // mCancel: function () {
  //   var that = this;
  //   that.hideModal();
  // },

  // // ----------------------------------------------------------------------modal
  // // 显示遮罩层
  // showModal: function () {
  //   var that = this;
  //   that.setData({
  //     hideFlag: false
  //   })
  //   // 创建动画实例
  //   var animation = wx.createAnimation({
  //     duration: 400, //动画的持续时间
  //     timingFunction: 'ease', //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
  //   })
  //   this.animation = animation; //将animation变量赋值给当前动画
  //   var time1 = setTimeout(function () {
  //     that.slideIn(); //调用动画--滑入
  //     clearTimeout(time1);
  //     time1 = null;
  //   }, 100)
  // },

  // // 隐藏遮罩层
  // hideModal: function () {
  //   var that = this;
  //   var animation = wx.createAnimation({
  //     duration: 400, //动画的持续时间 默认400ms
  //     timingFunction: 'ease', //动画的效果 默认值是linear
  //   })
  //   this.animation = animation
  //   that.slideDown(); //调用动画--滑出
  //   var time1 = setTimeout(function () {
  //     that.setData({
  //       hideFlag: true
  //     })
  //     clearTimeout(time1);
  //     time1 = null;
  //   }, 220) //先执行下滑动画，再隐藏模块

  // },
  // //动画 -- 滑入
  // slideIn: function () {
  //   this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
  //   this.setData({
  //     //动画实例的export方法导出动画数据传递给组件的animation属性
  //     animationData: this.animation.export()
  //   })
  // },
  // //动画 -- 滑出
  // slideDown: function () {
  //   this.animation.translateY(300).step()
  //   this.setData({
  //     animationData: this.animation.export(),
  //   })
  // },
})