import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";

export default class Text extends Component{
     constructor(page, id, props, context){
        super(page, id, props, context);
     }
     
     buildState(context){
      	 var state = super.buildState(context);
      	 this.props.text && (state.text = this.props.text); 
      	 return state;
     }
     
     toUrl(){
    	 window && this.props.url && window.open(this.props.url,"_blank","location=no");
     }
     
     initOperation(){
    	 super.initOperation();
	   	 this.defineOperation('toUrl', {
	   		 label : "跳转",
	   		 icon : '',
	   		 init : function() {},
	   		 argsDef : [],
	   		 method : function(args) {
	   			 return this.owner.toUrl(args);
	   		 }
	   	 });
     }
     
}


wx.comp = wx.comp || {};
wx.comp.Text = Text;

