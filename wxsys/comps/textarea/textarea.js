import wx from '../../lib/base/wx';
import BindComponent from "../../lib/base/bindComponent";
import {observable,toJS,autorun, untracked} from '../../lib/mobx/mobx-2.6.2.umd';

export default class Textarea extends BindComponent {
     constructor(page, id, props, context){
        super(page, id, props, context);
        this.placeholder = observable("");
        var self = this
        autorun(() => {
        	if (self.props.$placeholderFn && (typeof self.page[self.props.$placeholderFn]==="function")){
        		var nameResult = self.page[self.props.$placeholderFn](self.context.vars);
        		untracked(() => {
            		if(nameResult){
            			self.placeholder.set(nameResult);
            		}
        		});
        	}
        })
     }
     buildState(context){
      	 var state = super.buildState(context);
      	 state.placeholder = this.placeholder.get(); 
      	 return state;
    }
     
    //----------------- 
    //为了解决bindblur在bindtap之后执行问题，在onInput中记录当前最新的值, 并把当前组件实例设置到页面上, 在bindtap中调用$updateValue
    onInput(evt){
    	this.page.$lastInput = this;
    	this._currentValue = evt.detail.value;
    }
    $updateValue(){
   		this.page.$lastInput = null;
       	this.doChange({value: this._currentValue});
    }
    //-------------------
     
}

Textarea.EVENT_VALUE_CHANGE = "valuechange";

wx.comp = wx.comp || {};
wx.comp.Textarea = Textarea;

