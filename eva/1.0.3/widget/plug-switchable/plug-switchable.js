/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />

YUI.add("plug-switchable", function (S) {
    var EVENT_INIT = "init", EVENT_BEFORE_SWITCH = "beforeSwitch", EVENT_SWITCH = "switch",
        CLS_PREFIX = "eva-switchable-",
        DOT = ".",
        NODE = S.Node;

    var Switchable = function (container, config) {
        var self = this;
        Switchable.superclass.constructor.apply(self, arguments);
    }

    /*
    * The NAME of the Switchable class. Used to prefix events generated
    * by the plugin class.
    */
    Switchable.NAME = "Switchable";

    /* 
    * The namespace for the plugin. This will be the property on the widget, which will 
    * reference the plugin instance, when it's plugged in
    */
    Switchable.NS = "switchable";

    Switchable.ATTRS = {
        /**
        * switch触发源具有的样式类
        * @type String
        */
        triggersCls: {
            value: CLS_PREFIX + "triggers"
        },
        /**
        * 显示面板具有的样式类
        * @type String
        */
        panelsCls: {
            value: CLS_PREFIX + "panels"
        },
        /**
        * 活动trigger的样式类
        */
        activeTriggerCls: {
            value: CLS_PREFIX + "active"
        },
        /**
        * switch动作事件触发源
        * @type NodeList
        */
        triggers: {
            value: null
        },
        /**
        * 显示面板
        * @type NodeList
        */
        panels: {
            value: null
        },
        /**
        * 是否需要（必须）trigger
        * @type Boolean
        */
        hasTrigger: {
            value: true
        },
        /**
        * 触发事件类型，有：click(单击触发),hover(鼠标移动触发)两种类型，默认为hover
        * @type String
        */
        triggerType: {
            value: "hover"
        },
        /**
        * 延迟时间（second)，仅对triggerType=hover时有效
        * @type Number
        */
        delay: {
            value: 1
        },
        /**
        * 可视视图内同时显示几个panel
        * @type Number
        */
        steps: {
            value: 1
        },
        /**
        * 可视区域大小，一般不需要设定，仅当自动获取大小有误时手动设置
        * @type {Array} [w,h]
        */
        viewSize: {
            value: []
        },
        /**
        * 当前活动的trigger的下标，如果当前不存在trigger，则该值对应的是this.length中的值。
        * @type Number
        */
        activeIndex: {
            value: 0,
            setter: function (val, name) {
                return S.Lang.isNumber(val) && val >= 0 ? val : this.get("activeIndex");
            }
        },
        /**
        * 当前拥有的可switch的屏数
        */
        length: {
            value: 0,
            setter: function (val, name) {
                return val >= 0 ? val : 0;
            }
        },
        /**
        * 初始定位
        */
        switchTo: {
            value: 0
        },
        /**
        * 容器
        */
        container: {
            value: null,
            setter: function (v) {
                if (S.Lang.isString(v)) {
                    return S.one(v);
                }
                else {
                    return v;
                }
            }
        },
        /**
        * 是否启用自动播放
        * @property autoplay
        * @type boolean
        * @default false
        */
        autoplay: {
            value: false
        },
        /**
        * 轮播效果间隔时间
        * @property interval
        * @type number
        * @default 2
        */
        interval: {
            value: 2
        },
        /**
        * 是否当鼠标经过时暂停自动播放
        * @property pauseOnHover
        * @type boolean
        * @default true
        */
        pauseOnHover: {
            value: true
        },
        /**
        * 当前是否处于“暂停”状态
        * @property paused
        * @type boolean
        * @default true
        */
        paused: {
            value: false
        }
    }

    S.extend(Switchable, S.Plugin.Base, {
        /**
        * 前期准备操作，返回true表示继续后续执行，否则，中断执行。
        * @private
        * @return boolean
        */
        _routine: function () {
            var self = this, container = self.get("container"), host = self.get("host"),
                content = null, triggers = null, panels = null, n, len, hasTrigger = self.get("hasTrigger");

            if (container == null) {
                container = host;
                self.set("container", host);
            }

            triggers = container.one(DOT + self.get("triggersCls"));
            content = container.one(DOT + self.get("panelsCls"));

            if (content !== null) {
                panels = content.get("children"); //获取其下的子节点
            }
            else {
                S.error("plug-switchable need at least one panel node.");
                return false;
            }

            if (triggers != null) {
                triggers = triggers.get("children");
            }


            n = panels.size();
            len = parseInt(n / self.get("steps"));

            if (hasTrigger && n > 0 && (triggers !== null && triggers.size() === 0 || triggers === null)) {
                triggers = self._generateTriggers(len);
            }

            self.set("length", len);

            self.set("triggers", triggers);
            self.set("panels", panels);

            self.set("content", content);

            panels.setStyle("display", "none"); //暂时隐藏所有panel，为下一步的switchTo做准备

            return self.get("length") > 0 && len === triggers.size(); //必须要有可switchable的panel
        },
        /**
        * 自动生成trigger，返回生成的trigger节点
        * @private
        * @return NodeList
        */
        _generateTriggers: function (count) {
            var self = this,
                ul = NODE.create("<ul>"), li, i, activeIndex = self.get("activeIndex");

            ul.setAttribute("class", self.get("triggersCls"));
            for (i = 0; i < count; i++) {
                li = NODE.create("<li>");
                if (i == activeIndex) {
                    li.set("class", self.get("activeTriggerCls"));
                }
                li.set("innerHTML", i);
                ul.appendChild(li);
            }
            self.get("host").appendChild(ul); //添加到host末尾

            return ul.get("children");
        },
        /**
        * 绑定事件
        * @private 
        */
        _bindEvent: function () {
            var self = this, triggers = self.get("triggers"), len = self.get("length"), trigger,
                i;

            for (i = 0; i < len; i++) {
                trigger = triggers.item(i);
                if (trigger !== null) {
                    trigger.on("click", function (e) {
                        var target = e.currentTarget;
                        self._onFocusTrigger(triggers.indexOf(target));
                    }, self);
                    if (self.get("triggerType") == "hover") {
                        trigger.on("mouseenter", function (e) {
                            var target = e.currentTarget;
                            self._onMouseEnterTrigger(triggers.indexOf(target));
                        }, self);
                        trigger.on("mouseleave", function (e) {
                            var target = e.currentTarget;
                            self._onMouseLeaveTrigger(triggers.indexOf(target));
                        }, self);
                    }
                }
            }

        },
        /**
        * click or tab键激活trigger时触发
        * @private
        * @param index Number 获取焦点的trigger在整个trigger列表的中断下标
        */
        _onFocusTrigger: function (index) {
            var self = this;
            //避免重复单击
            if (self._isValidTrigger(index)) {
                self._cancelSwitchTimer(); //比如：先悬浮在单击，此时悬浮触发的事件可以取消
                self.switchTo(index);
            }
        },
        /**
        * 鼠标移入trigger时触发
        * @private
        * @param index Number 获取焦点的trigger在整个trigger列表的中断下标
        */
        _onMouseEnterTrigger: function (index) {
            var self = this;
            if (self._isValidTrigger(index)) {
                self._switchTimer = S.later(self.get("delay") * 1000, self, function () {
                    self.switchTo(index);
                });
            }
        },
        /**
        * @method _onMouseLeaveTrigger
        * @description 鼠标移出trigger时触发
        * @private
        */
        _onMouseLeaveTrigger: function () {
            this._cancelSwitchTimer();
        },
        /**
        * @method _isValidTrigger
        * @description 验证制定的trigger是否为有效的trigger
        * @private
        * @param index Number
        */
        _isValidTrigger: function (index) {
            return index !== this.get("activeIndex");
        },
        /**
        * 取消切换计时器
        * @private
        */
        _cancelSwitchTimer: function () {
            var self = this;
            if (self._switchTimer) {
                self._switchTimer.cancel();
                self._switchTimer = undefined;
            }
        },
        /**
        * @method _switchTrigger
        * @description 切换触点
        * @private
        * @param {Node} fromTrigger  即将失去焦点的trigger节点
        * @param {Node} toTrigger  即将获取焦点的trigger
        */
        _switchTrigger: function (fromTrigger, toTrigger) {
            var self = this, activeCls = self.get("activeTriggerCls");

            fromTrigger && fromTrigger.removeClass(activeCls);
            toTrigger && toTrigger.addClass(activeCls);
        },
        /**
        * @method _switchView
        * @description 切换显示区域
        * @param {NodeList} fromPanels 从那些panel切换
        * @param {NodeList} toPanels 切换到那些panel
        */
        _switchView: function (fromPanels, toPanels, index) {
            var self = this;

            fromPanels.setStyle("display", "none");
            toPanels.setStyle("display", "block");

            self._fireOnSwitch(index);
        },
        /**
        * 触发switch事件
        */
        _fireOnSwitch: function (index) {
            this.fire(EVENT_SWITCH, { index: index });
        },
        /**
        * 触发beforeSwitch，返回true表示允许后续switch动作，否则中断switch动作
        * @return boolean true表示继续执行，否则表示中断执行。
        */
        _fireOnBeforeSwitch: function (index) {
            return this.fire(EVENT_BEFORE_SWITCH, { index: index });
        },
        /**
        * @method _switchTo
        * @description 切换操作
        * @param {Number} index
        * @return {Object}
        */
        /**
        * @method _bindAutoEvent
        * @description 绑定事件
        * @private
        */
        _bindAutoEvent: function () {
            var self = this, container = self.get("container"),
                pauseOnHover = self.get("pauseOnHover"), autoplay = self.get("autoplay");

            if (S.Lang.isValue(container)) {
                container.on("mouseleave", function (e) {
                    if (autoplay) {
                        self._startAutoPlay();
                        self.set("paused", false);
                        //                        self._setAttr("paused", false, null, true); //调用私有方法，强制改变属性状态
                    }
                });
                container.on("mouseenter", function (e) {
                    if (pauseOnHover) {
                        self._stopAutoPlay();
                        self.set("paused", true);
                        //                        self._setAttr("paused", true, null, true); //调用私有方法，强制改变属性状态
                    }
                });
            }
        },
        /**
        * @method _startAutoPlay
        * @description 开始自动滚动
        * @private
        */
        _startAutoPlay: function () {
            var self = this, interval = self.get("interval"),
                activeIndex, len = self.get("length"), circular = self.get("circular");

            if (self._timer !== undefined && self._timer !== null) {
                self._timer.cancel(); //先执行一次cancel，避免有人为的（mouseleave）调用导致效果混乱
                self._timer = undefined;
            }
            self._timer = S.later(interval * 1000, self, function () {
                if (self.get("paused")) {
                    return;
                }
                activeIndex = this.get("activeIndex");
                self.switchTo(activeIndex >= len - 1 ? 0 : activeIndex + 1);
            }, null, true);
        },
        /**
        * @method _stopAutoPlay
        * @description 停止自动滚动
        * @private
        */
        _stopAutoPlay: function () {
            var self = this;
            if (self._timer) {
                self._timer.cancel();
                self._timer = undefined; //free
            }
        },
        /**
        * @method switchTo
        * @description 交替显示内容
        * @param index 交替显示的目标下标
        * @public
        */
        switchTo: function (index) {
            var self = this, panels = self.get("panels"), triggers = self.get("triggers"), len = self.get("length"),
            steps = self.get("steps"), activeIndex = self.get("activeIndex"), hasTrigger = self.get("hasTrigger"),
            fromIndex = activeIndex * steps, toIndex = index * steps,
            fromPanels = S.all(""), toPanels = S.all(""), fromPanel, toPanel,
            i;

            if (index > len) {
                self.switchTo(len - 1); //如果传入的index超过当前最大的length，则默认switchTo到下标为length的panel
                return;
            }

            if (!self._fireOnBeforeSwitch(index)) {
                return; //外部取消switch动作
            }

            if (hasTrigger) {
                self._switchTrigger(triggers.item(activeIndex), index > -1 ? triggers.item(index) : null);
            }

            for (i = 0; i < steps; i++) {
                fromPanel = panels.item(i + activeIndex);
                if (fromIndex != null) {
                    fromPanels._nodes.push(fromPanel);
                }
                toPanel = panels.item(i + index);
                if (toPanel != null) {
                    toPanels._nodes.push(toPanel);
                }
            }

            self.set("activeIndex", index); //更新activeIndex

            self._switchView(fromPanels, toPanels, index); //要保证事件触发在switch结束后，也就是各个状态都已经更新后触发，其实这个可以看作是一个afterSwitch，和beforeSwitch对应。

            return self;
        },
        /**
        * @description 初始化
        * @method initializer
        * @param {Object} config
        * @return {Object}
        * @chainable
        */
        initializer: function (config) {
            var self = this, switchTo = self.get("switchTo"), hasTrigger = self.get("hasTrigger"),
                autoplay = self.get("autoplay"), pauseOnHover = self.get("pauseOnHover");

            if (!self._routine()) {
                S.error("initialize failed！");
                return;
            }

            //如果存在初始化定位项
            if (switchTo >= 0) {
                self.switchTo(switchTo);
            }
            if (autoplay) {
                self._startAutoPlay();
            }

            //如果允许（存在）trigger，则为其绑定相关事件
            if (hasTrigger) {
                self._bindEvent();
            }

            self._bindAutoEvent();

            //触发初始化事件
            self.fire(EVENT_INIT);
        },
        /**
        * @method destructor
        * @description销毁
        */
        destructor: function () {
            var self = this;
            if (self.get("hasTrigger")) {
                self.get("triggers").some(function (trigger) {
                    trigger.purge();
                });
            }
            self.get("panels").some(function (panel) {
                panel.purge();
            });
            self.set("triggers", null);
            self.set("panels", null);
            self._stopAutoPlay();
            self.get("container").purge(false, "mouseleave");
            self.get("container").purge(false, "mouseenter");
        }
    });

    S.namespace("Plugin");

    S.Plugin.Switchable = Switchable;

}, "1.0.2", { requires: ["node", "plugin", "event-custom", "event-mouseenter"] });