YUI.namespace('Y.inputValue');
YUI.add('inputvalue', function (Y) {
    Y.inputValue = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.inputValue, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.config = config;
            that.con = (typeof that.id == 'object') ? that.id : Y.one('#' + that.id);
            //that.con = Y.one('#'+that.id);
            that.isShow = false;
            //渲染弹出框
            that.render();
            //构造弹出框
            that.buildTip();
            //绑定事件
            that.bindEvent();
            return this;
        },
        buildTip: function () {
            var that = this;
            if (that.oTip) return;
            if (typeof that.Tip == 'undifined' || that.Tip == null) {
                var tip = Y.Node.create('<div class="J-tip" style="visibility:hidden;position:absolute;z-index:1000;top:0"><div class="J-tipbox ' + that.oTipclass + '">' + that.content + '</div></div>');
                Y.one('body').appendChild(tip);
                that.oTip = tip;
            } else if (typeof that.Tip == 'object') {
                that.oTip = that.Tip;
            }
            //IE6以下隐藏干扰层
            if (/6/i.test(Y.UA.ie)) {
                that.mark = Y.Node.create('<iframe frameborder="0" src="javascript:false" style="background:transparent;position:absolute;border:none;top:0;left:0;padding:0;margin:0;z-index:-1;filter:alpha(opacity=0);"></iframe>');
                that.mark.setStyles({
                    'width': that.oTip.get('region').width,
                    'height': that.oTip.get('region').height
                });
                that.oTip.appendChild(that.mark);
            }
            return this;
        },
        buildParam: function (o) {
            var that = this;
            //基本参数
            var o = (typeof o == 'undefined' || o == null) ? {} : o;

            //鼠标事件类型
            that.eventype = (typeof o.eventype == 'undifined' || o.eventype == null) ? 'mouseover' : o.eventype;
            that.mouseout = (typeof o.mouseout == 'undifined' || o.mouseout == null) ? true : false;
            //设置Tip对齐方式
            that.pos = (typeof o.pos == 'undefined' || o.pos == null) ? {} : o;
            if (o.pos) {
                //如果为数值时即为自定义位置
                that.pos.hAlign = (typeof o.pos.h == 'undifined' || o.pos.h == null) ? 'left' : o.pos.h;
                that.pos.vAlign = (typeof o.pos.v == 'undifined' || o.pos.v == null) ? 'bottom' : o.pos.v;
            }
            that.oTipclass = (typeof o.classname == 'undifined' || o.classname == null) ? 'postip' : o.classname;

            that.content = o.content;
            that.Tip = o.otip;
            return this;
        },
        //渲染HTML生成或找到弹出框
        render: function (o) {
            var that = this;
            that.parseParam(o);
            //如果是点击事件鼠标变成手势
            if (that.eventype == 'click') {
                that.con.setStyle('cursor', 'pointer');
            }
            return this;
        },
        /**
        * 过滤参数列表
        */
        parseParam: function (o) {
            var that = this;
            if (typeof o == 'undefined' || o == null) {
                var o = {};
            }
            for (var i in o) {
                that.config[i] = o[i];
            }
            that.buildParam(that.config);
            return this;
        }
        //注册事件


    }, 0, null, 4);

}, '', { requires: ['node'] });
