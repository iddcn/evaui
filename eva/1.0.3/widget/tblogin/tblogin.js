var Y = YAHOO;
YUI.namespace("T.tbwidget.tblogin");

 T.tbwidget.tblogin= function(el, url, fn, override, argvs) {
	var _D = Y.util.Dom,
		_E = Y.util.Event,
		_pos;
	if(typeof el == 'undefined' || !(_pos = _D.getXY(el)) || typeof url == 'undefined') {
		return;
	}
	var _url = encodeURIComponent(url);
	var _closeID = _D.generateId();
	var _iframeID = _D.generateId();
	var logindiv = document.createElement('div');
	logindiv.className = 'tblogin';
	logindiv.style.left = _pos[0] - 2 +'px';
	logindiv.style.top = _pos[1] - 2 + 'px';
	logindiv.style.zIndex = '99999';
	logindiv.innerHTML = [
		'<a id="'+_closeID+'" class="close" href="javascript:void(0);"></a>',
		'<iframe style="z-index:100" id="'+_iframeID+'" width="100%" height="100%" scrolling="no" frameborder="0" src="http://member1.taobao.com/member/login.jhtml?style=simple&redirect_url='+_url+'"></iframe>'].join('');
	document.body.appendChild(logindiv);
	_E.addListener(_closeID, 'click', function(e) {
			_removeBox();
			});
	_E.addListener(_iframeID, 'load', function(e) {
			var el = _E.getTarget(e);
			try{
			if(el.contentWindow.success) {
			_removeBox();
			if(typeof fn != 'undefined') {
			fn.call(override, argvs);
			}
			}
			}
			catch (e) {
			}
			});
	var _removeBox = function() {
		_E.removeListener(_closeID);
		_E.removeListener(_iframeID);
		document.body.removeChild(logindiv);
	};
	this.removeBox = _removeBox;
};


