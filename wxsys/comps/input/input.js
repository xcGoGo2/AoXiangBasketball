import wx from '../../lib/base/wx';
import BindComponent from "../../lib/base/bindComponent";

export default class Input extends BindComponent {
     constructor(page, id, props, context){
        super(page, id, props, context);
     }
     
     // 模态对话框
     showDateTimeDialog(evt){
    	 if ((evt.currentTarget.dataset.disabled==true) || (evt.currentTarget.dataset.disabled=="true")) return;
    	 var dialog = this.page.comp("__pickerViewOnce__");
    	 var self = this;
    	 var oldtime = this.getValue();
    	 dialog.showDialog(oldtime,(time)=>{
    		 var time = new Date(time);
    		 self.doChange({value: time});
    	 })
     }
     
     buildState(context){
    	 let state = super.buildState(context);
    	 let displayText = this.getValue();
    	 if(this.props.format && displayText instanceof Date){
    		 displayText = wx.Date.toString(displayText,this.props.format);
    	 }else{
    		 if (displayText && displayText instanceof Date){
    			 displayText = displayText.toString();
    		 }
    	 }
    	 state.displayText = displayText;
    	 return state;
     }
     
     //重写父类的getValue方法
     getValue(){
    	 if (this.props.$refFn){
    		 return super.getValue();
    	 }else{
    		 return this._currentValue;
    	 }
     }
     
     beforeSetValue(path, prop, value, callback){
    	 return this._currentValue = value;
     }

     scan(option){
    	 option = option || {};
    	 wx.scanCode(option).then((res)=>{
    		 this.doChange({value: res.result});
    	 },(e)=>{console.error(e);});
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
     
     initOperation(){
    	 super.initOperation();
	   	 this.defineOperation('scanInput', {
	   		 label : "扫码输入",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : [ {
	   			 name : 'onlyFromCamera',
	   			 displayName : "只允许从相机扫码"
	   		 }],
	   		 method : function(args) {
	   			 return this.owner.scan(args);
	   		 }
	   	 });
     }
     
}


Input.EVENT_VALUE_CHANGE = "valuechange";

wx.comp = wx.comp || {};
wx.comp.Input = Input;

