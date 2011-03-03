YUI.namespace('Y.goTop');
YUI.add('gotop', function (Y) {
    Y.goTop = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.goTop, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.config = config;
            that.buildParam();
            that.render();
            //绑定事件
            that.bindEvent();
            return this;
        },
        buildParam: function (o) {
            var that = this;
            //基本参数
            var o = (typeof o == 'undefined' || o == null) ? {} : o;
            //鼠标事件类型
            that.classname = (typeof o.classname == 'undifined' || o.classname == null) ? 'b-top' : o.classname;
            that.pagewidth = (typeof o.pagewidth == 'undifined' || o.pagewidth == null) ? '980' : o.pagewidth;
            that.padding = (typeof o.padding == 'undifined' || o.padding == null) ? '10' : o.padding;
            that.isHidden = true;
            that.doc = Y.one('body');
            return this;
        },

        //添加默认样式
        render: function () {
            var that = this;
            that.divBar = Y.Node.create('<div id="' + that.id + '" class="' + that.classname + '"><a  title="\u56DE\u9876\u90E8" href="#">\u56DE\u9876\u90E8</a></div>');
            that.doc.appendChild(that.divBar);
            that.divBar.setStyles({
                'display': 'none',
                'opacity': '0'
            });
            if (Y.UA.ie == 6) {
                that.divBar.setStyles({
                    'position': 'absolute'
                });
            }
            return this;
        },
        //隐藏
        hidden: function () {
            var that = this;
            that.divBar.setStyles({
                'display': 'block',
                'opacity': '1'
            });
            that.animh = new Y.Anim({
                node: that.divBar,
                to: {
                    opacity: 0
                },
                duration: 0.5
            });
            that.animh.on('end', function () {
                that.divBar.setStyle('display', 'none');
            });
            if (that.isHidden == true) {
                that.animh.run();
            }
            return this;
        },

        //显示
        show: function () {
            var that = this;
            that.divBar.setStyles({
                'display': 'block',
                'opacity': '0'
            });
            that.anims = new Y.Anim({
                node: that.divBar,
                to: {
                    opacity: 1
                },
                duration: 1
            });
            that.anims.run();
            return this;
        },
        setPos: function () {
            var that = this;
            //获得浏览器页面等参数
            //Y
            that.viewHeight = that.doc.get('viewportRegion').height;
            that.docHeight = that.doc.get('region').height;

            //X
            that.viewWidth = that.doc.get('viewportRegion').width;
            that.docWidth = that.doc.get('region').width;
            var docScrollY = that.doc.get('docScrollY');
            var yPos = that.viewHeight - Math.floor(0.15 * that.viewHeight) + docScrollY;
            var xPos = Math.floor((that.viewWidth - that.pagewidth) / 2) + Number(that.pagewidth) + Number(that.padding);
            //console.log(yPos+'---'+that.viewHeight+'---'+docScrollY);

            //定位divBar位置
            that.divBar.setStyles({
                'left': xPos + 'px'
            });
            //IE6
            if (Y.UA.ie == 6) {
                that.divBar.setStyles({
                    'top': yPos + 'px'
                });
            }
            return this;
        },

        //注册事件
        bindEvent: function () {
            var that = this;
            //滚动条滚动
            Y.on('scroll', function () {
                that.setPos();
                var docScrollY = that.doc.get('docScrollY');
                if (docScrollY == 0) {
                    that.isHidden = true;
                    that.hidden();
                } else {
                    that.isHidden = false;
                    that.show();
                }
            }, window);
            //窗口改变时
            Y.on('resize', function () {
                that.setPos();
            }, window);
            //返回顶部
            that.divBar.get('children').on('click', function (e) {
                e.halt();
                var el = e.target;
                that.doc.scrollIntoView(true);
            });
            return this;
        }
    }, 0, null, 4);

}, '', { requires: ['node', 'anim'] });
