import wx from '../../lib/base/wx';
/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/
import Component from "../../lib/base/component";
import {observable,toJS} from '../../lib/mobx/mobx-2.6.2.umd';


export default class Loading extends Component {
    constructor(page, id, props, context) {
        super(page, id, props, context);
        this.loadingNum = observable(this.props.loadingNum || -1);
        let self = this;
        this._addRequestListener();
        this.isFirst = true;
        this.page.on("beforeShow",function(){
        	if(!self.isFirst){
                self._addRequestListener();
        	}
        	if(self.loadingNum.get() <= 0){
        		self.hide(true);
        	}
        	setTimeout(function(){
        		self.hide(true);
        	},3000);
        });
        this.page.on("hide",function(){
        	self.isFirst = false;
        	//self.hide(true);
        });
    }
    
    _addRequestListener(){
    	var self = this;
        wx.request.on("requestSuccess",function(){
        	setTimeout(function(){
        		self.hide();
        	},0);
    	});
        wx.request.on("requestError",function(){
        	setTimeout(function(){
        		self.hide();
        	},0);
    	});
        wx.request.on("requestSend",function(){
        	self.show();
    	});
    }
    
    _clearRequestListener(){
		wx.request.off("requestSend");
		wx.request.off("requestSuccess");
        wx.request.off("requestError");
    }
    
    buildState(context) {
        let state = super.buildState(context);
        state.loadingNum = toJS(this.loadingNum);
        return state;
    }
    
    show() {
    	let loadingNum = this.loadingNum.get();
    	if(loadingNum == -1){
    		this.loadingNum.set(1);
    	}else{
    		this.loadingNum.set(++loadingNum);
    	}
    }
    
    hide(force = false){
    	if(force){
    		this.loadingNum.set(0);
    	}else{
    		let loadingNum = this.loadingNum.get();
    		if(loadingNum == -1){
    			this.loadingNum.set(0);
    		}else if(loadingNum != 0){
    			this.loadingNum.set(--loadingNum);
    		}
    	}
    	if(this.loadingNum.get() == 0){
    		this._clearRequestListener();
    	}
    }
    
    destroy() {
        super.destroy();
    }
    
    initOperation() {
        super.initOperation();
        this.defineOperation('show', {
            label: "显示",
            argsDef: [],
            method: function(args) {
                return this.owner.show();
            }
        });
        this.defineOperation('hide', {
            label: "隐藏",
            argsDef: [],
            method: function(args) {
                return this.owner.hide();
            }
        });
    }
    
}
wx.comp = wx.comp || {};
wx.comp.Loading = Loading;
