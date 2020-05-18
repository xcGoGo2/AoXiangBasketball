import wx from '../../lib/base/wx';
/*! 
* WeX5 v3 (http://www.justep.com) 
* Copyright 2015 Justep, Inc.
* Licensed under Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0) 
*/
import Component from "../../lib/base/component";
import {observable} from '../../lib/mobx/mobx-2.6.2.umd';

export default class Toptips extends Component {
    constructor(page, id, props, context) {
        super(page, id, props, context);
        this._show = observable(false);
        this._msgs = observable([]);
        this._key = 0;
    }

    show(message,type,duration) {
    	var option = {
    		message : message||'',
    		type: type || Toptips.type.info,
    		duration: duration || 3000,
    		_key: this._key++,
    		show: false
    	};
    	this._msgs.push(option);
    	this._show.set(true);
        var self = this;
        setTimeout(() => {
        	option.show = true;
        	setTimeout(() => {
            	self._msgs.remove(option);
            	if(self._msgs.length<=0)	
            		self._show.set(false);
            },option.duration);
        },10);
    }

    initOperation() {
        super.initOperation();
        this.defineOperation('show', {
            label: "显示",
            argsDef: [{name:'message',displayName:'提示消息'},{name:'type',displayName:'类型'},{name:'duration',displayName:'显示时间'}],
            method: function(args) {
                return this.owner.show(args.message,args.type,args.duration);
            }
        });
    }

    getTypeClass(type){
    	if(type===Toptips.type.success) return 'wx-toptips_success';
    	else if(type===Toptips.type.warn) return 'wx-toptips_warn';
    	else return 'wx-toptips_info';
    }
    
    buildState(context) {
        let state = super.buildState(context);
        state.show = this._show.get();
        var msgs = [];
        for(let i=this._msgs.length-1;i>=0;i--){
        	let item = this._msgs[i];
        	msgs.push({typeClass:this.getTypeClass(item.type),message:item.message,_key:item._key,show:item.show});
        }
        state.msgs = msgs;
        return state;
    }

    destroy() {
        super.destroy();
    }
}

Toptips.type = {
	success:'success',
	info:'info',
	warn:'warn'
};

wx.comp = wx.comp || {};
wx.comp.Toptips = Toptips;
