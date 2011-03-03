/**
* tbrr.js | taobao评论组件
* autohr:jay.li@alibaba-inc.com
* @class T.tbwidget.tbrr
* @param { object } 配置项
* @return { object } 生成一个评论实例
* @requires { t-pagination,t-simpleditor,t-base,node,event } 
* 
* param:
*		{ object }:
*			commentListId	:评论列表的id
*			steplength		:每页显示评论个数
*			pageNo			:当前评论显示的页码
*			url				:取评论的url
*			id				:评论组件的id
*			pageDivId		:分页组件所在的id
*			addUrl			:增加评论的接口
*			delUrl			:删除评论接口
*			islogin			:当前用户是否登录，true和false
*			defaultxt		:编辑器默认文字
*			nologinHtml		:未登录时，编辑器位置显示的html str
*			showReviewCount	:回显评论个数的容器id
*			skin			:skin的url
*			
* property:
*		static:
*		public:
*			theCommentList:评论列表对象
*			theCommentList.render:渲染评论
* interfaces:
*		init:初始化
*		
*/
YUI.namespace('T.tbwidget.tbrr');
YUI.add('tbrr', function (Y) {
    T.tbwidget.tbrr = function () {
        var that = this;
        var args = arguments;
        var skin = (typeof arguments[0].skin == 'undefined') ? '' : arguments[0].skin;
        YUI({
            modules: {
                'tbrr-skin': {
                    fullpath: skin,
                    type: 'css'
                }
            }
        }).use('tbrr-skin', function (Y) {
            that.init.apply(that, args);
        });
    };
    T.tbwidget.tbrr.prototype = {
        commentList: function (cfg) {
            var steplength = this.steplength = cfg.steplength;
            var pageNo = this.pageNo = cfg.pageNo;
            var url = this.url = cfg.url;
            var commentListId = this.commentListId = cfg.commentListId;
            var pageDivId = this.pageDivId = cfg.pageDivId;
            var delUrl = this.delUrl = cfg.delUrl;
            var showReviewCount = this.showReviewCount = cfg.showReviewCount;
            var onDelSuccess = this.onDelSuccess = cfg.onDelSuccess;
            var that = this;
            this.loadingHtml = ['<div class="t-commentlist-loading">loading评论数据</div>'].join("");
            this.commentItemHtml = ['<div class="t-comment-item">', '<dl>', '<dt><span class="t-ci-img blue" rel="{$user_id}">{$user_name}</span><em class="time">{$review_time}</em>{$del_str}</dt>', '<dd>{$content}</dd>', '</dl>', '</div><!-- /item -->'].join('');
            this.showComments = function (o, login_user) {
                if (typeof o != 'object') {
                    var con = Y.Node.get('#' + this.commentListId);
                    con.set('innerHTML', this.loadingHtml);
                }
                //非第一页只有一个评论的时候的删除成功后回到评论首页
                if (typeof o != 'undefined' && /*T.base.getLength(o)*/o.length == 1 && this.pageNo > 1) {
                    var del_ctl = 'ok'; //若为ok，删除此链接回到第一页
                } else {
                    var del_ctl = ''; //否则留在当页
                }
                var a = [];
                //for (var i = 0;i<o.length;i++) {
                for (var i in o) {
                    if (typeof o[i] == 'function') continue;
                    if (o[i].user_id == login_user || login_user.toString() == '345708290') {
                        var str_in = '<span class="t-ci-reply"><a href="javascript:void(0);" class="J-ci-del" rev="' + del_ctl + '" rel="' + o[i].rr_id + '">删除</a>';
                    } else {
                        var str_in = '';
                    }
                    try {
                        var con_str = decodeURIComponent(o[i].content); //正确解码
                    } catch (e) {//非正确解码
                        var con_str = o[i].content;
                    }
                    con_str = T.base.wbtrim(con_str);
                    a.push({
                        rr_id: o[i].rr_id,
                        user_id: o[i].user_id,
                        user_name: o[i].user_name,
                        review_time: o[i].review_time,
                        content: con_str, //.replace(/\[face(\d+)\]/ig, '<img src="http://a.tbcdn.cn/sys/wangwang/smiley/24x24/$1.png" border=0 />'),
                        del_str: str_in
                    });
                }
                var html = T.base.templetShow(this.commentItemHtml, a);
                var con = Y.Node.get('#' + this.commentListId);
                con.set('innerHTML', html);
                con.queryAll('a.J-ci-del').on('click', function (e) {
                    e.halt();
                    var rr_id = e.target.getAttribute('rel');
                    var rr_ctl = e.target.getAttribute('rev');
                    if (window.confirm("确定要删除这条评论吗?")) {
                        T.base.io('GET', that.delUrl + '&rr_id=' + rr_id, function (o) {
                            var p = (rr_ctl == 'ok') ? '1' : that.pageNo;
                            Y.log('pageNo:' + p);
                            that.onDelSuccess(p);
                        });
                    }
                });
            };
            /**
            * @method render 渲染
            * @memberof commentList
            * @param { object }
            * 		steplength	: number 每页多少条数据
            *		pageNo		: number 显示第几页
            *		url			: string 接口
            * ...		
            */
            this.render = function (cfg) {
                var that = this;
                if (typeof cfg != 'undefined') {
                    if (typeof cfg.steplength != 'undefined') this.steplength = cfg.steplength;
                    if (typeof cfg.pageNo != 'undefined') this.pageNo = cfg.pageNo;
                    if (typeof cfg.url != 'undefined') this.url = cfg.url;
                    if (typeof cfg.commentListId != 'undefined') this.commentListId = cfg.commentListId;
                    if (typeof cfg.pageDivId != 'undefined') this.pageDivId = cfg.pageDivId;
                    if (typeof cfg.delUrl != 'undefined') this.delUrl = cfg.delUrl;
                    if (typeof cfg.showReviewCount != 'undefined') this.showReviewCount = cfg.showReviewCount;
                }
                var offset = (Number(this.pageNo) - 1) * Number(this.steplength);
                if (offset < 0) offset = 0;
                T.base.io('GET', url + '&limit=' + this.steplength + '&offset=' + offset.toString() + '&tt=' + Math.random(), function (o) {
                    Y.one('#' + that.showReviewCount).set('innerHTML', Number(o.review_count));
                    if (o.review.length == 0) {
                        Y.Node.get('#' + that.commentListId).set('innerHTML', '暂无评论数据');
                        return;
                    }
                    that.showComments(o.review, o.login_user);
                    var rc = Number(o.review_count) == 0 ? 1 : Number(o.review_count);
                    if (rc % that.steplength == 0) var max = rc / that.steplength;
                    var max = (rc % that.steplength == 0) ? (rc / that.steplength) : Math.floor(rc / that.steplength + 1);
                    if (that.thePagination == null) {
                        that.thePagination = new T.tbwidget.pagination(Y.one('#' + pageDivId), {
                            index: pageNo,
                            max: max,
                            page: function (n) {
                                that.render({ pageNo: n });
                            }
                        });
                    } else {
                        that.thePagination.setpos(that.pageNo);
                        that.thePagination.setmax(max);
                    }
                });
                return this;
            };
        },
        /**
        * @method init 初始化评论组件
        */
        init: function (cfg) {
            var cfg = cfg || {};
            var commentListId = this.commentListId = typeof cfg.commentListId == 'undefined' ? 'J-comment-list' : cfg.commentListId;
            var steplength = this.steplength = typeof cfg.steplength == 'undefined' ? 5 : cfg.steplength;
            var pageNo = this.pageNo = typeof cfg.pageNo == 'undefined' ? 1 : cfg.pageNo;
            var url = this.url = typeof cfg.url == 'undefined' ? '/cnrr/test' : cfg.url;
            var id = this.id = typeof cfg.id == 'undefined' ? '' : cfg.id;
            var pageDivId = this.pageDivId = typeof cfg.pageDivId == 'undefined' ? '' : cfg.pageDivId;
            var delUrl = this.delUrl = typeof cfg.delUrl == 'undefined' ? '' : cfg.delUrl;
            var vCodeUrl = this.vCodeUrl = typeof cfg.vCodeUrl == 'undefined' ? null : cfg.vCodeUrl;
            var addUrl = this.addUrl = typeof cfg.addUrl == 'undefined' ? '' : cfg.addUrl;
            var islogin = this.islogin = typeof cfg.islogin == 'undefined' ? '' : cfg.islogin;
            var defaultxt = this.defaultxt = typeof cfg.defaultxt == 'undefined' ? '' : cfg.defaultxt;
            var nologinHtml = this.nologinHtml = typeof cfg.nologinHtml == 'undefined' ? '' : cfg.nologinHtml;
            var showReviewCount = this.showReviewCount = typeof cfg.showReviewCount == 'undefined' ? 'J-review-count' : cfg.showReviewCount;
            that = this;
            this.theCommentList = new this.commentList({
                commentListId: commentListId,
                steplength: steplength,
                pageNo: pageNo,
                url: url,
                pageDivId: pageDivId,
                delUrl: delUrl,
                thePagination: null,
                showReviewCount: showReviewCount,
                onDelSuccess: function (pageNo) {
                    this.render({ pageNo: pageNo });
                }
            }).render();
            this.theditor = new T.tbwidget.simpleditor({
                id: 'J-theditor',
                addUrl: addUrl,
                islogin: islogin,
                vCodeUrl: vCodeUrl,
                defaultxt: defaultxt,
                nologinHtml: nologinHtml,
                onsubmit: function (postString) {
                    that.theCommentList.render({ pageNo: 1 });
                    try {
                        that.theCommentList.thePagination.setpos(1);
                    } catch (e) { }
                }
            });
        },
        theditor: null
    };
},
'', {
    requires: ['dump']
});
