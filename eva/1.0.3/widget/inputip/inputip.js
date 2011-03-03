YUI.namespace('Y.inputTip');
YUI.add('inputip', function (Y) {
    Y.inputTip = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.inputTip, {
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
            that.defaultclass = (typeof o.defaultclass == 'undifined' || o.defaultclass == null) ? 'eva-inputip' : o.defaultclass;
            //是否选中
            that.autoSelected = (typeof o.autoSelected == 'undifined' || o.autoSelected == null) ? false : true;

            return this;
        },
        //添加默认样式
        render: function (o) {
            var that = this;
            that.parseParam(o);
            that.con.addClass(that.defaultclass);
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
                var _val = '';
                _val = node.get('value');
                node.on('focus', function (e) {
                    var el = e.target,
						__val = el.get('value');
                    if (__val == _val || __val == '') {
                        el.set('value', '');
                        //						el.addClass('eva-inputip-focus');
                    } else {
                        if (that.autoSelected == true) el.select();
                    }
                });
                node.on('blur', function (e) {
                    var el = e.target,
						__val = el.get('value');
                    if (__val == _val || __val == '') {
                        el.set('value', _val);
                        //						el.removeClass('eva-inputip-focus');
                    }

                });
            })
            return this;
        }

    }, 0, null, 4);

}, '', { requires: ['node'] });
