// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "go-w1pgy"
})

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let {
    orderid
  } = event;
  const res = await cloud.cloudPay.unifiedOrder({
    "body" : "国庆活动",
    "outTradeNo" : orderid, // 订单
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1591772471",
    "totalFee" : 9900,
    "envId": "go-w1pgy",
    "functionName": "payfunctionName",
    "nonceStr": "5K8264ILTKCH16CQ2553SI8ZNMTM67VM",
    "tradeType": "JSAPI"
  })
  return res
}