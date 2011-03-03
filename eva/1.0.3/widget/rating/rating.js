YUI.namespace('Y.Rating');
YUI.add('rating', function (Y) {
    Y.Rating = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.Rating, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.con = Y.one('#' + that.id);
            that.buildParam(config);
            that.render();
            that.buildEventCenter();
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
            that.currentRatingClass = (typeof o.currentRatingClass == 'undifined' || o.currentRatingClass == null) ? 'current-rating' : o.currentRatingClass;
            that.getURL = (typeof o.getURL == 'undifined' || o.getURL == null) ? '' : o.getURL;
            that.defaultScore = (typeof o.defaultScore == 'undifined' || o.defaultScore == null) ? 3 : o.defaultScore;
            that.scoreParamName = (typeof o.scoreParamName == 'undifined' || o.scoreParamName == null) ? 'score' : o.scoreParamName;

            return this;
        },
        //事件中心
        buildEventCenter: function () {
            var that = this;
            var EventFactory = function () {
                this.publish("onRate");
            };
            Y.augment(EventFactory, Y.Event.Target);
            that.EventCenter = new EventFactory();
            return this;
        },
        //绑定函数
        on: function (type, foo) {
            var that = this;
            that.EventCenter.subscribe(type, foo);
            return this;
        },

        //添加默认样式
        render: function () {
            var that = this;
            that._a = that.con.all('li a');
            that._showRating = that.con.one('.' + that.currentRatingClass);
            that._showRating.setStyle('width', Number(that.defaultScore) / 5 * 100 + '%');
            return this;
        },
        //注册事件
        bindEvent: function () {
            var that = this;
            that._a.each(function (node, index) {
                node.on('click', function (e) {
                    e.halt();
                    var el = e.target, cfg;
                    var currentIndex = index + 1;
                    var percent = (currentIndex / that._a.size()) * 100 + '%';
                    that._showRating.setStyle('width', percent);
                    //异步提交评论星级
                    cfg = {
                        method: 'GET',
                        timeout: 3000,
                        on: {
                            failure: function () {
                                //alert('您的评论暂时无法提交')
                            },
                            complete: function (tid, o) {
                                try {
                                    eval("var re = " + o.responseText.replace(/<!--(.*?)-->/g, ''));
                                    if (!re.status) return;
                                    if (re.status == 0) {
                                        //alert(re.text);
                                        that.con.all('li').each(function (node, index) {
                                            if (index > 0) {
                                                node.remove();
                                            }
                                        });

                                    } else {
                                        //alert(re.text)	
                                    }
                                } catch (e) {

                                }
                            }
                        }
                    }
                    Y.io(that.getURL + '?' + that.scoreParamName + '=' + currentIndex, cfg);
                    //自定义事件
                    that.EventCenter.fire('onRate', {
                        index: currentIndex,
                        url: that.getURL,
                        paramName: that.scoreParamName
                    });
                    //
                });
            });

            return this;
        }


    }, 0, null, 4);

}, '', { requires: ['node', 'io'] });
