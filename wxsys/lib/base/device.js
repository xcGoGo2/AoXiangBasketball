import wx from './wx';
var Device = {
	isX5App: function(){
		return window && window.navigator && window.navigator.userAgent && ((window.navigator.userAgent.indexOf("x5app") >= 0) || (window.navigator.userAgent.indexOf("Crosswalk") >= 0));
	},
	isMiniProgram: function(){
		if ((document==undefined) && (window==undefined) && wx){
			// 小程序
			return true;
		}else if (window.navigator && window.navigator.userAgent && (window.navigator.userAgent.indexOf("wechatdevtools")!=-1)){
			// 微信开发者工具
			return true;
			
		}else if (window && window.isDebug){
			//模拟小程序
			return true;
		
		}else{
			return false;
		}
	},
	
	isSimulate: function(){
		if (window && window.isDebug){
			return true;
		}	
	},
	
	isWeChat: function(){
		return window && window.navigator && window.navigator.userAgent && window.navigator.userAgent.indexOf("MicroMessenger") >= 0;
	},
	isBroswer: function(){
		return !this.isX5App() && !this.isMiniProgram();
	}
};

export default Device;
