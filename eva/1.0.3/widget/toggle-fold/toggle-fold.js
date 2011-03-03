YUI.namespace('Y.toggleFold');
YUI.add('togglefold', function (Y) {
    Y.toggleFold = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.toggleFold, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.config = config;
            that.con = (typeof that.id == 'object') ? that.id : Y.one('#' + that.id);
            //渲染初始输入框
            that.render();
            //绑定事件
            that.bindEvent();
            return this;
        },
        buildParam: function (o) {
            var that = this;
            //基本参数
            var o = (typeof o == 'undefined' || o == null) ? {} : o;
            that.handleClass = (typeof o.handleClass == 'undifined' || o.handleClass == null) ? 'tf-hd' : o.handleClass;
            that.contentClass = (typeof o.contentClass == 'undifined' || o.contentClass == null) ? 'tf-bd' : o.contentClass;
            that.openedClass = (typeof o.openedClass == 'undifined' || o.openedClass == null) ? 'opened' : o.openedClass;
            that.markClass = (typeof o.markClass == 'undifined' || o.markClass == null) ? 'tf-mark' : o.markClass;
            that.markclosed = (typeof o.markclosed == 'undifined' || o.markclosed == null) ? '+' : o.markclosed;
            that.markopened = (typeof o.markopened == 'undifined' || o.markopened == null) ? '-' : o.markopened;
            return this;
        },
        //添加默认样式
        render: function (o) {
            var that = this;
            that.parseParam(o);
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
        },
        //注册事件
        bindEvent: function () {
            var that = this;
            that.con.each(function (node) {
                var _hd = node.one('.' + that.handleClass);
                var _bd = node.one('.' + that.contentClass);
                var _mark = node.one('.' + that.markClass);
                node.delegate('click', function (e) {
                    e.halt();
                    if (node.hasClass('opened')) {
                        node.removeClass('opened');
                        _mark.set('innerHTML', that.markclosed);
                    } else {
                        node.addClass('opened');
                        _mark.set('innerHTML', that.markopened);
                    }
                }, '.' + that.handleClass);

            })
            return this;
        }

    }, 0, null, 4);

}, '', { requires: ['node'] });
