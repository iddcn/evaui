/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />
/*
    author:zuoxianjin@yintai.com
    update:
      ***2011-2-28***
            
*/

/*
    @description: 提供商品预览功能，该功能组件主要有“定位”和“显示”两个子模块实现相应的功能。
    @module preview
*/
YUI.add("preview", function (S) {
    var EVENT_PREVIEW = "pre-view", EVENT_VIEW = "view",
        DOT = ".",
        DISPLAY = "display", NONE = "none", BLOCK = "block",
        VISIBILITY = "visibility", VISIBLE = "visible", HIDDEN = "hidden",
        PIXEL = "px",
        HEIGHT = "height", TOP = "top",
        PREFIX = "";

    /*
    * 预览功能构造
    * @param triggers {S.NodeList} 
    * 触发预览效果的源（通常为一组html标签元素）,可以为字符串格式的，也可以为Node类型的，
    * 如果为string类型的，则需要在opts参数中指定conNode配置
    * @param opts {hash} 配置信息
    */
    var Preview = function (triggers, opts) {
        var self = this;

        if (!(self instanceof S.Preview)) {
            return new Preview(triggers, opts);
        }
        //预览触发标签
        self.triggers = triggers;
        //配置信息
        self.opts = opts;
        //定位实例
        self.locate = null;
        //显示实例
        self.view = null;
        //事件中心
        self.eventCenter = null;
        //表示preview是否处于显示状态
        self.showing = false;
        //延迟时间计时器
        self.delayTimer = null;
        //preview 容器
        self.tipBox = null;
        //preview 显示面板
        self.canvas = null;

        //初始化
        self._init();
    }
    Preview.prototype = {
        /**
        * 初始化操作
        * @method _init
        * @private
        */
        _init: function () {
            var self = this;
            if (!self.triggers instanceof S.NodeList && !S.Lang.isString(self.triggers)) {
                return;
            }

            self.opts = S.merge(Preview.DefaultConfigs, self.opts);

            self.tipBox = S.one(self.opts.tipBoxSel);

            if (self.tipBox === null) {
                var tmpCon = S.Node.create("<div />");
                tmpCon.set("innerHTML", self.opts.previewConTempate);
                new S.Node(document.body).appendChild(tmpCon);
                self.tipBox = tmpCon.one(self.opts.tipBoxSel);
                if (self.tipBox === null) {
                    S.error("初始化失败，请确定'入口参数'配置是否正确。");
                    return;
                }
            }

            self.canvas = self.tipBox.one(self.opts.canvasSel);

            //初始化两个核心模块
            if (self.tipBox && self.canvas) {
                self.locate = new Locate(self.tipBox, self);
                self.view = new View(self.canvas, self);
                self.tipBox.removeClass(self.opts.maidenCls);

                self._bindEvent();
            }
        },
        /**
        * 绑定组件内部所需的所有事件
        * @method _bindEvent
        * @private
        */
        _bindEvent: function () {
            var self = this,
                triggers = self.triggers,
                opts = self.opts,
                tipBox = self.tipBox,
                con = null;

            //绑定preview触发事件
            if (S.Lang.isString(triggers) && opts.conNode) {
                S.delegate("mouseenter", function (e) {
                    self.preview(e.currentTarget);
                }, opts.conNode, triggers);
            }
            else {
                triggers.each(function (trigger) {
                    trigger.on("mouseenter", function (e) {
                        if (!self.showing) {
                            self.preview(e.currentTarget);
                        }
                        self.showing = true;
                        S.log(self.showing);
                    });
                    trigger.on("mouseleave", function (e) {
                        self.showing = false;
                        S.log(self.showing);
                        clearTimeout(self.delayTimer);
                        self.delayTimer = setTimeout(function () {
                            self.cancelView();
                        }, self.opts.delay);
                    });
                });
            }

            //订阅view模块的事件，跟踪显示。
            //这里主要是跟踪“显示前”和“显示后”的状态，以进行tipBox的合理定位。
            self.view.on(EVENT_VIEW, function (e) {
                var rNode = e.relateNode;
                if (rNode) {
                    self.locate.checkPos(rNode);
                }
            });
            self.view.on(EVENT_PREVIEW, function (e) {
                var rNode = e.relateNode;
                if (rNode) {
                    self.locate.checkPos(rNode);
                }
            });

            //监听tipBox的鼠标入出事件，决定是否正确显示/隐藏tipBox
            tipBox.on("mouseenter", function (e) {
                self.showing = true;
            });
            tipBox.on("mouseleave", function (e) {
                self.showing = false;
                clearTimeout(self.delayTimer);
                self.delayTimer = setTimeout(function () {
                    self.cancelView();
                }, self.opts.delay);
            });
        },
        /**
        * 预览指定的节点（节点中记录着预览显示信息）
        * @method preview
        * @param node {Node} 预览的节点
        */
        preview: function (node) {
            if (!node instanceof S.Node) {
                return;
            }

            var self = this,
                preHTML = node.one(self.opts.preHTMLSel);

            if (preHTML && preHTML.get("tagName") === "TEXTAREA") {
                preHTML = preHTML.get("value");
                //定位显示
                self.locate.show();
                //内容填充
                self.view.viewHTML(preHTML, node);
            }
        },
        /**
        * 取消preview的显示
        * @method cancelView
        * @public
        */
        cancelView: function () {
            var self = this;

            //如果隐藏状态没有被改变，则执行隐藏操作。
            if (!self.showing) {
                self.locate.hide();
            }
        }
    }
    Preview.DefaultConfigs = {
        //预览容器选择符
        tipBoxSel: DOT + PREFIX + "preview-box",
        //预览显示面板选择符
        canvasSel: DOT + PREFIX + "bd",
        //预览内容容器选择符，如果预览内容（HTML）存储在指定的容器中。
        preHTMLSel: DOT + PREFIX + "pre-html",
        //预览图片容器选择符
        preImgSel: DOT + PREFIX + "prev-img img",
        //箭头指向选择符
        arrowSel: DOT + PREFIX + "arrow",
        //左箭头样式类
        arrowLCls: PREFIX + "al",
        //右箭头样式类
        arrowRCls: PREFIX + "ar",
        //标签未被实例化时的样式类（通常会存储一些特定的状态显示效果）
        maidenCls: PREFIX + "uninst",
        //延迟时间
        delay: 200,
        //当实例化trigger参数为字符串时，需要通过该参数传递conNode元素，也就是trigger的容器元素
        conNode: null,
        //加载中图片显示路径
        loadingImgPath: "http://zuoxianjin/rs/img/o_loading.gif",
        //滚动显示中的“下一个”功能键的选择符
        switchNextSel: DOT + PREFIX + "next-btn",
        //滚动显示中的“上一个”功能键的选择符
        switchPrevSel: DOT + PREFIX + "prev-btn",
        //滚动显示中的“下一个”功能键可用时的样式类
        switchNextEnaCls: PREFIX + "n-ena",
        //滚动显示中的“上一个”功能键可用时的样式类
        switchPrevEnaCls: PREFIX + "p-ena",
        //滚动显示中的“下一个”功能键禁用时的样式类
        switchNextDisaCls: PREFIX + "n-disa",
        //滚动显示中的“上一个”功能键禁用时的样式类
        switchPrevDisaCls: PREFIX + "p-disa",
        //滚动显示列表中处于选中状态的样式类
        switchSeledCls: PREFIX + "on",
        //滚动效果绑定标签
        switchConSel: DOT + PREFIX + "nail",
        //滚动显示面板容器（具体请参照S.Carousel组件的Demo）
        switchPanelsCls: PREFIX + "switch-panels",
        //预览显示容器模板，当外部没有提供容器标签时，使用该模板。
        previewConTempate: '\<div class="preview-box uninst">\
                                <span class="arrow al"></span>\
                                <div class="bd">\
                                </div>\
                            </div>'
    }

    S.Preview = Preview;

    /*
    * 为预览效果提供定位功能。
    * 主要执行一件事情，通过外部通知调整指定节点的位置，以达到正确显示的目的。
    * @param node {Node} 被定位的元素
    * @param context {string} 当前实例的上下文对象（也就是实例化后的Preview实例）
    */
    var Locate = function (node, context) {
        var self = this;

        //依赖的节点
        self.node = node;
        //浮动显示组件
        self.overlay = null;
        //上下文对象
        self.context = context;

        //初始化
        self._init();
    };
    Locate.prototype = {
        /**
        * 初始化操作
        * @method _init
        * @private
        */
        _init: function () {
            var self = this;

            //实例化浮动元素
            self.overlay = new S.Overlay({
                srcNode: self.node
            });
            self.overlay.render();
            //初始化隐藏
            self.hide(); ;
        },
        /**
        * 通过指定关联的节点来定位浮动显示的节点
        * @param relate {Node} 关联的节点
        * @param node {Node} 定位显示的节点
        */
        checkPos: function (relate) {
            var self = this,
                node = self.node,
                context = self.context,
                arrowLCls = context.opts.arrowLCls,
                arrowRCls = context.opts.arrowRCls;

            if (!relate instanceof S.Node || !node instanceof S.Node) {
                S.error("使用checkPos时，传入的参数必须为S.Node类型");
                return;
            }

            //当关联的元素没有显示在当前视窗内时隐藏定位元素
            if (!relate.inRegion(relate.get("viewportRegion"))) {
                self.overlay.hide();
            }
            else {
                //箭头标签，如果当前实例的容器对象存在，则使用容器对象中的样式类，否则使用默认的
                var arrow = node.one(context.opts.arrowSel);

                var rRegion = relate.get("region");
                var nRegion = node.get("region");
                var aRegion = arrow.get("region");
                var winH = relate.get("winHeight");
                var winW = relate.get("winWidth");
                var sX = relate.get("docScrollX");
                var sY = relate.get("docScrollY");

                //被定为元素的高度
                var nT = rRegion.top;
                //被定位元素的右侧位置
                var nR = rRegion.right + 10;

                //为真，则表明箭头位置需要调整
                var turn = false;

                //纵向差值，>0表示被覆盖
                var diffB = nT + nRegion.height - winH - sY,
                    diffT = sY - nT,
                    diffR = nR + nRegion.width - winW - sX;

                //如果条件为真，则说明底部显示不完整，需要上移顶部位置。
                if (diffB > 0) {
                    nT -= diffB;
                }
                //条件为真，则说明右侧显示空间不够，需要在左边显示（左边无条件显示）
                if (diffR > 0) {
                    nR = rRegion.left - nRegion.width - 10;
                    //判断是否需要调整箭头位置
                    if (arrow.hasClass(arrowLCls)) {
                        turn = true;
                    }
                }
                else {
                    if (arrow.hasClass(arrowRCls)) {
                        turn = true;
                    }
                }

                //移动被定位元素
                self.overlay.move(nR, nT);

                //如果箭头的位置需要修改
                if (turn) {
                    //判断上一次箭头处于什么位置
                    if (arrow.hasClass(arrowLCls)) {
                        arrow.replaceClass(arrowLCls, arrowRCls);
                    }
                    else {
                        arrow.replaceClass(arrowRCls, arrowLCls);
                    }
                }

                //箭头标准显示位置
                var arrowT = 30;

                if (arrowT < diffB) {
                    arrow.setStyle(TOP, arrowT + diffB > nRegion.height ? nRegion.height - aRegion.height : arrowT + diffB);
                }
                //还原默认值
                else {
                    arrow.setStyle(TOP, arrowT);
                }
            }
        },
        /**
        * 显示用于定位的overlay对象
        * @method show
        * @public
        */
        show: function () {
            var self = this;

            self.overlay.show();
            self.node.get("parentNode").setStyle(VISIBILITY, VISIBLE);
        },
        /**
        * 隐藏用于定位的overlay对象
        * @method hide
        * @public
        */
        hide: function () {
            var self = this;

            self.overlay.hide();
            self.node.get("parentNode").setStyle(VISIBILITY, HIDDEN);
        }
    }


    /*
    * 为预览效果提供显示功能
    * @param canvas {Node} 显示预览内容的容器
    * @param context {Node} 上下文对象
    */
    var View = function (canvas, context) {
        var self = this;

        //上下文对象
        self.context = context;
        //事件中心
        self.EC = null;
        //显示画板
        self.canvas = canvas;
        //缓存的节点
        self.cacheNodes = {};
        //在可以缓存显示内容节点的情况下，标识当前显示的内容节点
        self.curPanel = null;
        //存储自动生成“加载中”状态节点唯一标识
        self._loadingCNodeToken = null;

        //初始化
        self._init();
    }
    View.prototype = {
        /**
        * 初始化操作
        * @method _init
        * @private
        */
        _init: function () {
            var self = this;

            //创建时间对象
            self.EC = new EventCenter();
        },
        /**
        * 为指定的节点初始化carousel功能
        * @method _initCarousel
        * @param node {Node} 包绑定carousel效果的节点
        * @private
        */
        _initCarousel: function (node) {
            var self = this,
                opts = self.context.opts;

            //绑定效果
            node.plug([
                { fn: S.Plugin.Carousel,
                    cfg: {
                        circular: false,
                        steps: 4,
                        panelsCls: opts.switchPanelsCls,
                        hasTrigger: false,
                        viewSize: [(S.UA.ie == 6 ? 176 : 174), 45],
                        prevBtnCls: opts.switchPrevSel.substr(1),
                        nextBtnCls: opts.switchNextSel.substr(1),
                        disableBtnCls: ""
                    }
                },
                { fn: S.Plugin.SwitchableEffect,
                    cfg: {
                        effect: "scrollX",
                        relateType: "carousel",
                        easing: "easeOutStrong",
                        duration: 1
                    }
                }
                    ]);

            //绑定switch和itemSelect事件
            node.carousel.on("switch", function (e) {
                var caro = node.carousel,
                    actIndex = caro.get("activeIndex"),
                    preBtn = node.one(opts.switchPrevSel),
                    nextBtn = node.one(opts.switchNextSel),
                    caroLen = caro.get("length");

                if (actIndex == caroLen - 1 || actIndex == 0) {
                    if (actIndex == caroLen - 1) {
                        nextBtn.removeClass(opts.switchNextEnaCls);
                        nextBtn.addClass(opts.switchNextDisaCls);
                        //当总个数为2时需要把“上一项”的样式变为可用
                        if (caroLen == 2) {
                            preBtn.removeClass(opts.switchPrevDisaCls);
                            preBtn.addClass(opts.switchPrevEnaCls);
                        }
                    }
                    else {
                        preBtn.addClass(opts.switchPrevDisaCls);
                        preBtn.removeClass(opts.switchPrevEnaCls);
                        //当总个数为2时需要把“上一项”的样式变为可用
                        if (caroLen == 2) {
                            nextBtn.removeClass(opts.switchNextDisaCls);
                            nextBtn.addClass(opts.switchNextEnaCls);
                        }
                    }
                }
                else {
                    nextBtn.removeClass(opts.switchNextDisaCls);
                    nextBtn.addClass(opts.switchNextEnaCls);
                    preBtn.removeClass(opts.switchPrevDisaCls);
                    preBtn.addClass(opts.switchPrevEnaCls);
                }
            });
            node.carousel.on("itemSelect", function (e) {
                var node = e.node;
                node.siblings().removeClass(opts.switchSeledCls);
                node.addClass(opts.switchSeledCls);
                var preImg = self._curPanel.one(opts.preImgSel);
                var tmpImg = new S.Node(new Image());
                tmpImg.on("load", function () {
                    preImg.set("src", node.get("rel"));
                    tmpImg = null;
                });
                tmpImg.set("src", node.get("rel"));
                preImg.set("src", opts.loadingImgPath);
            });
        },
        /**
        * 绑定事件接口
        * @method on
        * @param type {string} 事件类型
        * @param fn {Function} 事件处理方法
        * @param context {Object} 事件处理方法上下文对象
        * @param args {any} 事件参数，可以为多个
        * @public
        */
        on: function (type, fn, context, args) {
            this.EC.on(type, fn, context, args);
        },
        /**
        * 触发预览前事件
        * @method fireOnPreview
        * @param args {EventFacade} 事件参数
        * @public
        */
        fireOnPreview: function (args) {
            this.EC.fire(EVENT_PREVIEW, args);
        },
        /**
        * 触发预览后事件
        * @method fireOnView
        * @param args {EventFacade} 事件参数
        * @public
        */
        fireOnView: function (args) {
            this.EC.fire(EVENT_VIEW, args);
        },
        /**
        * 显示传入的HTML
        * @method viewHTML
        * @param html {string} html标签内容
        * @param node {Node} 需要预览内容的节点
        * @public
        */
        viewHTML: function (html, node) {
            var self = this,
                token = node.get("id"),
                context = self.context;

            if (S.Lang.isString(html)) {
                self.preShow(); //预览图显示前状态
                self.fireOnPreview({ relateNode: node });
                var innerNode = null;

                //先检查是否存在缓存
                if (token) {
                    innerNode = self._getCNode(token);
                }
                if (innerNode == null) {
                    var innerNode = S.Node.create("<div />");
                    innerNode.set("innerHTML", html);
                    self.canvas.appendChild(innerNode);
                    //获取scroll中所有元素
                    var trigerItems = innerNode.all(context.opts.switchConSel + " a");
                    if (trigerItems.size() > 0) {
                        var tmpImg = new S.Node(new Image());
                        //当指定图片加载完毕后再显示完整的内容
                        tmpImg.on("load", function (e) {
                            var preImg = innerNode.one(context.opts.preImgSel);
                            preImg.set("src", tmpImg.get("src"));
                            var switchCon = innerNode.one(context.opts.switchConSel);
                            if (switchCon) {
                                //初始化carousel
                                self._initCarousel(switchCon);
                            }

                            self._showPanel(innerNode);
                            self.fireOnView({ relateNode: node });
                        });
                        //默认显示第一项
                        trigerItems.item(0).addClass("on");
                        tmpImg.set("src", trigerItems.item(0).get("rel"));
                    }
                    //如果给出了token，则将其放入缓存
                    if (token) {
                        self._pushCNode(token, innerNode, true);
                    }
                } else {
                    self._showPanel(innerNode);
                    self.fireOnView({ relateNode: node });
                }
            }
        },
        /**
        * 预显示内容
        * @method preShow
        * @public
        */
        preShow: function () {
            var self = this;
            var lN = self._getCNode(self._loadingCNodeToken);
            //缓存是否存在
            if (lN !== null) {
                self._showPanel(lN);
            }
            else {
                var node = S.Node.create("<div class='preview-loading' />");
                var loading = S.Node.create("<img src='" + self.context.opts.loadingImgPath + "' alt='加载中' />");
                node.appendChild(loading);
                self.canvas.appendChild(node);
                S.stamp(node);
                self._loadingCNodeToken = node._yuid;
                self._showPanel(node);
                //放入缓存
                self._pushCNode(self._loadingCNodeToken, node);
            }
        },
        /**
        * 根据指定的Token把对应的节点放入缓存
        * @method _pushCNode
        * @param token {string} 缓存键值
        * @param node {Node} 要缓存的节点
        * @param force {boolean} 如果指定键值的缓存项已存在，是否使用给定的node替换已存在的。
        * @private
        */
        _pushCNode: function (token, node, force) {
            var self = this,
                cache = self.cacheNodes;

            if (cache[token]) {
                if (force) {
                    cache[token] = node;
                }
            }
            else {
                cache[token] = node;
            }
        },
        /**
        * 删除根据指定的Token对应的缓存节点
        * @method _removeCNode
        * @param token {string} 缓存键值
        * @private
        */
        _removeCNode: function (token) {
            var self = this;
            if (!!self[token]) {
                delete self.token;
            }
        },
        /**
        * 通过制定的token获取对应的节点值
        * @method _getCNode
        * @param token {string} 缓存键值
        * @private
        */
        _getCNode: function (token) {
            var self = this,
                cache = self.cacheNodes;
            for (var item in cache) {
                if (cache.hasOwnProperty(item) && token === item) {
                    return cache[item];
                }
            }
            return null;
        },
        /**
        * 显示指定的节点
        * @method _showPanel
        * @param panel {Node} 要显示的节点
        * @private
        */
        _showPanel: function (panel) {
            var self = this,
                curP = self._curPanel;

            if (curP) {
                curP.setStyle(DISPLAY, NONE);
                //不重置列表位置
                //                var scroller = panel.one(".nail");
                //                if (scroller && scroller.carousel) {
                //                    scroller.carousel.switchTo(0);
                //                }
            }
            self._curPanel = panel;
            panel.setStyle(DISPLAY, BLOCK);
        }
    }

    /*
    * 事件中心
    */
    var EventCenter = function () {
    }
    S.augment(EventCenter, S.EventTarget);

}, "1.0.3", { requires: ['node', 'overlay', 'event-custom-base', 'event-mouseenter', 'event-ready', 'plug-carousel', 'plug-switchable-effect'] });