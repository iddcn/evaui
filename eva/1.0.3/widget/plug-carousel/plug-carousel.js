/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />

/*
 *  提供carousel效果，继承自S.Plugin.Switchable
 */

YUI.add("plug-carousel", function (S) {

    var CLS_PREFIX = "eva-switchable-", PREV_BTN = "prevBtn", NEXT_BTN = "nextBtn",
        EVENT_ITEM_SELECT = "itemSelect";

    var Carousel = function () {
        var self = this;
        Carousel.superclass.constructor.apply(self, arguments);
    }
    Carousel.NAME = "Carousel";
    Carousel.NS = "carousel";
    Carousel.ATTRS = {
        /**
        * 是否循环显示
        * @property circular
        * @type boolean
        * @default false
        */
        circular: {
            value: false
        },
        /**
        * “上一个”触发源样式
        * @property prevCls
        * @type string
        */
        prevBtnCls: {
            value: CLS_PREFIX + "prev"
        },
        /**
        * “下一个”触发源样式
        * @property nextCls
        * @type string
        */
        nextBtnCls: {
            value: CLS_PREFIX + "next"
        },
        disableBtnCls: {
            value: CLS_PREFIX + "disable-btn"
        }
    }
    S.extend(Carousel, S.Plugin.Switchable, {
        /**
        * @method _carouselRoutine
        * @description 前期准备操作
        * @private
        * @return {boolean} true表示继续后续执行，false表示中断执行。
        */
        _carouselRoutine: function () {
            var self = this, container = self.get("container"),
                circular = self.get("circular"),
                disableCls = self.get("disableBtnCls"),
                autoplay = self.get("autoplay"),
                pauseOnHover = self.get("pauseOnHover"),
                pass = true;

            S.Array.each(["prev", "next"], function (b) {
                var btn = self[b + "Btn"] = container.one("." + self.get(b + "BtnCls"));
                if (btn) {
                    btn.on("click", function (e) {
                        e.preventDefault();
                        if (!btn.hasClass(disableCls)) {
                            self[b]();
                        }
                    });
                    //鼠标经过next or prev的时候暂停自动播放
                    btn.on("mouseenter", function (e) {
                        if (pauseOnHover) {
                            self._stopAutoPlay();
                            self.set("paused", true);
                        }
                    });
                    btn.on("mouseleave", function (e) {
                        if (autoplay) {
                            self._startAutoPlay();
                            self.set("paused", false);
                        }
                    });
                }
                else {
                    pass = false;
                }
            });
            //如果不允许循环显示，则需要为prev and next set disable state
            if (!circular) {
                self.on("switch", function () {
                    self._validate();
                });
            }

            self.get("panels").on("click", function (e) {
                self.fire(EVENT_ITEM_SELECT, this); //单击列表项时触发
            });

            return pass;
        },
        /**
        * @method _validate
        * @description 验证状态
        * @private
        */
        _validate: function () {
            var self = this, index = self.get("activeIndex"), len = self.get("length"),
                disableCls = self.get("disableBtnCls"),
                disableBtn = index === 0 ? self[PREV_BTN] :
                    index === len - 1 ? self[NEXT_BTN] : undefined;

            S.Array.each([self[PREV_BTN], self[NEXT_BTN]], function (btn) {
                btn.removeClass(disableCls);
            });
            if (disableBtn) {
                disableBtn.addClass(disableCls);
            }
        },
        /**
        * @method _nextOrPrev
        * @description 向下或向上滚动
        * @param next {boolean} 是否想下滚动
        * @private
        */
        _nextOrPrev: function (next) {
            var self = this, circular = self.get("circular"),
                len = self.get("length"), activeIndex = self.get("activeIndex");

            if (next) {
                if (activeIndex < len - 1) {
                    self.switchTo(activeIndex + 1);
                }
                else if (activeIndex >= len - 1 && circular) {
                    self.switchTo(0);
                }
            }
            else {
                if (activeIndex > 0) {
                    self.switchTo(activeIndex - 1);
                }
                else if (activeIndex <= 0 && circular) {
                    self.switchTo(len - 1);
                }
            }
        },
        /**
        * @method next
        * @description 向下滚动
        * @public
        * @chainable
        */
        next: function () {
            var self = this;

            self._nextOrPrev(true);

            return self;
        },
        /**
        * @method prev
        * @description 向前滚动
        * @public
        * @chainable
        */
        prev: function () {
            var self = this;

            self._nextOrPrev(false);

            return self;
        },
        initializer: function () {
            var circular = this.get("circular");
            
            var pass = this._carouselRoutine()

            if (pass) {
                !circular && this._validate(); //当circular为false时才需要验证状态
            }
            else {
                S.error("initialize Carousel failed,check the private method _carouselRoutine()");
            }
        },
        destructor: function () {
            var self = this;

            S.Array.each(["prev", "next"], function (b) {
                var btn = self[b + "Btn"];
                if (btn) {
                    btn.purge();
                }
                btn.removeClass(self.get("disableBtnCls"));
                btn = null;
            });
        }
    });
    S.namespace("Plugin");
    S.Plugin.Carousel = Carousel;

}, "1.0.2", { requires: ["plug-switchable"] });