// pages/user/user.js

// 初始化数据库
const DB = wx.cloud.database().collection("user")
Page({
  data: {
    listData:[
    ]

  },
  onLoad: function() {
    var that = this
    DB.get({
      success(res) {
        console.log("查询成功", res.data[1])
        
        for(var i = 0; i<res.data.length; i++) {
          that.data.listData.push(res.data[i])
          console.log(that.data.listData)
          that.setData({
            listData : that.data.listData
          })
        }
        

      },
      fail(res) {
        console.log("查询失败",res)
      }
    })
  }
})