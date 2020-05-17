//index.js
var that = undefined;
var doommList = [];
var i = 0;
var ids = 0;
var cycle = null //计时器
// 倒计时
var total_micro_second = 100 * 1000;

/* 毫秒级倒计时 */
function count_down(that) {
  // 渲染倒计时时钟
  that.setData({
    clock: date_format(total_micro_second)
  });

  if (total_micro_second <= 0) {
    that.setData({
      clock: "已经截止"
    });
    // timeout则跳出递归
    return;
  }
  setTimeout(function () {
    // 放在最后--
    total_micro_second -= 10;
    count_down(that);
  }, 10)
}

// 时间格式化输出，如03:25:19 86。每10ms都会调用一次
function date_format(micro_second) {
  // 秒数
  var second = Math.floor(micro_second / 1000);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = fill_zero_prefix(Math.floor((second - hr * 3600) / 60));
  // 秒位
  var sec = fill_zero_prefix((second - hr * 3600 - min * 60)); // equal to => var sec = second % 60;
  // 毫秒位，保留2位
  var micro_sec = fill_zero_prefix(Math.floor((micro_second % 1000) / 10));

  return hr + "\t:\t" + min + "\t:\t" + sec + " " + micro_sec;
}

// 位数不足补零
function fill_zero_prefix(num) {
  return num < 10 ? "0" + num : num
}


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
    // 倒计时
    clock: '',
    // 弹出框
    hideFlag: true, //true-隐藏  false-显示
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
    // 倒计时
    count_down(this);
    that = this;
    cycle = setInterval(function () {
      let arr = that.data.arr
      if (arr[ids] == undefined) {
        ids = 0
        // 1.循环一次，清除计时器
        // doommList = []
        // clearInterval(cycle)

        // 2.无限循环弹幕
        doommList.push(new Doomm(arr[ids], Math.ceil(Math.random() * 30), 5, "#ffffff"));
        if (doommList.length > 5) { //删除运行过后的dom
          doommList.splice(0, 1)
        }
        that.setData({
          doommData: doommList
        })
        ids++
      } else {
        doommList.push(new Doomm(arr[ids], Math.ceil(Math.random() * 30), 5, "#ffffff"));
        if (doommList.length > 5) {
          doommList.splice(0, 1)
        }
        that.setData({
          doommData: doommList
        })
        ids++
      }
    }, 1000)
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
  // 联系客服
  actioncnt: function () {
    wx.showActionSheet({
      itemList: ['15803769527', '呼叫'],
      success: function (res) {
        console.log(res.tapIndex)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  // 弹出框
  getOption: function (e) {
    var that = this;
    that.setData({
      value: e.currentTarget.dataset.value,
      hideFlag: true
    })
  },
  //取消
  mCancel: function () {
    var that = this;
    that.hideModal();
  },

  // ----------------------------------------------------------------------modal
  // 显示遮罩层
  showModal: function () {
    var that = this;
    that.setData({
      hideFlag: false
    })
    // 创建动画实例
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间
      timingFunction: 'ease', //动画的效果 默认值是linear->匀速，ease->动画以低速开始，然后加快，在结束前变慢
    })
    this.animation = animation; //将animation变量赋值给当前动画
    var time1 = setTimeout(function () {
      that.slideIn(); //调用动画--滑入
      clearTimeout(time1);
      time1 = null;
    }, 100)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this;
    var animation = wx.createAnimation({
      duration: 400, //动画的持续时间 默认400ms
      timingFunction: 'ease', //动画的效果 默认值是linear
    })
    this.animation = animation
    that.slideDown(); //调用动画--滑出
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220) //先执行下滑动画，再隐藏模块

  },
  //动画 -- 滑入
  slideIn: function () {
    this.animation.translateY(0).step() // 在y轴偏移，然后用step()完成一个动画
    this.setData({
      //动画实例的export方法导出动画数据传递给组件的animation属性
      animationData: this.animation.export()
    })
  },
  //动画 -- 滑出
  slideDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
})