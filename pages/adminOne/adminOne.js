// pages/adminOne/adminOne.js
let password = ""
Page({
  data: {
    error: ''
  },
  adminNum: function (event) {
    console.log(event.detail.value)
    password = event.detail.value
  },
  goUser: function () {
    if (password == 123456) {
      wx.navigateTo({
        url: '/pages/user/user'
      })
    } else {
      this.setData({
        error: '请输入正确的密匙'
      })
    }
  }

})