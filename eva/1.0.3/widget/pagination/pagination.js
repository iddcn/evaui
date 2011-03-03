/**
* t-pagination.js | taobao分页组件
* autohr:bachi@taobao.com
* @class T.tbwidget.pagination
* @module t-pagination
* @param { object } 配置项
* @return { object } 生成一个分页实例
* @requires { css/reset.css & css/grid.css & css/font.css & global.css } 样式依赖
* 
* property:
*		static:
*		public:
* interfaces:
*		init:初始化
* example
*	var p = new T.tbwidget.pagination(Y.one('#kao_page'), {index:1, max:200, page:function(n) {alert(n);}});
*		
*/

YUI.namespace('T.tbwidget.pagination');
YUI.add('t-pagination', function (Y) {
    T.tbwidget.pagination = function () {
        this.init.apply(this, arguments);
    };
    T.tbwidget.pagination.prototype = {
        STEP: 7,

        init: function (node, o) {
            var that = this;
            that.node = node;
            that.buildParam(o);
            that.render();
            return this;
        },
        buildParam: function (o) {
            var that = this;
            if (typeof o == 'undefined' || o == null) {
                var o = {};
            }
            that.index = (typeof o.index == 'undefined' || o.index == null) ? 1 : Number(o.index);
            that.max = (typeof o.max == 'undefined' || o.max == null) ? 0 : Number(o.max);
            that.page = (typeof o.page == 'undefined' || o.page == null) ? new Function : o.page;
            that.showArrow = (typeof o.showArrow == 'undefined' || o.showArrow == null) ? true : o.showArrow;
            that.STEP = (typeof o.step == 'undefined' || o.step == null) ? that.STEP : o.step;
            return this;
        },
        parseParam: function (o) {
            var that = this;
            if (typeof o == 'undefined' || o == null) {
                var o = {};
            }
            for (var i in o) {
                that[i] = o[i];
            }
            return this;
        },
        render: function (o) {
            var that = this;
            that.parseParam(o);
            if (that.max == 0) {
                node.set('innerHTML', '');
                return this;
            }
            var _step = that.STEP;
            if (that.max < that.STEP) _step = that.max;
            if (that.index > that.max) that.index = that.max;
            var a = [];
            var h = Math.floor(_step / 2);
            var str = []; //要显示的串
            var _t = ''; //前驱
            var t_ = ''; //后继
            if (that.index > h && that.index < (that.max - h)) {//中部
                var k = that.index - h;
                for (var i = k; i < (k + _step); i++) {
                    a.push(i)
                }
                if (that.index - h > 1) {
                    _t = '...';
                }
                if ((that.index + h) < that.max) {
                    t_ = '...';
                }
                /*
                for(var j = 0;j<a.length;j++){
                str.push('<a href="javascript:void(0);">'+a[j]+'</a>');
                }
                */
            } else if (that.index <= h) {//头部
                for (var i = 1; i <= _step; i++) {
                    a.push(i);
                }
                if (that.max > _step) {
                    t_ = '...';
                }
            } else {//尾部
                for (var i = ((that.max - _step) + 1); i <= that.max; i++) {
                    if (i > 0) a.push(i);
                }
                if (that.max > _step) {
                    _t = '...';
                }
            }
            if (that.showArrow) {
                var display = '';
            } else {
                var display = 'none';
            }
            that.node.set('innerHTML', '');
            that.node.set('innerHTML', [
				'<span class="t-p-ctrl">',
					'<a href="javascript:void(0);" style="display:' + display + '" class="J_first">&lt;&lt;</a> <a href="javascript:void(0);" class="J_previous">&lt;</a>',
				'</span>',
				'<span class="t-p-frame" style="width:auto;"><span class="t-p-framebelt" style="width:auto;">',
				'<span style="padding:0px;">' + _t + '</span>',
				that.genbeltstring(a),
				'<span style="padding:0px;">' + t_ + '</span>',
				'</span></span>',
				'<span class="t-p-ctrl">',
					'<a href="javascript:void(0);" class="J_next">&gt;</a> <a href="javascript:void(0);" style="display:' + display + '" class="J_last">&gt;&gt;</a>',
				'</span>'].join(''));
            that.addEvent();

        },
        genbeltstring: function (a) {
            var that = this;
            var str = '';
            var currp = '';
            for (var i = 0; i < a.length; i++) {
                if (that.index == a[i]) currp = ' class="current"';
                else currp = '';
                str += ('<a href="javascript:void(0);" ' + currp + '>' + a[i] + '</a>');
            }
            return str;
        },
        setpos: function (i) {
            var that = this;
            that.render({ index: i });
            return this;
        },
        setmax: function (max) {
            var that = this;
            that.render({ max: max });
            return this;
        },
        addEvent: function () {
            var that = this;
            if (typeof that.EV != 'undefined') {
                that.EV.detach();
            }
            that.EV = that.node.on('click', function (e) {
                if (e.target.get('tagName') != 'A') return;
                e.halt();
                e.target.blur();
                var _cur = Number(e.target.get('innerHTML'));
                var _max = that.max;
                var _setpos = that.setpos;
                if (e.target.hasClass('J_first')) {
                    if (that.index != 1) {
                        that.page(1);
                        that.render({ index: 1 });
                    }
                }
                else if (e.target.hasClass('J_previous')) {
                    if (that.index > 1) {
                        that.page(that.index - 1);
                        that.render({ index: that.index - 1 });
                    }
                }
                else if (e.target.hasClass('J_next')) {
                    if (that.index < that.max) {
                        that.page(that.index + 1);
                        that.render({ index: that.index + 1 });
                    }
                }
                else if (e.target.hasClass('J_last')) {
                    if (that.index != that.max) {
                        that.page(that.max);
                        that.render({ index: that.max });
                    }
                } else {
                    that.page(_cur);
                    that.render({ index: _cur });
                }
            });
        }
    };
    //var p = new PAGINATION(Y.one('#kao_page'), {index:1, max:200, page:function(n) {alert(n);}});
    //var p = new PAGINATION(Y.one('#kao_page'), {auto:false,index:1, max:200, page:function(n) {alert(n);}});
}, '', { requires: ['dump', 'node', 'anim'] });

