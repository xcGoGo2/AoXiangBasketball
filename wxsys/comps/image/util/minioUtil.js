import wx from '../../../lib/base/wx';
var minioUtil = {
	getFileUrl : function(actionUrl,storeFileName){
		if(!this.promise){
			var dfd = {};
			this.promise = new Promise(function(resolve, reject) {
				dfd.resolve = resolve;
				dfd.reject = reject;
			});
			wx.request({
				url: actionUrl + '/presignedGetObject',
				data: {
					objectName: storeFileName
				},
				header: {
					'content-type': 'application/json'
				},
				success: function (res) {
					var resUrl = res.data.split("anoy_")[0];
					if(resUrl.indexOf("s:") == -1){
						resUrl = resUrl.replace("http","https");
					}
					dfd.resolve(resUrl);
				}
			});			
		}
		return this.promise;
	}
};

export default minioUtil;
