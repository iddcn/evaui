/**
*	HTML 结构
<dl>
	<dt><a href="" target="_blank">ITEM</a></dt>
	<dd>
		<div class="submenu"><!-- //align-right// -->
			<div class="msorts">
			...
			</div>
			<div class="mbrand">
			...
			</div>
			<div class="mshadow"><s class="ms-bg"></s><s class="l"></s><s class="mb-bg"></s></div>
		</div>
	</dd>
</dl>
...
<dl>
	<dt><a href="" target="_blank">ITEM</a></dt>
</dl>
*/
YUI.namespace('Y.Navi');
YUI.add('navi', function (Y) {
    Y.Navi = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.Navi, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.config = config;
            that.con = (typeof that.id == 'object') ? that.id : Y.one('#' + that.id);
            //渲染弹出框
            that.render();
            //构造弹出框
            that.buildTip();
            //绑定事件
            that.bindEvent();
            return this;
        },
        buildTip: function () {
            var that = this;
			//导航单项
			that.$item = this.con.all('dl');
			//导航handle
			that.$handle = this.con.all('dt');
			//初始化子菜单状态
			that.$item.each(function(item){
				if(!item.one('dd'))return;
				//获得dt,dd属性
				that._dt = item.one('dt');
				that._dd = item.one('dd');
				//计量
				that._conWidth = that.con.get('region').width;
				that._conLeft = that.con.get('region').left;
				that._dtLeft = that._dt.get('region').left;
				that._dtWidth = that._dt.get('region').width;
				that._restSpace = that._conWidth - (that._dtLeft - that._conLeft);
				//子菜单中内容高矮
				that.msorts = item.one('.msorts').get('region').height;

				that.mbrand = (item.one('.mbrand') !== null) ? item.one('.mbrand').get('region').height : 0;
				
				that.shadowHeight = (that.msorts > that.mbrand) ? that.msorts :	that.mbrand;
				//
				that._dd.setStyles({
					'visibility':'hidden',
					'top':that._dt.get('region').height,
					'zIndex':that.zIndex
				});

				if(Y.UA.ie > 6){
					that._dd.setStyles({
						'top':(that._dt.get('region').height - 6) + 'px'
					});
				}
				if(that.ie6) {
					that._dd.setStyle('top',(that._dt.get('region').height - 8) + 'px');
				}
				item.all('s').setStyle('height',that.shadowHeight);
				
				//判定handle左边距剩余的空间是否能盛放子菜单
				that.submenuWidth = item.one('dd').get('region').width;
				if(that._restSpace < that.submenuWidth){
					that._dd.setStyle('right','-2px');
					that._dd.one('.submenu').addClass('align-right');
					if (that.ie6)that._dd.setStyle('right','-3px');
				}else{
					that._dd.setStyle('left','0');						
				}

				//IE6以下隐藏干扰层
				if (that.ie6) {
					that.mark = Y.Node.create('<iframe frameborder="0" src="javascript:false" style="background:transparent;position:absolute;border:none;top:0;left:0;padding:0;margin:0;z-index:-1;filter:alpha(opacity=0);"></iframe>');
					that.mark.setStyles({
						'width': that.msorts + that.mbrand + 'px',
						'height': that.shadowHeight + 'px'
					});
					item.one('.mshadow').appendChild(that.mark);
				}
			});

            return this;
        },
        buildParam: function (o) {
            var that = this;
            //基本参数
            var o = (typeof o == 'undefined' || o == null) ? {} : o;

			that.zIndex = (typeof o.zIndex == 'undifined' || o.zIndex == null) ? '99' : o.zIndex;
			that.isShow = false;
			that.ie6 = /6/i.test(Y.UA.ie);
            return this;
        },
        //渲染HTML生成或找到弹出框
        render: function (o) {
            var that = this;
            that.parseParam(o);
            return this;
        },
        /**
        * 过滤参数列表
        */
        parseParam: function (o) {
            var that = this;
            if (typeof o == 'undefined' || o == null) {
                var o = {};
            }
            for (var i in o) {
                that.config[i] = o[i];
            }
            that.buildParam(that.config);
            return this;
        },
        //注册事件
        bindEvent: function () {
            var that = this;
			

			that.$item.each(function(item){
				if(!item.one('dd'))return;
				var _oMenu = item.one('dd');
				var _dt = item.one('dt');


				//鼠标触摸
				item.delegate('mouseover',function(e){
					e.halt();
					var el = e.target;
					//Y.log(_oMenu);
					//再次隐藏所有已展开的
					that.con.all('dd').setStyle('visibility','hidden');
					//标记当前handle
					_dt.addClass('selected');
					that.isShow = true;
					if(that.isShow)that.show(_oMenu);
				},'dt');

				//鼠标移至子菜单区域
				_oMenu.on('mouseover',function(e){
					if(_dt.hasClass('selected'))return;
					_dt.addClass('selected');
					that.isShow = true;
					if(that.isShow)that.show(_oMenu);
				});

				//鼠标移出整个子菜单
				that.con.on('mouseout',function(e){
					if(_dt.hasClass('selected')){
						_dt.removeClass('selected');
					}
					that.hide(_oMenu);
				});

				//鼠标移出子菜单
				that.con.delegate('mouseout',function(e){
					if(_dt.hasClass('selected')){
						_dt.removeClass('selected');
					}
					that.hide(_oMenu);
				},'dd');

				//hover菜单
				

			});
			//if(that.ie6){
				that.con.all('.ms-item').each(function(node){
					that.con.delegate('mouseover',function(e){
						var el = e.currentTarget;
						el.setStyles({
							'backgroundColor':'#000',
							'opacity':'0.8'
						});
						that.isShow = true;
					},'.ms-item');
					that.con.delegate('mouseout',function(e){
						var el = e.currentTarget;
						el.setStyles({
							'backgroundColor':'transparent',
							'opacity':'1'
						});
						that.isShow = true;
					},'.ms-item');
					
				});
			//}


			/*
			that.con.delegate('mouseover',function(e){
				e.halt();
				var el = e.target;
					that.ohandle = null;
				if(!el.get('parentNode').next())return;
				if(el.get('parentNode').get('tagName') == 'DT')that.ohandle = el.get('parentNode');
				that.oMenu = el.get('parentNode').next();
				//再次隐藏所有已展开的
				that.con.all('dd').setStyle('visibility','hidden');
				//标记当前handle
				if(that.ohandle == null)return;
				that.ohandle.addClass('selected');
				that.isShow = true;
				if(that.isShow)that.show(that.oMenu);
			},'dt a');

			that.con.delegate('mouseover',function(e){
				if(that.ohandle.hasClass('selected'))return;
				that.ohandle.addClass('selected');
				that.isShow = true;
				if(that.isShow)that.show(that.oMenu);
			},'dd');


			that.con.on('mouseout',function(e){
				if(that.ohandle.hasClass('selected')){
					that.ohandle.removeClass('selected');
				}
				that.hide(that.oMenu);
			});


			that.con.delegate('mouseout',function(e){
				if(that.ohandle.hasClass('selected')){
					that.ohandle.removeClass('selected');
				}
				that.hide(that.oMenu);
			},'dd');
			*/

            return this;
        },
		//控制弹出框显示
        show: function (e) {
            var that = this;
            if (e.getStyle('visibility') == 'visible') return;
            e.setStyle('visibility', 'visible');
            return this;
        },
        //控制弹出框隐藏
        hide: function (e) {
            var that = this;
            if (e.getStyle('visibility') == 'visible') {
                e.setStyle('visibility', 'hidden');
            };
            return this;
        }
    }, 0, null, 4);

}, '', { requires: ['node']});
