/**
* simpleditor.js | taobao简单文本编辑器,带按钮
* autohr:bachi@taobao.com
* @class T.tbwidget.simpleditor
* @param { object } 配置项
* @return { object } 生成一个编辑器实例
* @requires { 'node','event','t-base','json' }
* @requires { t-simpleditor-skin } 表情样式
* @requires { css/comment.css }//评论组件中包含编辑器的样式，没有提取出来
* 
* param:
* 		{ object }:
*			id			:编辑器所在的容器id	
*			smtemplet	:插入表情的格式,{$n}会被替换为表情图片的编号,默认是[face{$n}]
*			defaultxt	:编辑器默认文字，默认为’请输入您要发表的内容'
*			maxlength	:编辑器最大输入长度，默认为500
*			addUrl		:添加评论接口
*			islogin		:当前用户是否登录
*			nologinHtml	:未登录时显示的html str
*			onsubmit	:提交成功后的回调
*			
* property:
*		static:
*		public:
*			html:编辑器box容器html
* interfaces:
*		init:初始化
*		calculateTxt:计算字数并显示
*		showAlertTip:显示提示
*		setCursor:定位光标，非ie浏览器用
*		getCaret:得到选中数据，非ie浏览器用
*		addSmileCode:插入表情
*		getSmileHTML:生成表情html
*		
*/
YUI.namespace('T.tbwidget.simpleditor');
YUI.add('t-simpleditor', function (Y) {
    T.tbwidget.simpleditor = function () {
        this.init.apply(this, arguments);
    };


    //extend prototype
    Y.mix(T.tbwidget.simpleditor, {
        html: ['<div class="t-comment-box">',
					'<div class="t-comment-input">',
						'<div class="t-ci-hd pr">',
							'<div class="t-ci-cp"><span class="J-facebutton t-ci-img t-ci-face" title="表情"></span><!--span class="t-ci-img t-ci-face hover"></span--></div>',
							'<div class="t-face-con hidden"></div>',
							'<span class="t-txtlength">0/500</span>',
						'</div>',
						'<div class="t-ci-bd">',
							'<textarea class="t-txtel" name="" rows="" cols="">{$defaultxt}</textarea>',
						'</div>',
					'</div>',
					'<div id="J-alertip" class="t-alert-tip"></div>',
					'<div class="{$vCodeHidden}" style="display:none;">',
					'<p style="margin-top:8px;">验证码：<input type="text" class="t-code" value=""></input><span class="hidden vc-body">&nbsp;<img style="border:1px solid #ddd;margin:0px 8px -4px 8px;" src="{$vCodeUrl}" class="t-vcode"><a href="#" class="t-refresh-vcode">看不清楚,换一张</a></span></p></div>',
					'<div class="t-comment-btn" style="/**zoom:1;*display:block;*position:relative;*left:100px;*/">',
						'<button type="submit" class="t-ci-img submit"></button>',
						'<button type="button" class="t-ci-img reset"></button>',
					'</div>',
				'</div>'
			].join(""),

        //初始化时构造参数列表
        buildParam: function (cfg) {
            var that = this;
            var id = that.id = cfg.id;
            var smtemplet = that.smtemplet = (typeof cfg.smtemplet == 'undefined') ? '[face{$n}]' : cfg.smtemplet;
            var defaultxt = that.defaultxt = (typeof cfg.defaultxt == 'undefined') ? '请输入您要发表的内容' : cfg.defaultxt;
            var maxlength = that.maxlength = (typeof cfg.maxlength == 'undefined') ? 500 : cfg.maxlength;
            var addUrl = that.addUrl = (typeof cfg.addUrl == 'undefined') ? '' : cfg.addUrl;
            var islogin = that.islogin = (typeof cfg.islogin == 'undefined') ? '' : cfg.islogin;
            var nologinHtml = that.nologinHtml = (typeof cfg.nologinHtml == 'undefined') ? '' : cfg.nologinHtml;
            var onsubmit = that.onsubmit = (typeof cfg.onsubmit == 'undefined') ? new Function : cfg.onsubmit;
            var focus = that.focus = (typeof cfg.focus == 'undefined') ? false : cfg.focus;
            var vCodeUrl = that.vCodeUrl = (typeof cfg.vCodeUrl == 'undefined') ? null : cfg.vCodeUrl;
            return {
                id: id,
                smtemplet: smtemplet,
                defaultxt: defaultxt,
                maxlength: maxlength,
                addUrl: addUrl,
                islogin: islogin,
                nologinHtml: nologinHtml,
                onsubmit: onsubmit,
                focus: focus,
                vCodeUrl: vCodeUrl
            };
        },
        parseParam: function (cfg) {
            var that = this;
            var cfg = cfg || {};
            var id = typeof cfg.id == 'undefined' ? that.id : cfg.id;
            var smtemplet = (typeof cfg.smtemplet == 'undefined') ? that.smtemplet : cfg.smtemplet;
            var defaultxt = (typeof cfg.defaultxt == 'undefined') ? that.defaultxt : cfg.defaultxt;
            var maxlength = (typeof cfg.maxlength == 'undefined') ? that.maxlength : cfg.maxlength;
            var addUrl = (typeof cfg.addUrl == 'undefined') ? that.addUrl : cfg.addUrl;
            var islogin = (typeof cfg.islogin == 'undefined') ? that.islogin : cfg.islogin;
            var nologinHtml = (typeof cfg.nologinHtml == 'undefined') ? that.nologinHtml : cfg.nologinHtml;
            var onsubmit = (typeof cfg.onsubmit == 'undefined') ? that.onsubmit : cfg.onsubmit;
            var focus = (typeof cfg.focus == 'undefined') ? that.focus : cfg.focus;
            var vCodeUrl = (typeof cfg.vCodeUrl == 'undefined') ? that.vCodeUrl : cfg.vCodeUrl;
            return {
                id: id,
                smtemplet: smtemplet,
                defaultxt: defaultxt,
                maxlength: maxlength,
                addUrl: addUrl,
                islogin: islogin,
                nologinHtml: nologinHtml,
                onsubmit: onsubmit,
                focus: focus,
                vCodeUrl: vCodeUrl
            };
        },
        render: function (cfg) {
            var that = this;
            var param = that.parseParam(cfg);
            var id = param.id;
            var smtemplet = param.smtemplet;
            var defaultxt = param.defaultxt;
            var maxlength = param.maxlength;
            var addUrl = param.addUrl;
            var islogin = param.islogin;
            var nologinHtml = param.nologinHtml;
            var onsubmit = param.onsubmit;
            var focus = param.focus;
            var vCodeUrl = param.vCodeUrl;
            var con = that.con = Y.one('#' + id);
            if (!islogin) {
                con.set('innerHTML', nologinHtml);
                Y.Node.get('#J-editorlogin').on('click', function (e) {
                    e.halt();
                    T.DP.loginbox = new T.tbwidget.tblogin(e.target.get('id'), C_CALLBACK_URL);
                });
                return;
            }
            if (typeof T.DP.loginbox != 'undefined') {
                T.DP.loginbox.removeBox();
            }
            if (typeof vCodeUrl != 'undefined' && vCodeUrl != null) {
                var vCodeHidden = '';
            } else {
                var vCodeHidden = 'hidden';
            }
            con.set('innerHTML', T.base.templetShow(that.html, {
                defaultxt: defaultxt,
                //vCodeHidden:vCodeHidden,
                vCodeUrl: vCodeUrl
            }));
            /*
            if(vCodeHidden == ''){
            con.query('.t-refresh-vcode').on('click',function(e){
            e.halt();	
            con.query('.t-vcode').set('src',vCodeUrl+'&t='+Math.random());
            });
            }*/
            var txtel = that.txtel = con.query('textarea.t-txtel');
            txtel.on('click', function (e) {
                e.halt();
                if (T.base.trim(txtel.get('value')) == defaultxt) {
                    txtel.set('value', '');
                }
                that.calculateTxt();
            });
            txtel.on('blur', function (e) {
                e.halt();
                if (T.base.trim(txtel.get('value')) == '') {
                    txtel.set('value', defaultxt);
                }
                that.calculateTxt();
            });
            var facecon = con.query('.t-face-con');
            facecon.set('innerHTML', that.getSmileHTML());
            var facebutton = con.query('.J-facebutton');
            facebutton.on('mouseover', function (e) {
                e.halt();
                var node = e.target;
                node.addClass('hover');
            });
            facebutton.on('mouseout', function (e) {
                e.halt();
                var node = e.target;
                node.removeClass('hover');
            })
            facebutton.on('click', function (e) {
                e.halt();
                if (!facecon.hasClass('hidden')) {
                    facecon.addClass('hidden');
                } else {
                    facecon.removeClass('hidden');
                }
            });
            Y.on('click', function (e) {
                var el = e.target;
                var flag = false;
                el.ancestor(function (node) {
                    if (node.hasClass('sm_div')) {
                        flag = true;
                        return true;
                    } else {
                        return false;
                    }
                });
                if (flag) {
                    var n = el.get('rel');
                    if (!n) return;
                    that.addSmileCode(that.smtemplet.replace('{$n}', n));
                    //if(Y.UA.ie > 0)that.txtel.focus();
                } else {
                    facecon.addClass('hidden');
                }
            },
            document);
            that.txtel.on('keyup', function (e) {
                e.halt();
                that.calculateTxt();
                var str = that.txtel.get('value');
                var thelength = str.length;
                if (thelength > that.maxlength) {
                    that.txtel.set('value', str.substr(0, that.maxlength));
                }
            });
            that.txtel.on('keydown', function (e) {
                that.calculateTxt();
                var str = that.txtel.get('value');
                var thelength = str.length;
                if (thelength > that.maxlength) {
                    that.txtel.set('value', str.substr(0, that.maxlength));
                }
            });
            that.txtel.on('onselect', function (e) {
                e.halt();
                if (Y.Node.getDOMNode(e.target).createTextRange) Y.Node.getDOMNode(e.target).caretPos = document.selection.createRange().duplicate();
            });
            that.txtel.on('click', function (e) {
                e.halt();
                if (Y.Node.getDOMNode(e.target).createTextRange) Y.Node.getDOMNode(e.target).caretPos = document.selection.createRange().duplicate();
            });
            that.txtel.on('keyup', function (e) {
                e.halt();
                if (Y.Node.getDOMNode(e.target).createTextRange) Y.Node.getDOMNode(e.target).caretPos = document.selection.createRange().duplicate();
            });
            //验证码的动作
            /*
            if(vCodeHidden == ''){
            con.query('.t-code').on('focus',function(e){
            e.halt();
            var vcBody = con.query('.vc-body');
            if(vcBody.hasClass('hidden')){
            vcBody.removeClass('hidden');
            }
            });
            }
            */
            con.query('.submit').on('click', function (e) {
                e.halt();
                e.target.setAttribute('disabled', true);
                var thePostStr = T.base.stripHTML(that.txtel.get('value'));
                if (T.base.trim(thePostStr) == that.defaultxt || T.base.trim(thePostStr) == '') {
                    that.showAlertTip('J-alertip', 'error', '请输入内容');
                    Y.Node.getDOMNode(e.target).disabled = false;
                    return;
                }
                /*
                if(vCodeHidden == ''){
                if(T.base.trim(con.query('.t-code').get('value')) == ''){
                that.showAlertTip('J-alertip', 'error', '验证码为空');
                Y.Node.getDOMNode(e.target).disabled = false;
                con.query('.t-code').focus();
                return;
                }
                }
                */
                var ps = 'content=' + encodeURIComponent(thePostStr);
                /*
                if(vCodeHidden == ''){
                ps += '&code='+con.query('.t-code').get('value');
                }
                */
                T.base.io('POST', that.addUrl, function (o) {
                    that.onsubmit(thePostStr);
                    that.txtel.set('value', that.defaultxt);
                    Y.Node.getDOMNode(e.target).disabled = false;
                    that.showAlertTip('J-alertip', 'ok', '发表成功');
                    that.calculateTxt();
                    //Y.log('成功...');
                    /*
                    if(vCodeHidden == ''){
                    con.query('.t-vcode').set('src',vCodeUrl+'&t='+Math.random());
                    con.query('.t-code').set('value','');
                    }
                    */
                },
                ps, function (o) {
                    that.showAlertTip('J-alertip', 'error', o);
                    if (o != '提交中...') {
                        Y.Node.getDOMNode(e.target).disabled = false;
                    }
                    /*
                    if(vCodeHidden == ''){
                    con.query('.t-vcode').set('src',vCodeUrl+'&t='+Math.random());
                    con.query('.t-code').set('value','');
                    }
                    */
                },
                'application/x-www-form-urlencoded; charset=GBK');
            });
            con.query('.reset').on('click', function (e) {
                e.halt();
                that.txtel.set('value', that.defaultxt);
                that.calculateTxt();
            });
            con.queryAll('button.t-ci-img').on('mouseover', function (e) {
                e.halt();
                e.target.addClass('mousehover');
                e.target.setStyle('cursor', 'hand');
            });
            con.queryAll('button.t-ci-img').on('mouseout', function (e) {
                e.halt();
                e.target.removeClass('mousehover');
                e.target.setStyle('cursor', 'pointer');
            });
            if (focus) {
                that.txtel.focus();
            }

        },
        init: function (cfg) {
            this.buildParam(cfg);
            this.render.call(this, cfg);
        },
        /**
        * 计算字数
        */
        calculateTxt: function () {
            var that = this;
            var n = that.txtel.get('value').length;
            if (T.base.trim(that.txtel.get('value')) == T.base.trim(that.defaultxt)) n = 0;
            if (n > 500) n = 500;
            if (typeof that.maxlength == "number") {
                that.con.query('span.t-txtlength').set('innerHTML', n + '/' + that.maxlength);
            }
        },

        showAlertTip: function (id, status, msg) {
            var that = this;
            var delaytime = 3000;

            var con = Y.one('#' + id);
            con.set('innerHTML', '<div class="' + status + '">' + msg + '</div>');
            con.setStyle('display', 'block');



            that.AlertTipTimer = that.AlertTipTimer || {};
            if (typeof that.AlertTipTimer[id] != 'undefined') clearTimeout(that.AlertTipTimer[id]);
            that.AlertTipTimer[id] = setTimeout(function () {
                try {
                    con.set('innerHTML', '');
                    con.setStyle('display', 'none');
                } catch (o) { }
            }, delaytime);
        },


        /**
        * 定位光标,for ！ie only
        */
        setCursor: function (domObj, pos) {
            domObj.focus();
            domObj.setSelectionRange(pos, pos);
        },
        /**
        * 得到选中内容的数据,for ！ie only
        */
        getCaret: function (el) {
            var Caret = { s: 0, e: 0, l: 0 };
            if (document.selection) {
                el.focus();
                var oSel = document.selection.createRange();
                var error = 0;
                Caret.l = oSel.text.length;
                oSel.moveStart('character', -el.value.length);
                Caret.e = oSel.text.length;
                Caret.s = oSel.text.length - Caret.l;
            } else if (el.selectionStart || el.selectionStart == '0') {
                Caret.s = el.selectionStart;
                Caret.e = el.selectionEnd;
                Caret.l = el.selectionEnd - el.selectionStart;
            }
            return Caret;
        },

        addSmileCode: function (smcode) {
            var that = this;
            var o_value = that.txtel.get('innerHTML');
            var thelength = o_value.length;
            if (thelength + smcode.length > that.maxlength) return;
            that.con.query('.t-face-con').addClass('hidden');
            that.calculateTxt(); //计算字数

            var txtelDom = Y.Node.getDOMNode(that.txtel);
            if (that.txtel.get('value') == that.defaultxt) {
                that.txtel.set('value', smcode);
                return;
            }
            if (Y.UA.ie > 0) {//ie插入字符
                (function insertAtCaret(textEl, text) {
                    if (textEl.createTextRange && textEl.caretPos) {
                        var caretPos = textEl.caretPos;
                        caretPos.text = caretPos.text.charAt(caretPos.text.length - 1) == ' ' ? text + ' ' : text;
                    }
                    else
                        textEl.value = text;
                })(txtelDom, smcode);
            } else {//！ie插入字符
                var pos = that.getCaret(txtelDom);
                var newText = txtelDom.value.substring(0, pos.s) + smcode + txtelDom.value.substring(pos.e, txtelDom.value.length);
                txtelDom.value = newText;
                that.setCursor(txtelDom, pos.s + smcode.length);
            }
        },

        getSmileHTML: function () {
            var sm = '<div class="sm"><div class="sm_div"><img class="sm_png" src="http://a.tbcdn.cn/sys/wangwang/smiley/sprite.png" /><ul>';
            var list = [];
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 11; j++) {
                    var n = i * 11 + j;
                    var l = Math.floor(j * 26.18);
                    var t = Math.floor(i * 26.18);
                    list.push('<li rel="' + n + '" class="sm_li' + n + ' sm_li" style="left:' + l + 'px;top:' + t + 'px"><a rel="' + n + '" href="javascript:void(0);" title="' + n + '.png"></a></li>');
                }
            }
            sm += list.join('') + '</ul></div></div>';
            return sm;
        }
    },
    0, null, 4);
});
