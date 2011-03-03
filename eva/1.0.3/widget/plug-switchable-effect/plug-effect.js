/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />

/*
 * 为依赖S.Plugin.Switchable以及继承自S.Plugin.Switchable的组件绑定相应的效果，比如动画效果。
 */

YUI.add("plug-switchable-effect", function (S) {

    var NONE = "none", SCROLL_X = "scrollX", SCROLL_Y = "scrollY",
        DISPLAY = "display", BLOCK = "block", OPACITY = "opacity", Z_INDEX = "zIndex", LEFT = "left", TOP = "top",
        POSITION = "position", ABSOLUTE = "absolute", RELATIVE = "relative", FLOAT = "float", WIDTH = "width", FADE = "fade", STATIC = "static", OVERFLOW = "overflow", HIDDEN = "hidden", VISIBLE = "visible", HEIGHT = "height",
        FORWARD = "forward", BACKWARD = "backward", EMPTY = "",
        LANG = S.Lang;

    var Effect = function () {
        Effect.superclass.constructor.apply(this, arguments);
    }
    Effect.NAME = "Effect";
    Effect.NS = "effect";
    Effect.ATTRS = {
        /**
        * 指定的效果
        * @property effect
        * @type string
        * @default none
        */
        effect: {
            value: NONE
        },
        /**
        * 如果启动动画效果，则该值指定动画的执行时间。
        * @property duration
        * @type float
        * @default 0.5
        */
        duration: {
            value: .5
        },
        /**
        * 动画特效
        * @property easing
        * @type string
        * @default easeNone
        */
        easing: {
            value: "easeNone"
        },
        /**
        * 指定当前插件绑定的switchable的类型，可选值有switchable，以及继承自switchable的任何插件的NS值
        * @property relateType
        * @type string
        * @default switchable
        */
        relateType: {
            value: "switchable"
        }
    };
    S.extend(Effect, S.Plugin.Base, {
        /**
        * @method _ajustPosition
        * @description 启用无缝滚动时，用于调于调整节点样式属性
        * @param panels {NodeList} 需要调整位置属性的panels
        * @param direction {String} switch的方向，暂时只支持“forward”
        * @param prop {Object} 样式object
        * @param viewSize {Array} index-0:视窗宽度值；index-1:视窗高度值
        * @private
        */
        _ajustPosition: function (panels, direction, prop, viewSize) {
            var self = this,
                switchable = self.get("host")[self.get("relateType")],
                steps = switchable.get("steps"),
                len = switchable.get("length"),
                size = len * steps,
                isBackward = direction == BACKWARD,
                from = isBackward ? size : 0,
                to = isBackward ? size - steps : from + steps,
                panel,
                tmp,
                i;
            if (from > to) {
                tmp = from;
                from = to;
                to = tmp;
            }
            for (i = from; i < to; i++) {
                panel = panels.item(i);
                panel.setStyle(POSITION, RELATIVE);
                panel.setStyle(prop, (isBackward ? -1 : 1) * viewSize * len);
            }
            return isBackward ? viewSize : -viewSize * len;
        },
        /**
        * @method _resetPosition
        * @description 重置由_ajustPosition修改过的样式
        * @param panels {NodeList} 需要调整位置属性的panels
        * @param direction {String} switch的方向，暂时只支持“forward”
        * @param prop {Object} 样式object
        * @param viewSize {Array} index-0:视窗宽度值；index-1:视窗高度值
        * @private
        */
        _resetPosition: function (panels, direction, prop, viewSize) {
            var self = this,
                switchable = self.get("host")[self.get("relateType")],
                steps = switchable.get("steps"),
                len = switchable.get("length"),
                size = len * steps,
                isBackward = direction == BACKWARD,
                from = isBackward ? size : 0,
                to = isBackward ? size - steps : from + steps,
                panel,
                i;

            if (from > to) {
                tmp = from;
                from = to;
                to = tmp;
            }
            for (i = from; i < to; i++) {
                panel = panels.item(i);
                panel.setStyle(POSITION, EMPTY);
                panel.setStyle(prop, EMPTY);
            }
            switchable.get("content").setStyle(prop, (isBackward ? -viewSize * (len - 1) : 0));
        },
        /**
        * @method _routine
        * @description 前期准备工作
        * @private
        */
        _routine: function () {
            var self = this, switchable = self.get("host")[self.get("relateType")], panels = switchable.get("panels"), content = switchable.get("content"), steps = switchable.get("steps"), activeIndex = switchable.get("activeIndex"),
                len = panels.size(),
                panelRegion = panels.item(0).get("region"), viewSize = switchable.get("viewSize"),
                container = switchable.get("container"),
                effect = self.get("effect");

            self._viewSize = [viewSize[0] || panelRegion.width * steps, viewSize[1] || panelRegion.height * steps];

            // 注：所有 panel 的尺寸应该相同
            // 最好指定第一个 panel 的 width 和 height, 因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            //初始化相关样式
            panels.setStyle(DISPLAY, BLOCK);
            content.setStyle(OVERFLOW, VISIBLE);
            //            container.setStyle(OVERFLOW, HIDDEN);
            switch (effect) {
                case SCROLL_X:
                case SCROLL_Y:
                    content.setStyle(POSITION, ABSOLUTE);
                    content.get("parentNode").setStyle(POSITION, RELATIVE);
                    if (effect == SCROLL_X) {
                        panels.setStyle(FLOAT, LEFT);
                        content.setStyle(WIDTH, self._viewSize[0] * (len / steps));
                        content.setStyle(LEFT, 0);
                    }
                    else {
                        content.setStyle(HEIGHT, self._viewSize[1] * (len / steps));
                    }
                    break;
                case FADE:
                    var min = activeIndex * steps, max = min + steps - 1, isActivePanel;

                    content.setStyle(POSITION, RELATIVE);
                    content.setStyle(Z_INDEX, 0); //因为content内部的panel需要修改zIndex，所以，需要给出panel的zIndex的相对值。

                    panels.some(function (panel, index) {
                        isActivePanel = (index >= min && index <= max);
                        panel.setStyles({
                            opacity: isActivePanel ? 1 : 0,
                            position: ABSOLUTE,
                            zIndex: isActivePanel ? 9 : 1
                        });
                    }, self);
                    break;
            }
        },
        /**
        * @method _bindEvent
        * @description 绑定事件
        * @private
        */
        _bindEvent: function () {
            var self = this, effect = self.get("effect"), switchable = self.get("host")[self.get("relateType")],
                panels = switchable.get("panels"), fromPanels, toPanels, triggers = switchable.get("triggers"), activeIndex, toIndex,
                content = switchable.get("content"), len = switchable.get("length"),
                hasTrigger = switchable.get("hasTrigger");

            switchable.on("beforeSwitch", function (e) {
                activeIndex = switchable.get("activeIndex");
                toIndex = e.index >= len ? 0 : e.index;
                if (effect === SCROLL_X || effect === SCROLL_Y) {
                    self.scroll(content, e.index, activeIndex);
                }
                else if (effect === FADE) {
                    fromPanels = [panels.item(activeIndex)];
                    toPanels = [panels.item(e.index)];
                    self.fade(fromPanels, toPanels);
                }
                else {
                    return true; //继续执行switch动作
                }
                /*
                因为即将要返回false，中断后续操作，所以，这里需要更新相应的trigger状态以及触发相应的事件
                因为要完成完整的switchable的cyclelife，并且通过effect插件介入switchable的生命周期也不为过，因为这里的effect只是针对switchable的扩展。
                */
                if (hasTrigger) {
                    switchable._switchTrigger(triggers.item(activeIndex), triggers.item(toIndex)); //执行trigger的替换
                }
                switchable.set("activeIndex", toIndex); //设定activeIndex
                switchable._fireOnSwitch(toIndex);

                return false;   //表示中断后续操作
            }, self);
        },
        /**
        * @method none
        * @description 原始效果
        * @param fromEls {Array}
        * @param toEls {Array}
        * @public
        */
        none: function (fromEls, toEls) {
            if (S.Lang.isArray(fromEls) && S.Lang.isArray(toEls)) {
                fromEls.each(function (ele) {
                    ele.setStyle(DISPLAY, NONE);
                });
                toEls.each(function (ele) {
                    ele.setStyle(DISPLAY, BLOCK);
                });
            }
            else {
                S.error("parameter type must be an Array");
            }
        },
        /**
        * @method fade
        * @description 渐隐渐显效果
        * @param fromEls {Array}
        * @param toEls {Array}
        * @public
        */
        fade: function (fromEls, toEls) {
            if (S.Lang.isArray(fromEls) && fromEls.length > 1 || !S.Lang.isArray(fromEls)) {
                S.error("fade effect only support steps==1 and parameter type must be Array");
            }
            var self = this, fromEl = fromEls[0], toEl = toEls[0],
                duration = self.get("duration"), easing = self.get("easing");

            toEl.setStyle(OPACITY, 1);

            if (self._anim) {
                self._anim.stop();

                // reset animate relate attribute
                self._anim.eventHandler.detach(); //移除所有已绑定的事件，重新绑定。
                self._anim.set("node", fromEl);
                self._anim.set("duration", duration);
                self._anim.set("easing", easing);
                self._anim.run();
            }
            else {
                self._anim = new S.Anim({
                    node: fromEl,
                    to: {
                        opacity: 0
                    },
                    duration: duration,
                    easing: easing
                }).run();
            }
            self._anim.eventHandler = self._anim.on("end", function () {

                toEl.setStyle(Z_INDEX, 9);
                fromEl.setStyle(Z_INDEX, 1);
            }, self);
        },
        /**
        * @method scroll
        * @description 滚动效果
        * @param ele {Node} 执行scroll的元素，一般为列表容器
        * @param index {Number}
        * @param activeIndex {Number}
        * @public
        */
        scroll: function (ele, index, activeIndex) {
            var self = this, effect = self.get("effect"),
                switchable = self.get("host")[self.get("relateType")],
                direction = FORWARD,
                isX = effect === SCROLL_X,
                viewSize = self._viewSize[isX ? 0 : 1],
                viewDiff = viewSize * index,
                props = {},
                prop = isX ? LEFT : TOP,
                len = switchable.get("length"),
                duration = self.get("duration"), easing = self.get("easing"),
                panels = switchable.get("panels"),
                isCirtical,
                diff;

            if (len > 2) {
                if (activeIndex === 0 && index === len - 1) {
                    isCirtical = true;
                    direction = BACKWARD;
                }
                else if (activeIndex === len - 1 && index === 0) {
                    isCirtical = true;
                    direction = FORWARD;
                }
            }
            else {
                if (index === 0) {
                    isCirtical = true;
                }
                direction = FORWARD;
            }

            if (isCirtical) {
                diff = self._ajustPosition(panels, direction, prop, viewSize);
            }


            props[prop] = (isCirtical ? diff : -viewDiff) + "px";
            //            ele.setStyles(props);
            //            return;
            if (self._anim) {

                self._anim.stop();

                self._anim.eventHandler.detach(); //移除所有已绑定的事件，重新绑定。

                self._anim.set("node", ele);
                self._anim.set("to", props);
                self._anim.set("duration", duration);
                self._anim.set("easing", easing);
                self._anim.run();
            }
            else {
                //只实例化一次，避免不断创建新实例导致内存开销不断
                self._anim = new S.Anim({
                    node: ele,
                    to: props,
                    duration: duration,
                    easing: easing
                }).run();
            }

            //重新绑定，有效利用闭包
            self._anim.eventHandler = self._anim.on("end", function () {
                if (isCirtical) {
                    self._resetPosition(panels, direction, prop, viewSize);
                }
            });
        },
        initializer: function () {
            var self = this, switchable = self.get("host")[self.get("relateType")], effect = self.get("effect");
            if (effect == NONE) {
                return;
            }

            // 可以是switchable，也可以是继承自switchable的插件
            if (!switchable instanceof S.Plugin.Switchable) {
                S.error("get switchable failed");
                return;
            }

            // 准备工作
            self._routine();

            //绑定插件相关事件
            self._bindEvent();

        },
        destructor: function () {
            if (self._anim) {
                self._anim.destroy();
            }
        }
    });

    S.namespace("Plugin");
    S.Plugin.SwitchableEffect = Effect;

}, "1.0.2", { requires: ["node", "anim-base", "plugin"] });