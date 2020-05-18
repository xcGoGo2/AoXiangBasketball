//js
Page({
  onLoad: function() {
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
  }
})
//js