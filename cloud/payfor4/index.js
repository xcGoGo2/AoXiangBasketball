// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "go-w1pgy"
})

exports.main = async (event, context) => {
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : "NO1-全年特惠班",
    "outTradeNo" : "0101010101010202020202010101013", // 订单
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1591772471",
    "totalFee" : 6900,
    "envId": "go-w1pgy",
    "functionName": "payfunctionName",
    "nonceStr": "5K8264ILTKCH16CQ2553SI8ZNMTM67VP",
    "tradeType": "JSAPI"
  })
  return res
}