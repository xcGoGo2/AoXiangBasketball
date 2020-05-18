import wx from '../../lib/base/wx';
import Component from "../../lib/base/component";
import {observable, autorun, toJS, untracked} from  "../../lib/mobx/mobx-2.6.2.umd";
import renderComponent from "../../lib/base/renderComponent";
import {cloneJSON} from "../../lib/base/util";

export default class List extends Component{
     constructor(page, id, props, context){
        super(page, id, props, context);
        this.template = this.props.$template || null;

        this.items = this.props.items || "";

        this.item = this.props.item || "item";
        this.index = this.props.index || "index";
        this.key = this.props.key || "";
        

        //自动刷新和下一页
        this.initEvents();

       
        this.children = []; //结构 [{comps: [], key: xx}, {comps: [], key: xx}]
     }
     
     getEventVars(event){
    	 var result = {};
    	 result[this.index] = event.currentTarget.dataset.index; 
    	 if (this.itemsOB.length > result[this.index]){
    		 result[this.item] = toJS(this.itemsOB[result[this.index]]);
    		 result.$item = this.itemsOB[result[this.index]];
    	 }
    	 result.$data = this._getData();
    	 return result;
     }
     
     onRowClick(event){
    	 var data = this._getData();
    	 if (data && event.currentTarget.dataset.idcolumn){
    		 data.to(event.currentTarget.dataset.idcolumn);
    	 }
     }
     
     _getData(){
    	if (this.props.dataId){
    		var data = this.page.comp(this.props.dataId);
    		if (data) return data;
    	}
    	return null;
     }
     
     initEvents(){
  		this._parentComp = (this.props.parentId ? this.page.comp(this.props.parentId) : null) || this.page;
 		this.UPPER = (this._parentComp === this.page) ? "pullDownRefresh" : "toupper";
 		this.LOWER = (this._parentComp === this.page) ? "reachBottom" : "tolower";
 		this._toUpperHandler = this.onScrollToUpper.bind(this);
 		this._toLowerHandler = this.onScrollToLower.bind(this);
 		this._parentComp.on(this.UPPER, this._toUpperHandler);
 		this._parentComp.on(this.LOWER, this._toLowerHandler);
     }
     
     destroy(){
    	 if (this._parentComp){
        	 this._parentComp.off(this.UPPER, this._toUpperHandler);
        	 this._parentComp.off(this.LOWER, this._toLowerHandler);
        	 this._parentComp = null;
    	 }
    	 this.destroyChildren();
    	 super.destroy();
     }
     
     onScrollToUpper(evt){
    	 var evtData = {source: this, cancel: false};
    	 this.fireEvent("toupper", evtData);
    	 if (!evtData.cancel && this.props.autoRefresh){
    		 var data = this._getData();
    		 if (data) 
    			 data.refreshData().then(function(){
    				 wx.stopPullDownRefresh();
    			 }, function(){
    				 wx.stopPullDownRefresh();
    			 });
    		 else{
    			 wx.stopPullDownRefresh();
    		 }
    	 }
     }
     
     onScrollToLower(evt){
    	 var evtData = {source: this, cancel: false};
    	 this.fireEvent("tolower", evtData);
    	 let self = this;
    	 if (!evtData.cancel && this.props.autoLoadNextPage){
    		 var data = this._getData();
    		 if (data) {
    			 let loadNext = data.loadNextPageData({append: true});
    			 if(loadNext){
    				 loadNext.then(function(){
        				 //最后一次promise then hasMore还为true时机不对
        				 setTimeout(function(){
        					 if(!data.hasMore()){
            					 self._parentComp.fireEvent("scrolltobottom",{});
            				 }
        				 },0);
        				 
        			 });
    			 }
    		 }
    	 }
     }

     onScrollDown(evt){
    	 // console.log(evt)
     }

     calItems(vars){
        var result = observable([]); 
        if (this.props.$items){
            var items = this.page[this.props.$items](vars) || [];
            if (this.props.$filter && (items.length > 0)){
                var newVars = this._copyVars(vars);
            	for (var i=0; i<items.length; i++){
                    var item = items[i];
                    newVars[this.item] = item;
                    newVars[this.index] = i;   //计算filter时, 可以引用index
                    if (this.page[this.props.$filter](newVars)){
                   		result.push(item);
                    }
                }
            }else{
            	result = items;
            }
        }

        return result;
     }


    findChildByKey(oldChildren, key) {
        if (key){
            for (var i=0; i<oldChildren.length; i++){
                if (oldChildren[i].key === key){
                    return oldChildren.splice(i, 1)[0];
                }
            }
        }
        return null;
    }

    createChild(key, path, curVars){
        var result = {key: key, comps: []};
        if (this.template){
            result.comps = renderComponent(this.page, this.template, path, curVars);
        }

        return result;
    }

    updateChild(child, path, vars){
        for (var i=0; i<child.comps.length; i++){
            child.comps[i]._update({vars: vars, parentPath: path});
        }    
    }
     
    destroyChildren(){
        if (this.children){
        	this.children.forEach(function (child) {
        		if (child) {
        			child.comps.forEach(function (c) {
        				c.destroy();
        			});
        		}
            });
        }
        this.children = [];
    }
    
    _copyVars(vars){
    	var result = {};
    	for (var key in vars){
    		result[key] = vars[key];
    	}
    	return result;
    }
    
    buildState(context){
    	var state = super.buildState(context);
    	this.itemsOB = this.calItems(context.vars);
    	state.items = cloneJSON(toJS(this.itemsOB, true, null, true), true);
    	if (this.props.$listAttrBindFns){
    		for (let i=0; i<state.items.length; i++){
                var curVars = this._copyVars(context.vars);
            	curVars[this.item] = state.items[i];
            	curVars[this.index] = i;
            	curVars.$data = this._getData();
            	curVars.$item = this.itemsOB[i];
            	//必须用以下写法，否则会影响原始data中的字段
            	state.items[i] = Object.assign({}, state.items[i], {_attr: this._evalAttr(this.props.$listAttrBindFns, curVars) || {}});
        	}
    	}
    	var data = this._getData();
    	if(data && data.opened && !data.hasMore()){
    		this._parentComp.fireEvent("scrolltobottom",{});
		}
    	if(data){
    		data.on("afterRefresh",()=>{
    			this._parentComp && this._parentComp.fireEvent("scrolltobottom",{hasMore:data.hasMore()});
    		});
		}
    	return state;
    }
    
    //TODO list当前的更新算法不是最优, 会更新所有的子节点
	didBuildState(state, context){
		super.didBuildState(state, context);
		//子组件的更新依赖不进入list组件生命周期中
		var vars = context.vars;
		untracked(() => {
	        var oldChildren = this.children;
	        var remainChildren = [];
	        for (var i=0; i<state.items.length; i++){
	            var item = state.items[i];
	            var child = this.findChildByKey(oldChildren, item[this.key]);
	            if (child){
	            	remainChildren.push(child);
	            }
	        }
	        
	        //释放无用的组件
	        oldChildren.forEach(function (child) {
	            if (child){
	                child.comps.forEach(function(c){
	                    c.destroy();
	                });
	            }
	        });
	        
	       
	        var children = [];
	        var path = this.getStatePath();
	        for (var i=0; i<state.items.length; i++){
	        	var itemPath = path + ".items[" + i + "].$children";
	            var item = state.items[i];
	            var curVars = this._copyVars(vars);
	        	curVars[this.item] = this.itemsOB[i];//item, 解决list中依赖断了的问题
	        	curVars[this.index] = i;
	        	curVars.$data = this._getData();
	        	curVars.$item = this.itemsOB[i];
	            var child = this.findChildByKey(remainChildren, item[this.key]);
	            if (child){
	                this.updateChild(child, itemPath, curVars);
	            }else{
	                child = this.createChild(item[this.key], itemPath, curVars);
	            }
	            children.push(child);
	        }
	        this.children = children;
		});
     }
}



wx.comp = wx.comp || {};
wx.comp.List = List;
