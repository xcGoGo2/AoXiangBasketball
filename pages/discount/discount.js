
// pages/discount/discount.js

// 初始化数据库
const DB = wx.cloud.database().collection("user")

import WxValidate from '../../utils/WxValidate.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideFlag1: true,//true-隐藏  false-显示
    hideFlag2: true,//true-隐藏  false-显示
    animationData: {},
    // 表单验证规则
    form: {
      name: '',
      phone: ''
    }
  },

  //表单验证
  showModal(error) {
    wx.showModal({
      content: error.msg,
      showCancel: false,
    })
  },
  //验证函数
  initValidate() {
    const rules = {
      name: {
        required: true,
        minlength: 2
      },
      phone: {
        required: true,
        tel: true
      }
    }
    const messages = {
      name: {
        required: '请填写姓名',
        minlength: '请输入正确的名称'
      },
      phone: {
        required: '请填写手机号',
        tel: '请填写正确的手机号'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },
  //调用验证函数活动1
  formSubmit: function (event) {
    console.log('form发生了submit事件，携带的数据为：', event.detail.value)
    const params = event.detail.value
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    this.setData({
      form: {
        name: params.name,
        phone: params.phone
      }
    })
    this.getpay1()
  },
  //调用验证函数活动2
  formSubmit2: function (event) {
    console.log('form发生了submit事件，携带的数据为：', event.detail.value)
    const params = event.detail.value
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      this.showModal(error)
      return false
    }
    this.setData({
      form: {
        name: params.name,
        phone: params.phone
      }
    })
    this.getpay2()
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

  // 显示遮罩层
  showModal1: function () {
    var that = this;
    that.setData({
      hideFlag1: false
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
  showModal2: function () {
    var that = this;
    that.setData({
      hideFlag2: false
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
        hideFlag1: true,
        hideFlag2: true
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
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
    }, 1000),

      // 表单验证
      this.initValidate()
  },

  // 支付失败返回界面
  goback() {
    var that = this
    var time1 = setTimeout(function () {
      that.setData({
        hideFlag1: true,
        hideFlag2: true
      })
      clearTimeout(time1);
      time1 = null;
    }, 220)
  },

  // 支付成功返回界面
  gosuccess() {
    wx.navigateTo({
      url: "../../main/index"
    })
  },

  // 提交用户信息活动1
  Submit1: function () {
    DB.add({
      data: {
        name: this.data.form.name,
        age: this.data.form.age,
        phone: this.data.form.phone,
        about: "活动一"
      },
      success(res) {
        console.log("提交用户信息成功", res)
      },
      fail(res) {
        console.log("提交用户信息失败", res)
      }
    })
  },
  // 提交用户信息活动2
  Submit2: function () {
    DB.add({
      data: {
        name: this.data.form.name,
        phone: this.data.form.phone,
        about: "活动二"
      },
      success(res) {
        console.log("提交用户信息成功", res)
      },
      fail(res) {
        console.log("提交用户信息失败", res)
      }
    })
  },

  // 支付第一个
  getpay1() {
    let num1 = Math.round(Math.random() * 100000000000000000)
    console.log("订单号为：" + num1)

    wx.cloud.callFunction({
      name: "payfor",
      data: {
        orderid: "" + num1
      },
      success: res => {
        console.log(this.goback)
        var that = this
        console.log(res)
        var result = res.result.payment;
        wx.requestPayment({
          appId: result.appId,
          timeStamp: result.timeStamp,
          nonceStr: result.nonceStr,
          package: result.package,
          signType: 'MD5',
          paySign: result.paySign,
          success(res) {
            console.log("成功")
            // 提交用户信息
            that.Submit1()
            that.gosuccess()
          },
          fail(res) {
            console.log("失败")
            that.goback()
            that.gosuccess()
            // that.Submit1()
          }
        })
      },
    })
  },
  // 支付第二个
  getpay2() {
    let num2 = Math.round(Math.random() * 100000000000000000)
    console.log("订单号为：" + num2)

    wx.cloud.callFunction({
      name: "payfor2",
      data: {
        orderid2: "" + num2
      },
      success: res => {
        console.log(this.goback)
        var that = this
        console.log(res)
        var result = res.result.payment;
        wx.requestPayment({
          appId: result.appId,
          timeStamp: result.timeStamp,
          nonceStr: result.nonceStr,
          package: result.package,
          signType: 'MD5',
          paySign: result.paySign,
          success(res) {
            console.log("成功")
            that.gosuccess()
            that.Submit2()
          },
          fail(res) {
            console.log("失败")
            that.goback()
            // that.gosuccess()
            // that.Submit2()
          }
        })
      },
    })
  },

  // 分享
  onShareAppMessage: function (res) {
    return {
      path: '/pages/index/index',
      imageUrl: "http://qncdn.cwcoolboy.xyz/images/分享海报-1.jpg",
      success: function (shareTickets) {
        console.info(shareTickets + '成功');
        // 转发成功
      },
      fail: function (res) {
        console.log(res + '失败');
        // 转发失败
      },
      complete: function (res) {
        // 不管成功失败都会执行
      }
    }
  },
})
