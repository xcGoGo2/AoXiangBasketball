import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
//包装标准的微信小程序组件: 当标准的微信小程序组件的事件调用了操作时, 需要使用此组件
export default class Wrapper extends Component {
     constructor(page, id, props, context){
        super(page, id, props, context);
     }

     buildState(context){
    	 return super.buildState(context);
     }
}

wx.comp = wx.comp || {};
wx.comp.Wrapper = Wrapper;

