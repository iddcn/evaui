YUI.namespace('Y.Nav');
YUI.add('nav', function (Y) {
    Y.Nav = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.Nav, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.con = Y.one('#' + that.id);
            that.buildParam(config);
            that.buildEventCenter(); //zuoxianjin add
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
            that.subClass = (typeof o.subClass == 'undifined' || o.subClass == null) ? 'eva-submenu' : o.subClass;
            that.DTs = that.con.all('dt');
            that.DDs = that.con.all('dd');

            that.layerLeft = that.con.get('region').left;
            that.layerTop = that.con.get('region').height + that.con.get('region').top;

            that.subMenuHidden = true;
            return this;
        },

        //添加默认样式
        render: function () {
            var that = this;
            //>IE7 hack
            that.ieleft = 0, that.ietop = 0;
            //            if (/7/i.test(Y.UA.ie)) {
            //                that.ieleft = 2;
            //                that.ietop = 2;
            //            }
            if (/6/i.test(Y.UA.ie)) {
                that.ieleft = -2;
                that.ietop = -2;
            }
            that.DDs.setStyles({
                'top': that.layerTop + that.ietop + 'px',
                'left': that.layerLeft + that.ieleft + 'px',
                'visibility': 'hidden',
                'zoom': '1'
            });
            if (/6/i.test(Y.UA.ie)) {
                that.DDs.each(function (node) {
                    that.mark = Y.Node.create('<iframe frameborder="0" src="javascript:false" style="background:transparent;position:absolute;border:none;top:0;left:0;padding:0;margin:0;z-index:-1;filter:alpha(opacity=0);"></iframe>');
                    that.mark.setStyles({
                        'width': node.get('region').width + 'px',
                        'height': node.get('region').height + 'px'
                    });
                    node.appendChild(that.mark);
                });
            }

            return this;
        },
        //显示子菜单
        showSubMenu: function (index) {
            var that = this;
            that.EventCenter.fire("unfold", index);
            var _subMenuHeight;
            var subMenu = that.DDs.item(index);
            if (Y.Lang.isUndefined(index) || Y.Lang.isNull(subMenu.one('.expand-layer'))) return;
            _subMenuHeight = subMenu.one('.expand-layer').get('region').height;

            subMenu.setStyles({
                'visibility': 'visible',
                'height': '0px'
            });
            that.anim = new Y.Anim({
                node: subMenu,
                to: {
                    height: _subMenuHeight + 'px'
                },
                duration: 0.5,
                easing: Y.Easing.easeIn

            });
            /* zuoxianjin change 20101021
             * “selected”的样式及selectedIndex应该是即时修改，而不应该放到动画结束后         
            */
            that.DTs.removeClass('selected');
            that.DTs.item(index).addClass('selected');
            that.selectedIndex = index;
            //            that.anim.on('end', function () {
            //                
            //            });
            that.anim.run();

           

            return this;
        },
        //隐藏子菜单
        hideSubMenu: function (index) {
            var that = this;
            that.EventCenter.fire("fold", index); //zuoxianjin add
            var _subMenuHeight;
            if (Y.Lang.isUndefined(index)) return;
            that.DTs.item(index).removeClass('selected');
            var subMenu = that.DDs.item(index);
            _subMenuHeight = subMenu.one('.expand-layer').get('region').height;
            that.anims = new Y.Anim({
                node: subMenu,
                to: {
                    height: 0
                },
                duration: 0.17,
                easing: Y.Easing.easeBoth

            });
            that.anims.on('end', function () {
                subMenu.setStyles({
                    'visibility': 'hidden',
                    'height': _subMenuHeight + 'px'
                });
            });

            that.anims.run();

            return this;
        },
        /**
        * 自定义事件绑定接口
        * zuoxianjin add at 201021
        */
        on: function (type, fn) {
            this.EventCenter.subscribe(type, fn);
        },
        /**
        * 自定义事件处理中心
        * zuoxianjin add at 201021
        */
        buildEventCenter: function () {
            var self = this;
            var EventCenter = function () {
                this.publish("unfold");
                this.publish("fold");
            }
            Y.augment(EventCenter, Y.Event.Target);
            self.EventCenter = new EventCenter();
            return self;
        },
        //注册事件
        bindEvent: function () {
            var that = this;
            var timer = null;
            that.DTs.each(function (node, index) {
                var _dd = node.next();
                node.one('a').on('click', function (e) {
                    if (!node.hasClass('allbrand')) e.halt();

                    if (node.hasClass('noactive')) return;
                    that.DTs.each(function (dt, _index) {
                        if (dt.hasClass('selected')) {
                            that.selectedIndex = _index;
                        }
                    });
                    if (node.hasClass('selected')) {
                        that.hideSubMenu(index);
                    } else {
                        if (that.selectedIndex == index) {
                            that.showSubMenu(index);
                        } else {
                            that.hideSubMenu(that.selectedIndex);
                            that.showSubMenu(index);
                        }
                    }
                });
            });

            //窗口改变
            Y.on('resize', function () {
                that.con.all('dd').setStyles({
                    'left': that.con.get('region').left + that.ieleft + 'px'
                })
            }, window);
            return this;
        }

    }, 0, null, 4);

}, '', { requires: ['node', 'anim'] });