/**
* simple collapse 控件
* S.Collapse
*
*	id:触点id
*
*  con_id:容器id,
*	fold_class:'fold',//折叠className
*	unfold_class:'unfold'//展开className
* 
*/


YUI.namespace('S.Collapse');
YUI.add('collapse', function (Y) {
    S.Collapse = function () {
        this.init.apply(this, arguments);
    };
    S.Collapse.prototype = {
        init: function (id, o) {
            var that = this;
            that.id = id;
            that.buildParam(o);
            that.bindEvent();
            that.buildEventCenter();
            return this;
            if (that.default_status == 'unfold') {
                //默认展开
                that.unfold();
            } else {
                //默认收起
                that.fold();
            }

        },
        buildParam: function (o) {
            var that = this;
            that.con_id = o.con_id;
            that.fold_class = o.fold_class;
            that.unfold_class = o.unfold_class;
            that.default_status = o.default_status;

            that.trigger = Y.one('#' + that.id);
            that.con = Y.one('#' + that.con_id);
            that.con_height = that.con.get('region').height;
            that.con.setStyle('overflow', 'hidden');
            return this;
        },
        bindEvent: function () {
            var that = this;
            that.trigger.on('click', function (e) {
                e.halt();
                that.toggle();
            });
        },
        //展开
        unfold: function () {
            var that = this;

            that.con.removeClass('hidden');
            var A = new Y.Anim({
                node: that.con,
                from: {
                    height: 0
                },
                to: {
                    height: that.con_height
                },
                easing: Y.Easing.easeOut,
                duration: 0.7
            });
            A.on('end', function () {
                that.trigger.replaceClass(that.fold_class, that.unfold_class);
                that.EventCenter.fire('unfold', that);
                delete A;
            });
            A.run();

            return this;
        },
        //收起
        fold: function () {
            var that = this;
            var A = new Y.Anim({
                node: that.con,
                from: {
                    height: that.con_height
                },
                to: {
                    height: 0
                },
                easing: Y.Easing.easeOut,
                duration: 0.7
            });
            A.on('end', function () {
                that.con.addClass('hidden');
                that.trigger.replaceClass(that.unfold_class, that.fold_class);
                that.EventCenter.fire('fold', that);
                delete A;
            });
            A.run();
            return this;
        },
        //处理点击
        toggle: function () {
            var that = this;
            if (that.con.hasClass('hidden')) {
                //展开
                that.unfold();
            } else {
                //收起
                that.fold();
            }
        },
        /**
        * 事件中心
        * fold：收起
        * unfold：展开
        */
        buildEventCenter: function () {
            var that = this;
            var EventFactory = function () {
                this.publish("fold");
                this.publish("unfold");
            };
            Y.augment(EventFactory, Y.Event.Target);
            that.EventCenter = new EventFactory();
            return this;
        },
        /**
        * 绑定函数 
        */
        on: function (type, foo) {
            var that = this;
            that.EventCenter.subscribe(type, foo);
            return this;
        }

    };
});
