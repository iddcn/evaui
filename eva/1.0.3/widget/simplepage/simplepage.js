/**
* simple pagination空间，包含list items和分页的页码，页码无逻辑
* Y.spage
* 		nodelist:yui3的nodelist
*		pageid:页码容器的id,页码为a，选中后添加classname 'selected'
*		step:每页的大小
*
* 
*/


YUI.namespace('S.Spage');
YUI.add('spage', function (Y) {
    S.Spage = function () {
        this.init.apply(this, arguments);
    };
    S.Spage.prototype = {
        init: function (nodelist, pageid, step) {
            var that = this;
            that.nodelist = nodelist;
            that.pageid = pageid;
            that.step = step;
            that.size = nodelist.size();
            that.pages = Math.ceil(that.size / step);
            that.index = 1;

            that.buildHTML();
            that.bindEvent();
            that.showPage(1);
            return this;

        },
        showPage: function (index) {
            var that = this;
            var as = Y.all('#' + that.pageid + ' a');
            as.removeClass('selected');

            as.item(Number(index) - 1).addClass('selected');

            var rear = (Number(index) - 1) * that.step + 1;
            var top = (rear + that.step - 1 > that.size) ? that.size : (rear + that.step - 1);
            that.nodelist.addClass('hidden');
            for (var i = rear; i <= top; i++) {
                that.nodelist.item(i - 1).removeClass('hidden');
            }

        },
        bindEvent: function () {
            var that = this;
            that.pagecon = Y.one('#' + that.pageid);
            that.pagecon.delegate('click', function (e) {
                e.halt();
                var pageNo = Number(e.target.get('innerHTML'));
                that.showPage(pageNo);
            }, 'a');
            return this;
        },

        buildHTML: function () {
            var that = this;
            that.pagecon = Y.one('#' + that.pageid);
            for (var i = 0; i < that.pages; i++) {
                that.pagecon.append(Y.Node.create('<a href="javascript:void(0);">' + Number(i + 1) + '</a>'));
            }

        }


    };
});
