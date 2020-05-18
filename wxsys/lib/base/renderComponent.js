import wx from './wx';
import Util from "./util";
/**
 * @param wxPage
 * @param template 组件配置信息, 结构如下:
 * 		[
 * 			{
 * 				cls: wx.comp.xx, //组件类标识
 * 				props: {}, //组件属性
 * 			}, ... 
 * 		]
 * @returns
 * 说明:
 *      1. 将所有的非list内组件打平;
 *      2. list组件的循环体由list组件自身创建;
 */
//
export default function renderComponent(page, template, path, vars){
    path = path || "";
    template = template || [];
    var comps = [];
    vars = vars || {};
    for (var i=0; i<template.length; i++){
        var compConfig = template[i];
        if (Util.isArray(compConfig)){
        	renderComponent(page, compConfig, path, vars);
        }else{
            var props = template[i].props || {};
            var context = {parentPath: path, vars : vars}
            if (!template[i].cls){
            	throw new Error(props.id + "元素对应的组件类不存在");
            }
            var comp = new template[i].cls(page, props.id, props, context);
            if (!comp.hasDependence()){
            	comp.inited();
            }else{
            	page.compPromise(props.id); //强制创建promise对象
            }
            comp._update(context);
            comps.push(comp);   
        }
    }

    return comps;
}



