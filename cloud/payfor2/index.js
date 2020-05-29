// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: "go-w1pgy"
})

exports.main = async (event, context) => {

  const wxContext = cloud.getWXContext()
  let {
    orderid2
  } = event;

  const res = await cloud.cloudPay.unifiedOrder({
    "body" : "NO2-暑期特惠班",
    "outTradeNo" : orderid2, // 订单
    "spbillCreateIp" : "127.0.0.1",
    "subMchId" : "1591772471",
    "totalFee" : 2900,
    "envId": "go-w1pgy",
    "functionName": "payfunctionName",
    "nonceStr": "5K8264ILTK9H16CQ2502SI8ZNMTM89HU",
    "tradeType": "JSAPI"
  })
  return res
}