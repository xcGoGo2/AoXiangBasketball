import wx from '../../lib/base/wx';
import {observable, autorun, toJS, untracked} from  "../../lib/mobx/mobx-2.6.2.umd";
import Component from "../../lib/base/component";

export default class Page extends Component {
     constructor(page, id, props, context){
        super(page, id, props, context);
        var self = this;
        var events = [Page.EVENT_LOAD, Page.EVENT_READY, Page.EVENT_SHOW, Page.EVENT_HIDE, Page.EVENT_UNLOAD, 
                      Page.EVENT_PULL_DOWN_REFRESH, Page.EVENT_REACH_BOTTOM, Page.EVENT_PAGE_SCROLL, Page.EVENT_LOADED];
        for (let i=0; i<events.length; i++){
            page.on(events[i], function(evt){
            	self.fireEvent(events[i], evt);
            });
        }
        if(props.getUserInfo == "true"){
        	this.getUserInfoData();
        }
        
        if (props.$title && this.page[props.$title]){
        	var self = this;
        	this.disposer = autorun(function () {
        		let vars = Object.assign({}, context.vars);
				let title = self.page[self.props.$title](vars);
				wx.setNavigationBarTitle({title: title});
			});
        }
     }
     
     initOperation() {
         super.initOperation();
         this.defineOperation('refresh', {
             label: "刷新页面",
             argsDef: [],
             method: function(args) {
                 return this.owner.refresh();
             }
         });
     }
     
     refresh(){
    	 let eventData = {
    		cancel:false 
    	 };
    	 this.fireEvent("refresh",eventData);
    	 if(!eventData.cancel){
    		 wx.showNavigationBarLoading();
    		 this.page.fireEvent("refresh",{});
    		 setTimeout(function(){
    			 wx.stopPullDownRefresh();
    	 		 wx.hideNavigationBarLoading();
    		 },500);
    	 }
     }
     
     getUserInfoData(evnt){
    	 wx.getUserInfo({
    		 success:(res)=>{
    			 this.page.data.UserInfo = res.userInfo;
                 console.log(this.page.data.UserInfo)
    		 }
    	 })
     }
     
     destroy(){
    	 this.disposer && this.disposer();
    	 super.destroy();
     }
     
}



Page.EVENT_LOAD = "load";
Page.EVENT_SHOW = "show";
Page.EVENT_READY = "ready";
Page.EVENT_LOADED = "loaded";
Page.EVENT_HIDE = "hide";
Page.EVENT_UNLOAD = "unload";
Page.EVENT_PULL_DOWN_REFRESH = "pullDownRefresh";
Page.EVENT_REACH_BOTTOM = "reachBottom";
Page.EVENT_SHARE_APP_MESSAGE = "shareAppMessage";
Page.EVENT_PAGE_SCROLL = "pageScroll";

wx.comp = wx.comp || {};
wx.comp.Page = Page;
