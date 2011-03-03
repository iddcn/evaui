/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />

/*
* 实现Tab标签效果
* 依赖plug-switchable和plug-switchable-effect
*/

YUI.add("tab", function (S) {


    var Tab = function (ele, conf) {
        var self = this;

        if (!(self instanceof S.Tab)) {
            return new S.Tab(ele, conf);
        }

        this.element = ele;
        this.conf = null;
        this.switchable = null;
        this.initialize.call(this, conf);
    }

    Tab.prototype = {
        /**
        * 初始化
        * @param conf {hash} 自定义配置信息
        */
        initialize: function (conf) {
            var self = this;
            if (self.element instanceof S.Node) {
                self.conf = S.merge(Tab.DefaultConfig, conf);
                self.element.plug(S.Plugin.Switchable, self.conf);
                self.switchable = self.element.switchable;
            }
        },
        on: function (event, fn, context) {
            var self = this;
            context = !!context ? context : self; //默认上下文为当前实例
            self.switchable.on(event, fn, context);
        }

    }

    Tab.DefaultConfig = {
        //tab标签样式
        tabCls: "eva-switchable-triggers",
        //tab标签内容样式名
        contentCls: "eva-switchable-panels",
        //当前激活状态的tab样式名
        activeCls: "eva-switchable-active",
        //触发switch事件的类型，默认为click，即只有单击tab标签时才执行switch，可选值“hover”表示当鼠标经过tab页时执行switch
        triggerType: "click"
    }

    S.Tab = Tab;


}, "1.0.2", { requires: ["plug-slide"] });