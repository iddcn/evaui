YUI.namespace('Y.Editable');
YUI.add('editable', function (Y) {
    Y.Editable = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.Editable, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.config = config;
            that.con = Y.one('#' + that.id);
            render();
            bindEvent();
            return this;
        },
        render: function () {
            var that = this;
            Y.log('123');
            return this;
        },
        bindEvent: function () {
            var that = this;
            return this;
        }

    }, 0, null, 4);

}, '', { requires: ['node'] });
