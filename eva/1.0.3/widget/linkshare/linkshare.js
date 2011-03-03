YUI.namespace('Y.linkShare');
YUI.add('linkshare', function (Y) {
    Y.linkShare = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.linkShare, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.con = Y.one('#' + that.id);
            that.con.set('innerHTML', '<span class="linkshare-loading">\u51C6\u5907\u4E2D</span>');
            that.config = config;
            that.buildParam(config);
            that.render();

            return this;
        },
        buildParam: function (o) {
            var that = this;
            //基本参数
            var o = (typeof o == 'undefined' || o == null) ? {} : o;
            that.url = (typeof o.url == 'undefined' || o.url == null) ? window.location.href : o.url;
            that.content = (typeof o.content == 'undefined' || o.content == null) ? 'content' : o.content;
            that.title = (typeof o.title == 'undefined' || o.title == null) ? document.title : o.title;
            that.copyClass = (typeof o.copyClass == 'undefined' || o.copyClass == null) ? 'copy-button' : o.copyClass;
            that.isCopy = (typeof o.isCopy == 'undefined' || o.isCopy == null) ? false : true;

            //
            that.title = encodeURI(that.title);

            return this;
        },

        //添加默认样式
        render: function () {
            var that = this;
            var con_innerHTML = '';

            /*
            <a href="javascript:void(0);" onclick="window.open('http://v.t.qq.com/share/share.php?title='+encodeURIComponent(document.title.substring(0,76))+'&url='+encodeURIComponent(location.href)+'&rcontent=','_blank','scrollbars=no,width=600,height=450,left=75,top=20,status=no,resizable=yes'); " title="腾讯微博" rel="nofollow" ><IMG alt=腾讯微博 src="http://www.vikilife.com/wp-content/themes/corner2010/images/icons/tqq.png" align=absMiddle></a>
            */
            //For Yintai
            if (Y.one('#mainShow') !== null) {
                var pic = Y.one('#mainShow').get('src');
            }

            that.innerIcon = Y.Node.create('<span class="linkshare-icon"><a title="\u5206\u4EAB\u5230\u4EBA\u4EBA\u7F51" target="_blank" class="renren" href="http://share.renren.com/share/buttonshare.do?link=' + that.url + '">\u4EBA\u4EBA\u7F51</a><a title="\u5206\u4EAB\u5230\u5F00\u5FC3\u7F51" target="_blank" class="kaixin" href="http://www.kaixin001.com/repaste/share.php?rurl=' + that.url + '&amp;rcontent=' + that.content + '&amp;rtitle=' + that.title + '">\u5F00\u5FC3\u7F51</a><a title="\u5206\u4EAB\u5230\u65B0\u6D6A\u5FAE\u535A" target="_blank" class="tsina" href="http://v.t.sina.com.cn/share/share.php?url=' + that.url + '&amp;title=' + that.title + '">\u65B0\u6D6A\u5FAE\u535A</a><a title="\u5206\u4EAB\u5230\u641C\u72D0\u5FAE\u535A" target="_blank" class="tsohu" href="http://t.sohu.com/third/post.jsp?&amp;url=' + that.url + '&amp;title=' + that.title + '&amp;content=utf-8&amp;pic=">\u641C\u72D0\u5FAE\u535A</a><a title="\u5206\u4EAB\u5230QQ\u7A7A\u95F4"  target="_blank" class="qzone" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=' + that.url + '">QQ\u7A7A\u95F4</a><a href="http://v.t.qq.com/share/share.php?title=' + that.title + '&url=' + that.url + '&site=www.yintai.com&pic=' + pic + '&appkey=4b044984590e4efe977521cd69fe25ca" target="_blank" class="tqq" title="\u5206\u4EAB\u5230\u817E\u8BAF\u5FAE\u535A">qq</a></span>');

            /*<a title="分享到51" target="_blank" class="com51" href="http://share.51.com/share/share.php?type=8&amp;vaddr='+that.url+'">51</a><a title="分享到豆瓣" target="_blank" class="douban" href="http://www.douban.com/recommend/?url='+that.url+'&amp;title='+that.title+'">豆瓣</a>*/

            setTimeout(function () {
                that.con.set('innerHTML', '');
                that.con.appendChild(that.innerIcon);
                if (that.isCopy) {
                    that.copybtn = Y.Node.create('<a class="linkshare-copy" title="\u590D\u5236\u94FE\u63A5\u5730\u5740" href="#"><i>\u590D\u5236\u94FE\u63A5\u5730\u5740</i></a>');
                    that.copybtn.addClass(that.copyClass);
                    that.con.appendChild(that.copybtn);
                }
                //绑定事件
                that.bindEvent();
            }, 1000);
            
            return this;
        },
        //注册事件
        bindEvent: function () {
            var that = this;
            //console.log(that.innerIcon);
            if (!that.isCopy) return;
            that.copybtn.on('click', function (e) {
                e.halt();
                var msg = "\u5DF2\u7ECF\u5C06\u5185\u5BB9\u62F7\u8D1D\u5230\u7C98\u8D34\u7248\u4E2D%2C\u8BF7\u53D1\u9001\u7ED9QQ%2CMSN\u7B49IM\u4E0A\u7684\u597D\u53CB\uFF01";
                if (window.clipboardData) {
                    window.clipboardData.setData('text', that.url);
                    //window.alert(msg);
                    //if(_inviteSuccess) _inviteSuccess.style.display='block';
                } else if (window.netscape) {
                    that._netscapeCopy(that.url, msg);
                    //window.alert(msg);
                }
                else {
                    window.alert("\u60A8\u6240\u4F7F\u7528\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6B64\u529F\u80FD%2C\u8BF7\u9009\u4E2D\u5730\u5740\u680F\u7136\u540E\u6309%20Ctrl+C%20\u6309\u94AE\uFF01");
                }

            });
            return this;
        },
        _netscapeCopy: function (_linkTextValue, _msg) {
            var that = this;
            try {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
            }
            catch (e) {
                if (window.confirm("\u6B64\u64CD\u4F5C\u88AB\u6D4F\u89C8\u5668\u62D2\u7EDD\uFF01 \u8BF7\u5728\u5F39\u51FA\u7684\u5B89\u5168\u5BF9\u8BDD\u6846\u4E2D\u9009\u62E9\u201C\u662F\u201D,\u518D\u6765\u4E00\u6B21\u5417\uFF1F")) {
                    that._netscapeCopy(_linkTextValue, _msg);
                }
                return false;
            }
            var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
            if (!clip)
                return;
            var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
            if (!trans)
                return;
            trans.addDataFlavor('text/unicode');
            var str = new Object();
            var len = new Object();
            var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
            var copytext = _linkTextValue;
            str.data = copytext;
            trans.setTransferData("text/unicode", str, copytext.length * 2);
            var clipid = Components.interfaces.nsIClipboard;
            if (!clip) {
                window.alert("\u6CA1\u6709\u6210\u529F\u7684\u5C06\u5185\u5BB9\u62F7\u8D1D\u5230\u7C98\u8D34\u4E2D\uFF01");
                return false;
            }
            clip.setData(trans, null, clipid.kGlobalClipboard);

            return this;
        }


    }, 0, null, 4);

}, '', { requires: ['node'] });
