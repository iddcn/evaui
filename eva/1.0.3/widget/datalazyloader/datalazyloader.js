/// <reference path="../../../../yui/3.1.2/build/yui/yui.js" />

/**
* 数据延迟加载组件
* @module   datalazyloader
*
* NOTES:
* 模式为 auto 时：
*  1. 在 Firefox 下不尽完美。脚本运行时，也有导致部分 Aborted 链接。
*  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 abort 掉，
*     再在滚动时延迟加载，反而增加了链接数。
*  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 abort 掉下载。该
*     脚本完全无用。
*  4. 在 Opera 下完美运行。
*
* 模式为 manual 时：（要延迟加载的图片，src 属性替换为 data-src, 并将 src 的值赋为 placeholder ）
*  1. 在任何浏览器下都可以完美实现。
*  2. 缺点是不渐进增强，无 JS 时，图片不能展示。
*
* 缺点：
*  1. 对于大部分情况下，需要拖动查看内容的页面（比如搜索结果页），快速滚动时加载有损用
*     户体验（用户期望所滚即所得），特别是网速不好时。
*  2. auto 模式不支持 Webkit 内核浏览器；IE 下，有可能导致 HTTP 链接数的增加。
*
* 优点：
*  1. 可以很好的提高页面初始加载速度。
*  2. 第一屏就跳转，延迟加载图片可以减少流量。
*
* 参考资料：
*  1. http://davidwalsh.name/lazyload MooTools 的图片延迟插件
*  2. http://vip.qq.com/ 模板输出时，就替换掉图片的 src
*  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
*  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-images/
*  5. http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
*
* 特别要注意的测试用例:
*  1. 初始窗口很小，拉大窗口时，图片加载正常
*  2. 页面有滚动位置时，刷新页面，图片加载正常
*  3. 手动模式，第一屏有延迟图片时，加载正常
*/

YUI.namespace("Y.DataLazyLoader");
YUI.add("datalazyloader", function (Y) {
    var WIN = window, DOC = document,
    IMG_SRC_DATA = "data-src-manual", AREA_DATA_CLS = "data-area",
    MANUAL = "manual",
    DISPLAY = "display", DEFAULT = "default", NONE = "none", CUSTOM = "data-src",
    SCROLL = "scroll", RESIZE = "resize",
    DEFAULT_CONFIG = {
        /**
        * 懒处理模式
        *   auto   - 自动化。html 输出时，不对 img.src 做任何处理
        *   manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 IMG_SRC_DATA
        * 注：对于 textarea 数据，只有手动模式
        */
        mod: MANUAL,
        /**
        * 当前视窗往下，diff px 外的 img/textarea 延迟加载
        * 适当设置此值，可以让用户在拖动时感觉数据已经加载好
        * 默认为当前视窗高度（两屏以外的才延迟加载）
        */
        diff: DEFAULT,
        /**
        * 图像的占位图，默认无
        */
        placeholder: NONE
    };


    Y.DataLazyLoader = function (cons, cfg) {
        var self = this;
        if (!(self instanceof Y.DataLazyLoader)) {
            return new Y.DataLazyLoader(cons, cfg);
        }
        // 允许仅传递 cfg 一个参数
        if (cfg === undefined) {
            cfg = cons;
            cons = [DOC];
        }
        // cons 是一个 HTMLElement 时
        if (!Y.Lang.isArray(cons)) {
            cons = [Y.get(cons) || DOC];
        }

        /**
        * 图片所在容器（可以多个），默认为 [doc]
        * @type Array
        */
        self.cons = cons;

        /**
        * 需要延迟下载的图片
        * @type Array
        */
        self.images = [];

        /**
        * 需要延迟处理的 textarea
        * @type Array
        */
        self.areaes = [];

        /**
        * 配置参数
        * @type Object
        */
        self.config = Y.merge(DEFAULT_CONFIG, cfg);

        /**
        * 和延迟项绑定的回调函数
        * @type object
        */
        self.callbacks = { els: [], fns: [] };

        self._init();
    }
    Y.DataLazyLoader.prototype = {
        /**
        * 初始化
        * @protected
        */
        _init: function () {
            var self = this;
            self.threshold = self._getThreshold();

            /*暂时只支持 loadCustomLazyData 功能*/
//            self._filterItems();
//            self._initLoadEvent();
        },
        /**
        * 获取并初始化需要延迟的 images 和 areaes
        * @protected
        */
        _filterItems: function () {
            var self = this,
                cons = self.cons,
                n, N, imgs, areaes, i, len, img, area,
                lazyImgs = [], lazyAreas = [];

            for (n = 0, N = cons.length; n < N; ++n) {
                imgs = Y.all('img', cons[n]);
                self._filterImgs(imgs);

                areaes = Y.all('textarea', cons[n]);
                self._filterAreas(areaes);
            }
        },
        /**
        * filter for lazyload image
        * @protected
        */
        _filterImgs: function (imgs) {
            var self = this,
            threshold = self.threshold,
                placeholder = self.config.placeholder,
                isManualMod = self.config.mod === MANUAL;

            imgs.each(function (img) {
                var dataSrc = img.getAttribute(IMG_SRC_DATA);
                // 手工模式，只处理有 data-src 的图片
                if (isManualMod) {
                    if (dataSrc) {
                        if (placeholder !== NONE) {
                            img.setAttribute("src", placeholder);
                        }
                        self.images.push(img);
                    }
                }
                // 自动模式，只处理 threshold 外无 data-src 的图片
                else {
                    // 注意：已有 data-src 的项，可能已有其它实例处理过，不用再次处理
                    if (img.get("region").top > threshold && !dataSrc) {
                        img.setAttribute(IMG_SRC_DATA, img.getAttribute("src"));
                        if (placeholder !== NONE) {
                            img.setAttribute("src", placeholder);
                        } else {
                            img.removeAttribute('src');
                        }
                        self.images.push(img);
                    }
                }
            });
        },

        /**
        * filter for lazyload textarea
        * @protected
        */
        _filterAreas: function (areas) {
            var self = this;
            areas.each(function (area) {
                if (area.hasClass(AREA_DATA_CLS)) {
                    self.areaes.push(area);
                }
            });
        },

        /**
        * 初始化加载事件
        * @protected
        */
        _initLoadEvent: function () {
            var timer, self = this;
            // scroll 和 resize 时，加载图片

            /*
             *该功能需要补充和测试 zuoxianjin edit at 20101030

            var scrollHandler = Y.on(SCROLL, loader, WIN);
            var resizeHandler = Y.on(RESIZE, foreLoader, WIN);

            // 需要立即加载一次，以保证第一屏的延迟项可见
            if (self._getItemsLength()) {
            //Y.domready(function () {

            //});
            loadItems();
            }
            */

            // 加载函数
            function loader() {
                if (timer) return;
                timer = Y.later(100,
                self,
                    function () {
                        loadItems();
                        timer = null;
                    }); // 0.1s 内，用户感觉流畅
            }

            // 加载延迟项
            function loadItems() {
                self._loadItems();
                if (self._getItemsLength() === 0) {
                    scrollHandler.detach();
                    resizeHandler.detach();
                }
            }

            // loader前步骤
            function foreLoader() {
                self.threshold = self._getThreshold();
                loader();
            }
        },

        /**
        * 加载延迟项
        * @protected
        */
        _loadItems: function () {
            var self = this;
            self._loadImgs();
            self._loadAreas();
            self._fireCallbacks();
        },

        /**
        * 加载图片
        * @protected
        */
        _loadImgs: function () {
            var self = this;
            //edit at 20101030 remove Y.Array.filter method ,because this method's dependency will lead to bug in ie6
            //            self.images = Y.Array.filter(self.images, self._loadImg, self);
//            self.images = Y.Array.each(self.images, self._loadImg);
        },

        /**
        * 监控滚动，处理图片
        * @protected
        */
        _loadImg: function (img) {
            var self = this,
                scrollTop = Y.get(document).get("scrollTop"),
                threshold = self.threshold + scrollTop,
                region = img.get("region");

            if (region.top <= threshold) {
                self._loadImgSrc(img);
            } else {
                return true;
            }
        },

        /**
        * 加载图片 src
        * @protected
        */
        _loadImgSrc: function (img, flag) {
            flag = flag || IMG_SRC_DATA;
            var dataSrc = img.getAttribute(flag);

            if (dataSrc && img.src != dataSrc) {
                img.setAttribute("src", dataSrc);
                img.removeAttribute(flag);
            }
        },

        /**
        * 加载 textarea 数据
        * @protected
        */
        _loadAreas: function () {
            var self = this;
            //edit at 20101030 remove Y.Array.filter method ,because this method's dependency will lead to bug in ie6
            //            self.areaes = Y.Array.filter(self.areaes, self._loadArea, self);
//            self.areas = Y.Array.each(self.areas, self._loadArea);
        },

        /**
        * 监控滚动，处理 textarea
        * @protected
        */
        _loadArea: function (area) {
            var self = this, top,
                isHidden = area.getComputedStyle(DISPLAY) === NONE,
                scrollTop = Y.get(document).get("scrollTop");

            // 注：area 可能处于 display: none 状态，DOM.offset(area).top 返回 0
            // 这种情况下用 area.parentNode 的 Y 值来替代
            top = (isHidden ? area.get("parentNode").get("region").top : area.get("region").top);

            if (top <= self.threshold + scrollTop) {
                self._loadAreaData(area.get("parentNode"), area);
            } else {
                return true;
            }
        },

        /**
        * 从 textarea 中加载数据
        * @protected
        */
        _loadAreaData: function (container, area) {

            // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
            area.setStyle(DISPLAY, NONE);
            area.setAttribute("class", "");
            var content = Y.Node.create('<div></div>');
            //container.insertBefore(content, area);
			area.insert(content,'before');
            content.set("innerHTML", area.get("value"));

            //area.value = ''; // bug fix: 注释掉，不能清空，否则 F5 刷新，会丢内容
        },

        /**
        * 触发回调
        * @protected
        */
        _fireCallbacks: function () {
            var self = this,
                callbacks = self.callbacks,
                els = callbacks.els, fns = callbacks.fns,
                scrollTop = Y.get(document).get("scrollTop"),
                threshold = self.threshold + scrollTop,
                i, el, fn, remainEls = [], remainFns = [];

            for (i = 0; (el = els[i]) && (fn = fns[i++]); ) {
                if (el.get("region").top <= threshold) {
                    fn.call(el);
                } else {
                    remainEls.push(el);
                    remainFns.push(fn);
                }

            }
            callbacks.els = remainEls;
            callbacks.fns = remainFns;
        },

        /**
        * 获取阈值
        * @protected
        */
        _getThreshold: function () {
            var diff = this.config.diff,
                vh = Y.get(document).get("viewportRegion").height;
            if (diff === DEFAULT) return 1 * vh; // diff 默认为当前视窗高度（两屏以外的才延迟加载）
            else return vh + (+diff); // 将 diff 转换成数值
        },

        /**
        * 获取当前延迟项的数量
        * @protected
        */
        _getItemsLength: function () {
            var self = this;
            return self.images.length + self.areaes.length + self.callbacks.els.length;
        },

        /**
        * 添加回调函数。当 el 即将出现在视图中时，触发 fn
        * @public
        */
        addCallback: function (el, fn) {
            var callbacks = this.callbacks;
            el = Y.get(el);

            if (el && Y.Lang.isFunction(fn)) {
                callbacks.els.push(el);
                callbacks.fns.push(fn);
            }
        },

        /**
        * 加载自定义延迟数据
        * @public
        */
        loadCustomLazyData: function (containers, type) {
            var self = this, area, imgs;

            // 支持数组
            if (!Y.Lang.isArray(containers)) {
				//debugger;
                containers = [Y.one(containers)];
            }

            // 遍历处理
            Y.each(containers, function (container) {
                switch (type) {
                    case 'img-src':
                        if (container.nodeName === 'IMG') { // 本身就是图片
                            imgs = [container];
                        } else {
                            imgs = container.all("img");
                        }

                        Y.each(imgs, function (img) {
                            self._loadImgSrc(img, CUSTOM);
                        });

                        break;

                    default:
						/*idd*/
					//debugger;
						if(container._node.type == 'textarea'){
							area = container;
						}else{
							area = container.one("textarea."+AREA_DATA_CLS);
						}
                        if (area) {
							area.each(function(it){
								self._loadAreaData(container, it);
							});
                        }
                }
            });
        }
    }
}, '', { requires: ['node'] });
