// // 云函数入口文件
// const cloud = require('wx-server-sdk')
// cloud.init({
//   env: "go-w1pgy"
// })



// exports.main = async (event, context) => {
//   const wxContext = cloud.getWXContext()
//   let {
//     orderid
//   } = event;

//   const res = await cloud.cloudPay.unifiedOrder({
//     "body" : "NO1-全年特惠班",
//     "outTradeNo" : orderid, // 订单
//     "spbillCreateIp" : "127.0.0.1",
//     "subMchId" : "1591772471",
//     "totalFee" : 6900,
//     "envId": "go-w1pgy",
//     "functionName": "payfunctionName",
//     "nonceStr": "5K8264ILTKCH16CQ2553SI8ZNMTM67VN",
//     "tradeType": "JSAPI"
//   })
//   return res
// }

//云开发实现支付
const cloud = require('wx-server-sdk')
cloud.init({
  env: "go-w1pgy"
})
 
//1，引入支付的三方依赖
const tenpay = require('tenpay');
//2，配置支付信息
const config = {
  appid: 'wxbb6162badd9bae40',
  mchid: '1591772471',
partnerKey:'aoxianglanqiujidi12345678',
  notify_url: 'https://www.runoob.com/',
  spbill_create_ip: '127.0.0.1' //这里填这个就可以
};
 
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let {
    orderid,
  } = event;
  //3，初始化支付
  const api = tenpay.init(config);
 
  let result = await api.getPayParams({
    out_trade_no: "111111111111111111111222222222",
    body: 'NO1-全年特惠班',
    total_fee: 2900, //订单金额(分),
    openid: wxContext.OPENID //付款用户的openid
  });
  return result;
}


