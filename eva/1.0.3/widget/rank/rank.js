YUI.namespace('Y.Rank');
YUI.add('rank', function (Y) {
    Y.Rank = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.Rank, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.con = (typeof that.id == 'object') ? that.id : Y.one('#' + that.id);
            that.buildParam(config);
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
            that.openedClass = (typeof o.openedClass == 'undifined' || o.openedClass == null) ? 'selected' : o.openedClass;
            that.eventype = (typeof o.eventype == 'undifined' || o.eventype == null) ? 'mouseover' : o.eventype;
            that.item = that.con.all('.rank-item');
            return this;
        },

        //添加默认样式
        render: function () {
            var that = this;

            return this;
        },
        //注册事件
        bindEvent: function () {
            var that = this;
            that.item.each(function (node) {
                node.one('.rank-tit').on(that.eventype, function (e) {
                    var el = e.target;
                    var oItem = el.ancestor(function (node) { if (node.hasClass('rank-item')) return true; else false; });
                    if (oItem.hasClass(that.openedClass)) return;
                    that.item.removeClass(that.openedClass);
                    oItem.addClass(that.openedClass);
                });
            });
            return this;
        }

    }, 0, null, 4);

}, '', { requires: ['node'] });