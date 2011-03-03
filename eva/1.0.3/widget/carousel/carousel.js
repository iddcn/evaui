/*	
* carousel.js | carousel 传送带
* autohr:idd.chiang@gmail.com
* @class Y.Carousel
* 文档候补
* 最后一次 总共 N   橱窗 S   每次 n	 如果 n>S 按照橱窗滚动；如果n<S 按照n滚动
* 停止的节点是 Math.floor(N/);
*/
YUI.namespace('Y.Carousel');
YUI.add('carousel', function (Y) {
    Y.Carousel = function () {
        this.init.apply(this, arguments);
    };
    Y.mix(Y.Carousel, {
        init: function (id, config) {
            var that = this;
            that.id = id;
            that.config = config;
            that.con = (typeof that.id == 'object') ? that.id : Y.one('#' + that.id);
			//Loading
			//隐藏原始图片列表
			that.con.setStyle('display','none');
            //渲染
            that.render(that.config);
			that.buildEventCenter();
            return this;
        },
        buildParam: function (o) {
            var that = this;
            //基本参数
            var o = (typeof o == 'undefined' || o == null) ? {} : o;
			//传送带方向
			that.vertical = (typeof o.vertical == 'undifined' || o.vertical == null) ? true : false;
			//高宽设置必须配合css，默认加入了padding:5px 0和border:1px，纵向imgwidth+12px
			that.ewidth = (typeof o.width == 'undifined' || o.width == null) ? 60 : o.width;
			that.eheight = (typeof o.height == 'undifined' || o.height == null) ? 80 : o.height;
			that.shownum = (typeof o.shownum == 'undifined' || o.shownum == null) ? 4 : o.shownum;
			that.oncenum = (typeof o.oncenum == 'undifined' || o.oncenum == null) ? 4 : o.oncenum;
			that.padding = (typeof o.padding == 'undifined' || o.padding == null) ? [12,2] : o.padding;
			//加入边距值
			that.owidth = that.vertical?that.ewidth+that.padding[1]:that.ewidth+that.padding[0];
			that.oheight = that.vertical?that.eheight+that.padding[0]:that.eheight+that.padding[1];
			//是否需要点击单项表示选中，用作选盘
			that.isItemSelected = (typeof o.selected == 'undifined' || o.selected == null) ? true : false;
			that.directionClass = that.vertical?' ew-c-vertical':' ew-c-horizon';
			//传送带中的子元素总数
			that.totnum = that.con.get('children').size();
			//点击子元素选中的回调
			that.itemFUN = (that.isItemSelected == true)? o.fun : new Function;
			//传送起始位置默认为1
			that._currentnum = 1;
			that.isPre = false;
			that.isNext = false;
			that.delay = true;
			that.integer = /^[0-9]*[1-9][0-9]*$/;

			//构造滚动所需页面结构，中途传参重新渲染
            that.buildCarousel(o);
            return this;
        },
        //渲染参数
        render: function (o) {
            var that = this;
            that.parseParam(o);
			//事件绑定在绘制html之后
            that.bindEvent();
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
		//事件中心
		buildEventCenter:function(){
			var that = this;
			var EventFactory = function(){
				this.publish("switch");
			};
			Y.augment(EventFactory, Y.Event.Target);
			that.EventCenter = new EventFactory();
			return this;
		},
		//绑定函数
		on:function(type,foo){
			var that = this;
			that.EventCenter.subscribe(type,foo);
			return this;
		},
		//构造Carousel滚动
        buildCarousel: function (o) {
            var that = this;
			//Carousel容器
			if(that.container){
				that.container.remove();
			};
			var clipHTML = that.con.get('innerHTML');
            that.container = Y.Node.create('\
			<div class="eva-widget-carousel'+that.directionClass+'">\
				<div class="ew-c-clip"><ul class="ew-c-list">'+clipHTML+'</ul></div>\
				<div class="ew-c-pre ew-c-pre-disabled"><a href="#" title="\u5411\u4E0A">\u5411\u4E0A</a></div>\
				<div class="ew-c-next"><a href="#" title="\u5411\u4E0B">\u5411\u4E0B</a></div>\
			</div>');
			that.con.insert(that.container,'after');
			that.clip = that.container.one('.ew-c-clip');
			that.list = that.container.one('.ew-c-list');
			if(!that.list || !that.clip)return;
			if(that.vertical){
				that.clip.setStyle('height',that.shownum*that.oheight);
				that.clip.setStyle('width',that.owidth);
				that.list.setStyle('top',0);
			}else{
				that.clip.setStyle('width',that.shownum*that.owidth);
				that.clip.setStyle('height',that.oheight);
				that.list.setStyles({'width':that.totnum*that.owidth,'left':0});
			}
			//定义按钮
			that.pre = that.container.one('.ew-c-pre'); 
			that.next = that.container.one('.ew-c-next');
			
			//如果橱窗中个数小于橱窗可展示总数
			if(that.totnum<=that.shownum){
				that.next.addClass('ew-c-next-disabled');
				that.isPre = false;
			}else{
				that.isNext = true;
			}
            return this;
        },
        //注册事件
        bindEvent: function () {
            var that = this;
			var _top = that.list.get('region').top,
				_height = that.list.get('region').height;
			//处理单项选中情况
			if(that.isItemSelected){
				if(!that.list.one('li'))return;
				that.list.one('li').addClass('selected');
				that.list.delegate('click',function(e){
					e.halt();
					var el = e.target;
					that.list.get('children').removeClass('selected');
					//选中仅在LI上家
					el = el.ancestor(function(n){
						if(n.get('tagName') == 'LI')return true;else return false;
					});
					if(!el)return;
					el.addClass('selected');
					//抛出一个回调
					that.itemFUN.apply(that.itemFUN,arguments);
				},'li');	
			}
			//向前箭头鼠标经过效果
			that.pre.on('mouseover',function(e){
				if(this.hasClass('ew-c-pre-disabled'))return;
				this.addClass('ew-c-pre-hover');	
			});
			that.pre.on('mouseout',function(e){
				if(this.hasClass('ew-c-pre-disabled'))return;
				this.removeClass('ew-c-pre-hover');	
			});
			//向后箭头鼠标经过效果
			that.next.on('mouseover',function(e){
				if(this.hasClass('ew-c-pre-disabled'))return;
				this.addClass('ew-c-next-hover');	
			});
			that.next.on('mouseout',function(e){
				if(this.hasClass('ew-c-pre-disabled'))return;
				this.removeClass('ew-c-next-hover');	
			});
            //点击向前\上按钮
			that.pre.on('click',function(e){
				if(this.hasClass('ew-c-pre-disabled')||!that.delay)return;
				that._currentnum = Math.abs(that._currentnum - 2);
				that.delay = false;
				that.isNext = true;
				//纵向横线动画方式不一样
				if(that.vertical){
					that.anim = new Y.Anim({
						node:that.list,
						from:{
							opacity:0.3
						},
						to:{
							top:-1*that._currentnum*that.oncenum*that.oheight,
							opacity:1
						},
						duration:0.5,
						easing:'easeBothStrong'
					});
				}else{
					that.anim = new Y.Anim({
						node:that.list,
						from:{
							opacity:0.3
						},
						to:{
							left:-1*that._currentnum*that.oncenum*that.owidth,
							opacity:1
						},
						duration:0.5,
						easing:'easeBothStrong'
					});
				}
				that.anim.on('end', function() {
					//滚动几次
					if(that.shownum%that.oncenum == 0){
						that.count = Math.floor(that.totnum/that.oncenum)-1;	
					}else{
						that.count = Math.floor(that.totnum/that.oncenum);	
					}
					if (that._currentnum == 0){
						that.isPre = false;
					}
					//标识向上滚动无效
					if(!that.isPre){
						that.pre.addClass('ew-c-pre-disabled');
					}
					if(that.isNext && that.next.hasClass('ew-c-next-disabled')){
						that.next.removeClass('ew-c-next-disabled');	
					}
					//防止动画连续点击
					that.delay = true;
					that._currentnum += 1;
				});
				that.anim.run();
				//自定义switch事件
				that.EventCenter.fire('switch',{
					frame:that._currentnum,
					passed:Math.floor(that.oncenum*that._currentnum),
					remain:function(){
						var _remainNum = Math.floor(that.totnum-that.oncenum*that._currentnum-that.shownum);
						if(that.integer.test(_remainNum)){
							return _remainNum;
						}else{
							return 0
						}
					},
					direction:'previous'
				});
			});
			//点击向后\下按钮
			that.next.on('click',function(e){
				if(this.hasClass('ew-c-next-disabled')||!that.delay)return;
				//如果橱窗显示个数小于每次滚动个数时，以橱窗个数来滚动，仅向下滚动时考虑
				if(that.shownum<=that.oncenum)that.oncenum = that.shownum;	
				that.delay = false;
				that.isPre = true; //向后滚动后，向前滚动开启
				if(that.vertical){
					that.anim = new Y.Anim({
						node:that.list,
						from:{
							opacity:0.3
						},
						to:{
							top:-1*that._currentnum*that.oncenum*that.oheight,
							opacity:1
						},
						duration:0.5,
						easing:'easeBothStrong'
					});
				}else{
					that.anim = new Y.Anim({
						node:that.list,
						from:{
							opacity:0.3
						},
						to:{
							left:-1*that._currentnum*that.oncenum*that.owidth,
							opacity:1
						},
						duration:0.5,
						easing:'easeBothStrong'
					});
				}
				that.anim.on('end', function() {
					//有余数就多滚一帧
					if(that.totnum%that.oncenum == 0){
						that.count = Math.floor(that.totnum/that.oncenum)-1;	
					}else{
						that.count = Math.floor(that.totnum/that.oncenum);	
					}
					//当前滚动帧数等于总帧数停止向下功能
					if (that._currentnum == that.count){
						that.isNext = false;
					}						
					//标识向下滚动无效
					if(!that.isNext){
						that.next.addClass('ew-c-next-disabled');
					}
					if(that.isPre && that.pre.hasClass('ew-c-pre-disabled')){
						that.pre.removeClass('ew-c-pre-disabled');	
					}
					//防止动画连续点击
					that.delay = true;
					that._currentnum += 1;
				});
				that.anim.run();
				//自定义switch事件
				that.EventCenter.fire('switch',{
					frame:that._currentnum,
					passed:Math.floor(that.oncenum*that._currentnum),
					remain:function(){
						var _remainNum = Math.floor(that.totnum-that.oncenum*that._currentnum-that.shownum);
						if(that.integer.test(_remainNum)){
							return _remainNum;
						}else{
							return 0
						}
					},
					direction:'next'
				});
			});
            return this;
        }

    }, 0, null, 4);

}, '', { requires: ['node','anim'] });
