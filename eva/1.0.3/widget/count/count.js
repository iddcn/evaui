YUI.namespace('Y.count');
YUI.add('count', function (Y) {
    Y.count = function (con, conf) {
        if (typeof con == "undefined") return; //id是否存在
        var DOM = (typeof con == 'object') ? con : Y.one('#' + con);

        //定义时间容器寄存
        var timeDOM = null;
        //秒分时
        var _time = {};

        var fd = this,
			config = conf || {},
			_class = (typeof config.classname == 'undefined' || config.classname == null) ? '' : 'class="' + config.classname + '"',
			_start = (typeof config.start == 'undefined' || config.start == null) ? new Date() : config.start,
			_end = config.end,
			_count = (typeof config.count == 'undefined' || config.count == null) ? 1 : config.count;
        if (config.end == null) return;

        //避免创建重复节点 **zuo changes**
        if (Y.one("#counter") != null) {
            return;
        }

        //创建倒计时DOM
        timeDOM = Y.Node.create('\
		<ul id="counter" ' + _class + '>\
			<li><span class="hour"><img src="http://yrs.yintai.com/img/little-loading.gif" alt=""/></span>\u5C0F\u65F6</li>\
			<li><span class="minute"><img src="http://yrs.yintai.com/img/little-loading.gif" alt=""/></span>\u5206\u949F</li>\
			<li><span class="second"><img src="http://yrs.yintai.com/img/little-loading.gif" alt=""/></span>\u79D2</li>\
		</ul>');
        DOM.append(timeDOM);

        _time.S = timeDOM.one('.second');
        _time.M = timeDOM.one('.minute');
        _time.H = timeDOM.one('.hour');

        _end = new Date(_end);
        _start = new Date(_start);
        //剩余时间
        var _leftTime = Math.floor((_end.getTime() - _start.getTime() - ((new Date()).getTime() - _start.getTime())) / 1000 - 1);

        var renderTime = function () {
            _time.S.set('innerHTML', Math.floor(_leftTime % 60));
            _time.M.set('innerHTML', Math.floor((_leftTime % 3600) / 60));
            _time.H.set('innerHTML', Math.floor(_leftTime / 3600));
            _leftTime -= _count;
            setTimeout(renderTime, _count * 1000);
        };
        setTimeout(renderTime, _count * 1000);
    }
}, '', { requires: ['node'] });	