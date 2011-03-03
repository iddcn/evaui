/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />

/*
* 根据不同的配置完成slide功能及相应的动画效果
* 依赖plug-switchable和plug-switchable-effect
*/

YUI.add("slide", function (S) {

    S.Slide = function (ele, conf) {
        var self = this;

        self.config = {};
        self.element = ele;
        self.switchable = null;
        self.switchableEffect = null;

        self.initialize.call(self, conf);
    }
    S.Slide.prototype = {
        initialize: function (conf) {
            var self = this;

            if (self.element instanceof S.Node) {
                conf = self.config = S.merge(S.Slide.DefaultConfig, conf);

                //为标签元素绑定相应的行为
                if (conf.effect === "none") {
                    self.element.plug(S.Plugin.Slide, {
                        delay: conf.delay,
                        viewSize: conf.viewSize,
                        triggerType: conf.triggerType,
                        switchTo: conf.switchTo,
                        autoplay: conf.autoplay,
                        interval: conf.interval,
                        triggerType: conf.triggerType,
                        steps: conf.steps,
                        pauseOnHover: conf.pauseOnHover,
                        hasTrigger: conf.hasTrigger,
                        interval: conf.interval,
                        triggersCls: conf.triggersCls,
                        panelsCls: conf.panelsCls,
                        activeTriggerCls: conf.activeTriggerCls
                    });
                    self.switchable = self.element.switchable;
                }
                else {
                    self.element.plug([
                                { fn: S.Plugin.Switchable, cfg: {
                                    delay: conf.delay,
                                    viewSize: conf.viewSize,
                                    triggerType: conf.triggerType,
                                    switchTo: conf.switchTo,
                                    autoplay: conf.autoplay,
                                    interval: conf.interval,
                                    triggerType: conf.triggerType,
                                    steps: conf.steps,
                                    pauseOnHover: conf.pauseOnHover,
                                    hasTrigger: conf.hasTrigger,
                                    interval: conf.interval,
                                    triggersCls: conf.triggersCls,
                                    panelsCls: conf.panelsCls,
                                    activeTriggerCls: conf.activeTriggerCls
                                }
                                },
                                { fn: S.Plugin.SwitchableEffect, cfg: { effect: conf.effect, relateType: "switchable", easing: conf.easing} }
                                ]);
                }

                self.switchable = self.element.switchable;
                self.switchableEffect = self.element.switchableEffect;
            }
        },
        destroy: function () {
            var self = this,
                node = self.element;

            if (node instanceof S.Node) {
                node.unplug();
            }
        }
    }
    S.Slide.DefaultConfig = {
        //初始化定位
        switchTo: 0,
        //自定义可视区域的长宽值
        viewSize: [],
        //触发switch的鼠标时间类型，如果该值为“hover”则表示当鼠标经过时会触发switch动作
        triggerType: "hover",
        //当启用鼠标进入执行Slide时，该值表示鼠标进入后动作执行的延迟时间，以秒为单位
        delay: 0.2,
        //每次switch的个数
        steps: 1,
        //如果启用自动播放，标识是否当鼠标经过trigger时停止自动播放
        pauseOnHover: true,
        //是否需要trigger，可以存在没有trigger的slide
        hasTrigger: true,
        //是否自动播放
        autoplay: true,
        //autoplay的时间间隔，以秒为单位。
        interval: 3,
        //动画效果，可选值：scrollX(横向滚动)、scrollY(纵向滚动)、fade(渐隐渐显)、none(无效果)
        effect: "scrollY",
        //动画特效
        easing: "easeOutStrong",
        //trigger的样式，可以自定义trigger样式名称
        triggersCls: "eva-switchable-triggers",
        //显示面板的样式名称
        panelsCls: "eva-switchable-panels",
        //当前处于活动状态的trigger的样式名称 
        activeTriggerCls: "eva-switchable-active"
    }

}, "1.0.2", { requires: ["plug-slide"] });