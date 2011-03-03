/// <reference path="../../../yui/3.1.2/build/yui/yui.js" />

/*
*  Y.Magnifier
*  说明：一个放大镜组件，需要一张小图片作为缩略图和一张大图片作为放大后的图片，通过鼠标在小图上的位置对应大图片作为背景的移动实现放大效果。
*  使用：Y.Magnifier(node,opts)
*  配置：zoomWidth:{int}放大容器的宽度，默认为300
*        zoomHeight:{int}放大容器的高度，默认为400
*        position:{string}放大镜相对于缩略图的位置，可选值有：top、bottom、left、right、inside。可以通过该参数传递放大器需要放置的任意容器的ID，默认为right
*        lensOpacity:{float}0-1，指定放大镜镜头的透明度，默认为0.5
*        smoothMove:{int}1>=，指定平滑移动值，值越大平滑效果越明显，默认为3
*        title:{string}放大时显示的标题，默认没有标题
*        titleOpacity:{float}0-1，指定标题透明度，默认为0.5
*        adjustX:{int}X轴偏移量，默认为0
*        adjustY:{int}Y轴偏移量，默认为0
*  方法：initFor:为指定的图片初始化放大镜效果，需要提供必选参数小图片地址和大图片地址以及可选参数opt配置信息。
*        destroy:销毁组件
*        format:工具方法，实现字符串的参数化拼接。
*/

YUI.namespace("Y.Magnifier");
YUI.add("magnifier", function (Y) {
    Y.Magnifier = function (node, sImgPath, bImgPath, opts) {
        var self = this;
        if (!(self instanceof Y.Magnifier)) {
            return new Y.Magnifier(node, sImgPath, bImgPath, opts);
        }

        this._node = null; //当前组件依赖的DOM元素（必须的）
        this._sImg = null; //待放大的小图片
        this._zoomDiv = null; //放大后图片显示的容器
        this._zoomImg = null; //放大后图片
        this._mouseTrap = null; //放大镜镜头捕获容器
        this._lens = null; //放大镜镜头
        this._ie6Fix = null; //IE6中的object,select遮罩层
        this._timer = null; //定时控制点
        this._loading = null; //状态容器
        this._destU = 0;
        this._destV = 0;
        this._currU = 0; //放大容器背景图片位置的X轴
        this._currV = 0; //放大容器背景图片位置的Y轴
        this._opts = {}; //当前组件的配置信息
        this._mx = 0; //记录鼠标的位置，X
        this._my = 0;
        this._lensW = 0; //放大镜头的宽度
        this._lensH = 0;
        this._ready = false; //所有元素及数据是否都已准备就绪
        this._delayInitForTimer = null; //initFor方法延迟时间句柄

        return this._init.apply(this, arguments);
    }
    Y.Magnifier.prototype = {
        /**
        * @method _init
        * @private
        * @description 组件初始化
        * @param {string} node 组件依赖容器选择器
        * @param {string} sImgPath 缩略图片路径
        * @param {string} bImgPath 大图片路径
        * @param {hash} opts 配置信息
        * @chainable
        */
        _init: function (node, sImgPath, bImgPath, opts) {

            this._node = Y.Lang.isString(node) ? Y.one(node) : node;
            if (this._node == null) {
                return;
            }
            this._sImg = this._node.one("img");
            if (!this._sImg) {
                return;
            }
            if (Y.UA.ie > 0 && Y.UA.ie < 7) {
                document.execCommand("BackgroundImageCache", false, true);
            }
            if (!this._node.get("parentNode").hasClass("magnifier-wrap")) {
                this._node.get("parentNode").appendChild(
                    Y.Node.create('<div class="magnifier-wrap" style="top:0px;z-index:100;position:relative;"></div>')).append(this._node);
            }
            this._node.all("img").setStyle("display", "block");
            this._node.setStyles({ display: "block", position: "relative" });
            var nodeReg = this._node.get("region");
            this._loading = this._node.get("parentNode").appendChild(
                Y.Node.create(this.format('<div style="width:%0px;position:absolute;top:75%;left:%1px;text-align:center;" class="magnifier-loading" >Loading...</div>', nodeReg.width / 3, (nodeReg.width / 2) - (nodeReg.width / 6)))
                ).setStyles({ opacity: 0.5, display: "none" });

            this._buildParam(opts);
            this.initFor(sImgPath, bImgPath, opts);

            return this;
        },
        /**
        * @method _buildParam
        * @private
        * @description 构建配置参数
        * @param {hash} opts 提供的配置信息
        * @chainable
        */
        _buildParam: function (opts) {
            opts = !opts ? {} : opts;
            var opts = this._opts;
            opts.zoomWidth = (typeof opts.zoomWidth == 'undefined') ? '300' : opts.zoomWidth;
            opts.zoomHeight = (typeof opts.zoomHeight == 'undefined') ? '400' : opts.zoomHeight;
            opts.position = (typeof opts.position == 'undefined') ? 'right' : opts.position;
            opts.lensOpacity = (typeof opts.lensOpacity == 'undefined') ? 0.5 : opts.lensOpacity;
            opts.smoothMove = (typeof opts.smoothMove == 'undefined') ? 3 : opts.smoothMove;
            opts.title = (typeof opts.title == 'undefined') ? "" : opts.title;
            opts.titleOpacity = (typeof opts.titleOpacity == 'undefined') ? 0.5 : opts.titleOpacity;
            opts.adjustX = (typeof opts.adjustX == 'undefined') ? 0 : opts.adjustX;
            opts.adjustY = (typeof opts.adjustY == 'undefined') ? 0 : opts.adjustY;
            return this;
        },
        /**
        * @method _parseParam
        * @private
        * @description 过滤配置信息
        * @param {hash} opts 提供的配置信息
        * @chainable
        */
        _parseParam: function (opts) {
            if (typeof opts == 'undefined' || opts == null) {
                var opts = {};
            }
            for (var i in opts) {
                this._opts[i] = opts[i];
            }
            return this;
        },
        /**
        * @method _zooming
        * @private
        * @description 通过不停的移动背景图片位置实现放大效果
        */
        _zooming: function () {
            var o = this;
            if (this._lens) {
                var sImgReg = this._sImg.get("region");
                var zoomReg = { width: this._zoomImg.get("width"), height: this._zoomImg.get("height") };
                var x = (this._mx - sImgReg[0] - (this._lensW * 0.5)) >> 0;
                var y = (this._my - sImgReg[1] - (this._lensH * 0.5)) >> 0;

                x = x < 0 ? 0 : x > (sImgReg.width - this._lensW) ? (sImgReg.width - this._lensW) : x;
                y = y < 0 ? 0 : y > (sImgReg.height - this._lensH) ? (sImgReg.height - this._lensH) : y;

                this._destU = (((x) / sImgReg.width) * zoomReg.width) >> 0;
                this._destV = (((y) / sImgReg.height) * zoomReg.height) >> 0;
                this._currU += (this._destU - this._currU) / this._opts.smoothMove;
                this._currV += (this._destV - this._currV) / this._opts.smoothMove;

                //此处要先移动zoomDiv的背景，然后再移动lens的背景，否则，在IE8下会出现卡的现象。
                this._zoomDiv.setStyle("backgroundPosition", ((-(this._currU >> 0) + "px ") + (-(this._currV >> 0) + "px")));
                this._lens.setStyles({ left: x, top: y, backgroundPosition: ((-x) + "px " + (-y) + "px") });
            }
            this._timer = setTimeout(function () {
                o._zooming();
            }, 30);
        },
        /**
        * @method _reset
        * @private
        * @description 重置组件，通常应用于initFor功能。
        * @chainable
        */
        _reset: function () {
            if (this._zoomDiv) {
                this._zoomDiv.remove();
                this._zoomDiv.destroy();
                this._zoomDiv.anim = null;
                this._zoomDiv = null;
            }
            if (this._ie6Fix) {
                this._ie6Fix.remove();
                this._ie6Fix.destroy();
                this._ie6Fix = null;
            }
            if (this._lens) {
                this._lens.remove();
                this._lens.destroy();
                this._lens.anim = null;
                this._lens = null;
            }
            if (this._mouseTrap) {
                this._mouseTrap.remove();
                this._mouseTrap.destroy();
                this._mouseTrap = null;
            }
            this._ready = false; //将就绪状态重置
            return this;
        },
        /**
        * @method _renderUI
        * @private
        * @description 创建组件所需要的UI元素，在一个init-destroy流程中只会执行一次。
        * @chainable
        */
        _renderUI: function () {
            this._loading.setStyle("display", "none"); //隐藏状态条
            var sImg = this._sImg;
            var opts = this._opts;
            var imgReg = sImg.get("region");
            var sImgOuterW = imgReg.width;
            var sImgOuterH = imgReg.height;
            this._mouseTrap = this._node.get("parentNode").appendChild(
                Y.Node.create(this.format("<div class='magnifier-mousetrap' style='background-color:#fff;filter:alpha(opacity=0);opacity:0; z-index:99;position:absolute;width:%0px;height:%1px;left:%2px;top:%3px;\'></div>", sImgOuterW, sImgOuterH, 0, 0))
                );
            var xPos = opts.adjustX,
                yPos = opts.adjustY;
            var siw = sImgOuterW;
            var sih = sImgOuterH;

            var w = opts.zoomWidth == "auto" ? siw : opts.zoomWidth;
            var h = opts.zoomHeight == "auto" ? sih : opts.zoomHeight;

            var appendTo = this._node.get("parentNode");
            switch (opts.position) {
                case "top":
                    yPos -= h;
                    break;
                case "bottom":
                    yPos += sih;
                    break;
                case "left":
                    xPos -= w;
                    break;
                case "right":
                    xPos += siw;
                    break;
                case "inside":
                    w = siw;
                    h = sih;
                    break;
                default:
                    appendTo = Y.one("#" + opts.position);
                    if (!appendTo) {
                        appendTo = this._node.get("parentNode");
                        xPos += siw;
                        yPos += sih;
                    }
                    else {
                        var pReg = appendTo.get("region");
                        w = pReg.width;
                        h = pReg.height;
                    }
            }
            this._zoomDiv = appendTo.appendChild(
                Y.Node.create(this.format('<div id="magnifier-zoom-big" class="magnifier-zoom-big" style="display:none;position:absolute;left:%0px;top:%1px;width:%2px;height:%3px; background-image:url(\'%4\');z-index:90;"></div>', xPos, yPos, w, h, this._zoomImg.get("src")))
            );
            //针对IE6及以下添加Object、select遮罩
            if (Y.UA.ie > 0 && Y.UA.ie < 7) {
                this._ie6Fix = Y.Node.create("<iframe frameborder='0' src='javascript:'></iframe>").setStyles({
                    position: "absolute",
                    left: xPos,
                    top: yPos,
                    zIndex: 99,
                    width: w,
                    height: h,
                    opacity: 0,
                    display: 'none',
                    background: 'transparent'
                });
                this._zoomDiv.get("parentNode").insertBefore(this._ie6Fix, this._zoomDiv);
            }

            this._lensW = (sImgOuterW / this._zoomImg.get("width")) * w;
            this._lensH = (sImgOuterH / this._zoomImg.get("height")) * h;

            this._lens = this._node.appendChild(
                Y.Node.create(this.format("<div class = 'magnifier-lens' style='display:none;z-index:98;position:absolute; width:%0px;height:%1px;'></div>", this._lensW, this._lensH))
                );
            this._mouseTrap.setStyle("cursor", this._lens.getStyle("cursor"));

            var noTrans = false;
            if (!noTrans) {
                this._lens.setStyle("opacity", opts.lensOpacity);
            }

            if (opts.title) {
                this._zoomDiv.appendChild(
                    Y.Node.create(this.format('<div class="magnifier-title">%0</div>', opts.title))
                    ).setStyle("opacity", opts.titleOpacity);
            }

            return this;
        },
        /**
        * @method _bindEvent
        * @private
        * @description 绑定组件需要的相关事件，一个init-desctroy流程只会执行一次。
        * @chainable
        */
        _bindEvent: function () {
            this._mouseTrap.on("mousemove", function (e) {
                e.halt();
                this._mx = e.pageX;
                this._my = e.pageY;
            }, this);
            this._mouseTrap.on("mouseleave", function (e) {
                if (this._ready) {
                    e.halt();
                    clearTimeout(this._timer);
                    if (this._lens) {
                        if (this._lens.anim) {
                            this._lens.anim.set("reverse", true).run();
                        }
                        else {
                            this._lens.setStyle("display", "none");
                        }
                    }
                    if (this._zoomDiv) {
                        if (this._zoomDiv.anim) {
                            this._zoomDiv.anim.set("reverse", true).run();
                        }
                        else {
                            this._zoomDiv.setStyle("display", "none");
                        }
                    }
                }
            }, this);
            this._mouseTrap.on("mouseenter", function (e) {
                if (this._ready) {
                    e.halt();
                    var o = this;
                    var sImg = this._sImg;
                    var opts = this._opts;
                    this._mx = e.pageX;
                    this._my = e.pageY;

                    if (this._zoomDiv) {
                        if (this._zoomDiv.anim) {
                            this._zoomDiv.anim.stop();
                        }
                        else {
                            this._zoomDiv.anim = new Y.Anim({
                                node: this._zoomDiv,
                                from: {
                                    opacity: 0
                                },
                                to: {
                                    opacity: 1
                                },
                                duration: 0.2
                            });
                            this._zoomDiv.anim.on("start", function (e) {
                                if (!this.get("reverse")) {
                                    o._zoomDiv.setStyle("opacity", 0);
                                    o._zoomDiv.setStyle("display", "");
                                    if (o._ie6Fix) {
                                        o._ie6Fix.setStyle("display", "block");
                                    }
                                }
                            }, this._zoomDiv.anim);
                            this._zoomDiv.anim.on("end", function (e) {
                                if (this.get("reverse")) {
                                    if (o._ie6Fix) {//当zoomDiv消失后，再将iframe的display设为none
                                        o._ie6Fix.setStyle("display", "none");
                                    }
                                    o._zoomDiv.setStyle("display", "none");
                                }
                            });
                        }
                        this._zoomDiv.anim.set("reverse", false);
                        this._zoomDiv.anim.run();
                    }

                    if (opts.position !== "inside" && this._lens) {
                        if (this._lens.anim) {
                            this._lens.anim.stop();
                        }
                        else {
                            this._lens.anim = new Y.Anim({
                                node: this._lens,
                                from: {
                                    opacity: 0
                                },
                                to: {
                                    opacity: this._opts.lensOpacity
                                },
                                duration: 0.2
                            });
                            this._lens.anim.set("reverse", false);
                            this._lens.anim.on("start", function (e) {
                                if (!this.get("reverse")) {
                                    o._lens.setStyle("opacity", 0);
                                    o._lens.setStyle("display", "block");
                                }
                            }, this._lens.anim);
                        }
                        this._lens.anim.set("reverse", false);
                        this._lens.anim.run();
                    }

                    this._zooming();
                    return;
                }
            }, this);
            return this;
        },
        /**
        * @method destroy
        * @public
        * @description 销毁组件
        * @chainable
        */
        destroy: function () {
            this._reset();

            this._node.destroy();
            this._node = null;
            this._loading.remove();
            this._loading = null;
            this._sImg.destroy();
            this._sImg = null;
            this._zoomImg.destroy();
            this._zoomImg = null;
            this._timer = null;
            this._delayInitForTimer = null;
            this._opts = null;

            return this;
        },
        /**
        * @method initFor
        * @public
        * @description 为指定的图片初始化放大镜组件
        * @param {string} sImgPath 缩略图片路径
        * @param {string} bImgPath 大图片路径
        * @param {hash} opts 提供的配置信息
        */
        initFor: function (sImgPath, bImgPath, opts) {
            var o = this;
            clearTimeout(this._delayInitForTimer);
            if (this._zoomDiv && this._zoomDiv.anim && this._zoomDiv.anim.get("running") || this._lens && this._lens.anim && this._lens.anim.get("running")) {
                this._delayInitForTimer = setTimeout(function () {
                    o.initFor(sImgPath, bImgPath, opts);
                }, 500);
                return;
            }
            if (!sImgPath || !bImgPath) {
                return; //小图片地址和大图片地址为必选参数
            }
            this._loading.setStyle("display", "block");
            this._parseParam(opts);
            //单独设定“小图片路径”和“大图片路径”
            this._opts.sImgPath = sImgPath;
            this._opts.bImgPath = bImgPath;
            //层层递进
            var img = new Y.Node(new Image());
            o._reset(); //重置可能已经存在的放大镜
            img.on("load", function (e) {
                o._zoomImg = new Y.Node(new Image());
                o._zoomImg.on("load", function (e) {
                    o._sImg.set("src", o._opts.sImgPath);
                    o._renderUI();
                    o._bindEvent();
                    o._ready = true; //都已准备就绪
                });
                o._zoomImg.set("src", o._opts.bImgPath);
            });
            img.set("src", this._opts.sImgPath);
        },
        /**
        * @method format
        * @public
        * @description 提供参数化的字符串拼接
        * @param {string} str 包含参数标识的字符串
        * @param {string} args 与参数标识对应的参数值
        */
        format: function (str, args) {
            for (var i = 1; i < arguments.length; i++) {
                str = str.replace('%' + (i - 1), arguments[i]);
            }
            return str;
        }
    }
});