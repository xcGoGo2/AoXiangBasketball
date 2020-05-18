import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import Util from "../../lib/base/util";
import minioUtil from "./util/minioUtil";
import {observable,toJS,autorun, untracked} from '../../lib/mobx/mobx-2.6.2.umd';

export default class Image extends Component {
     constructor(page, id, props, context){
    	 super(page, id, props, context);
    	this.fileType = [".gif",".jpeg",".jpg",".png",".svg",".webp"];
    	if(window && window.microService && window.microService.isMicroService){
			this.actionUrl = wx.App.baseUrl + "/" + this.page.basePath + (this.props.actionUrl || "/storage");
		}else{
			this.actionUrl = wx.App.baseUrl + (this.props.actionUrl || "/storage");
		}
        if(this.props.src){
        	var path = "";
        	if(this.props.src.indexOf("$model/UI2")== 0 ){
        		path = this.props.src.replace("$model/UI2","$UI");
        		this.url = observable(Util.toResUrl(path));
        	}else if (this.props.src.indexOf("$UI")== 0){
        		path = this.props.src;
        		this.url =  observable(Util.toResUrl(path));
        	}else{
        		path = this.props.src;
        		this.url =  observable(path);
        	}
        	this.staticUrl = this.url.get();
        }else{        	
        	this.url = observable("");
        }
        this.statics = (!this.props.statics || this.props.statics == "false") ? false : true;
        var self = this;
        autorun(() => {
        	 if (self.props.$urlFn && (typeof self.page[self.props.$urlFn]==="function")){
        		 var result = self.page[self.props.$urlFn](self.context.vars);
        		 untracked(() => {
	        		 if(result && result.indexOf("[{\"storeFileName\"") == 0){
	        			 	result = JSON.parse(result);
	        	    		for(var i = 0 ; i < result.length ; i ++){
	        	    			var name = result[i].realFileName;
	        	    			var storeFileName = result[i].storeFileName;
	        	    			var type = name.substring(name.lastIndexOf("."),name.length).toLocaleLowerCase();
		        	    			if(self.fileType.indexOf(type) != -1){
		        	    				if(!self.statics && storeFileName.indexOf("anoy_") == 0){
		        	    					minioUtil.getFileUrl(self.actionUrl,storeFileName).then(function(data){
		        	    						self.url.set(data+storeFileName);
		        	    					})
		        	    				}else{	        	    					
		        	    					wx.request({
		        	    						url: self.actionUrl + '/presignedGetObject',
		        	    						data: {
		        	    							objectName: storeFileName
		        	    						},
		        	    						header: {
		        	    							'content-type': 'application/json'
		        	    						},
		        	    						success: function (res) {
		        	    							self.url.set(res.data);
		        	    						}
		        	    					})
		        	    				}
		        	    				break;
	        	    			}
	        	    		}
	        		 }else{
	                     if (result && result.indexOf("$UI") === 0) {
	                         self.url.set(Util.toResUrl(result));
	                       }else{
	                         self.url.set(result||self.staticUrl||"");
	                       }
	        		 }
        		 });
        		 
        	 }
        	
        });
     }
     
     getData(param){
     	var rows = [];
    	if(param && param.indexOf("[{\"storeFileName\"") == 0){
    		param= JSON.parse(param);
    		for(var i = 0 ; i < param.length ; i ++){
    			var name = param[i].realFileName;
    			var type = name.substring(name.lastIndexOf("."),name.length);
    				const p1 = new Promise((resolve, reject) => {
    					wx.request({
    						url: wx.App.baseUrl +"/storage" + '/presignedGetObject',
    						data: {
    							objectName: param[i].storeFileName
    						},
    						header: {
    							'content-type': 'application/json'
    						},
    						success: function (res) {
    							resolve(res.data);
    						}
    					})
    					
    				})
    				rows.push(p1);
    		}
    		return rows;
    	}
     }
     previewImageClick(event){
    	 var rows = [];
    	 if(this.url.get()){
    		 rows.push(this.url.get());
             wx.previewImage({
                 urls:rows 
             })
    	 }else if(!this.url.get() && event.currentTarget.dataset.src){
    		 var path = "";
    		 if(event.currentTarget.dataset.src.indexOf("$model/UI2")== 0 ){
    			 path = event.currentTarget.dataset.src.replace("$model/UI2","$UI");
    			 rows.push(Util.toResUrl(path));
    		 }else if (event.currentTarget.dataset.src.indexOf("$UI")== 0){
    			 path = event.currentTarget.dataset.src;
    			 rows.push(Util.toResUrl(path));
    		 }else{
    			 path = event.currentTarget.dataset.src;
    			 rows.push(path);
    		 }
             wx.previewImage({
                 urls:rows 
             }) 
    	 }
     }
     setSrc(result){
     	var self = this;
     	//var result = self.page[self.props.$urlFn](self.context.vars);
 		 if(result && result.indexOf("[{\"storeFileName\"") == 0){
 			 	result = JSON.parse(result);
 	    		for(var i = 0 ; i < result.length ; i ++){
 	    			var name = result[i].realFileName;
 	    			var type = name.substring(name.lastIndexOf("."),name.length).toLocaleLowerCase();
 	    			var storeFileName = result[i].storeFileName;
 	    			if(self.fileType.indexOf(type) != -1){
 	    				if(!self.statics && storeFileName.indexOf("anoy_") == 0){
 	    					minioUtil.getFileUrl(this.actionUrl,storeFileName).then(function(data){
 	    						self.url.set(data+storeFileName);
 	    					})
 	    				}else{     	    					
 	    					wx.request({
 	    						url: this.actionUrl + '/presignedGetObject',
 	    						data: {
 	    							objectName: storeFileName
 	    						},
 	    						header: {
 	    							'content-type': 'application/json'
 	    						},
 	    						success: function (res) {
 	    							self.url.set(res.data);
 	    						}
 	    					})
 	    				}
 	    				break;
 	    			}
 	    		}
 		 	}else if (result.indexOf("$UI")=== 0){
 		 		self.url.set(Util.toResUrl(result));
 		 	}else{
 		 		self.url.set(result);
 		 	}
     }
     buildState(context){
    	 var state = super.buildState(context);
    	 state.url = this.url.get(); 
    	 return state;
     }
     initOperation(){
    	 super.initOperation();
	   	 this.defineOperation('setSrc', {
	   		 label : "设置图片",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : [ {
	   			 name : 'src',
	   			 displayName : "图片路径"
	   		 }],
	   		 method : function(args) {
	   			 this.owner.setSrc(args.src);
	   		 }
	   	 })
     }

}


wx.comp = wx.comp || {};
wx.comp.Image = Image;

