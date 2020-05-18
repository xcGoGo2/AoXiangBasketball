import wx from '../../lib/base/wx';
import BindComponent from "../../lib/base/bindComponent";
import {observable,toJS,autorun, untracked} from '../../lib/mobx/mobx-2.6.2.umd';
import Util from "../../lib/base/util";

export default class Button extends BindComponent {
     constructor(page, id, props, context){
        super(page, id, props, context);
        this.appParameter = observable("");
        this.sendMessageTitle = observable("");
        this.sendMessagePath = observable("");
        this.sendMessageImg = observable("");
        this.showMessageCard = observable(false);
        this.sessionFrom = observable("");
        this.debounceObserve = observable(false);
        
        var self = this;
        autorun(() => {
        	if (self.props.$appParameterFn && (typeof self.page[self.props.$appParameterFn]==="function")){
        		let appParameterResult = self.page[self.props.$appParameterFn](self.context.vars);
        		 untracked(() => {        			 
        			 if(appParameterResult){
        				 self.appParameter.set(appParameterResult);
        			 }else self.appParameter.set("");
        		 })
        	}	
        	if (self.props.$sendMessageTitleFn && (typeof self.page[self.props.$sendMessageTitleFn]==="function")){
        		let sendMessageTitleResult = self.page[self.props.$sendMessageTitleFn](self.context.vars);
        		 untracked(() => {        			 
        			 if(sendMessageTitleResult){
        				 self.sendMessageTitle.set(sendMessageTitleResult);
        			 }else self.sendMessageTitle.set("");
        		 })
        	}	
        	if (self.props.$sendMessagePathFn && (typeof self.page[self.props.$sendMessagePathFn]==="function")){
        		let sendMessagePathResult = self.page[self.props.$sendMessagePathFn](self.context.vars);
        		 untracked(() => {        			 
        			 if(sendMessagePathResult){
        				 self.sendMessagePath.set(Util.toResUrl(sendMessagePathResult));
        			 }else self.sendMessagePath.set("");
        		 })
        	}	
        	if (self.props.$sendMessageImgFn && (typeof self.page[self.props.$sendMessageImgFn]==="function")){
        		let sendMessageImgResult = self.page[self.props.$sendMessageImgFn](self.context.vars);
        		 untracked(() => {        			 
        			 if(sendMessageImgResult){
        				 self.sendMessageImg.set(Util.toResUrl(sendMessageImgResult));
        			 }else self.sendMessageImg.set("");
        		 })
        	}	
        	if (self.props.$showMessageCardFn && (typeof self.page[self.props.$showMessageCardFn]==="function")){
        		var showMessageCardResult = self.page[self.props.$showMessageCardFn](self.context.vars);
        		 untracked(() => {        			 
        			 if(showMessageCardResult){
        				 self.showMessageCard.set(showMessageCardResult);
        			 }else self.showMessageCard.set("");
        		 })
        	}	
        	if (self.props.$sessionFromFn && (typeof self.page[self.props.$sessionFromFn]==="function")){
        		var sessionFromResult = self.page[self.props.$sessionFromFn](self.context.vars);
        		 untracked(() => {        			 
        			 if(sessionFromResult){
        				 self.sessionFrom.set(sessionFromResult);
        			 }else self.sessionFrom.set("");
        		 })
        	}	
        });
     }
     
     startDebounce(){
    	 this.debounceObserve.set(true); 
     }
     
     stopDebounce(){
    	 this.debounceObserve.set(false);
     }
     
     buildState(context){
    	 var state = super.buildState(context);
    	 state.appParameter = this.appParameter.get(); 
    	 state.sendMessageTitle = this.sendMessageTitle.get();
    	 state.sendMessagePath = this.sendMessagePath.get();
    	 state.sendMessageImg = this.sendMessageImg.get();
    	 state.showMessageCard = this.showMessageCard.get();
    	 state.sessionFrom = this.sessionFrom.get();
    	 state.debounce = this.debounceObserve.get();
    	 return state;
     }
     
     getuserinfo(res){
    	 this.fireEvent(Button.EVENT_GetUserInfo, {source: this, originalEvent: res, detail: res.detail});
     }
     getPhoneNumber(res){
    	 this.fireEvent(Button.EVENT_GetPhoneNumber, {source: this, originalEvent: res});
     }
     error(res){
    	 this.fireEvent(Button.EVENT_LaunchAppError, {source: this, originalEvent: res});
     }
}
Button.EVENT_GetUserInfo = "getUserInfo";
Button.EVENT_GetPhoneNumber = "getPhoneNumber";
Button.EVENT_LaunchAppError = "launchAppError";
wx.comp = wx.comp || {};
wx.comp.Button = Button;

