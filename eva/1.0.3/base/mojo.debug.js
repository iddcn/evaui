Eva.addmojo({
    'ebase': {
        path: EVA._CFG.evaBase + 'base/e-base.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['json', 'node']
    },
    'slide': {
        path: EVA._CFG.evaBase + 'widget/slide/slide.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['plug-switchable', 'plug-switchable-effect']
    },
    'calendar': {
        path: EVA._CFG.evaBase + 'widget/calendar/calendar.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['calendar-skin', 'node']
    },
    'calendar-skin': {
        path: EVA._CFG.evaBase + 'widget/calendar/skin/default.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'postip': {
        path: EVA._CFG.evaBase + 'widget/postip/postip.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'anim']
    },
    'editable': {
        path: EVA._CFG.evaBase + 'widget/editable/editable.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'highlight': {
        path: EVA._CFG.evaBase + 'widget/hljs/highlight.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['hlcss']
    },
    'hlcss': {
        path: EVA._CFG.evaBase + 'widget/hljs/highlight.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'colorbox': {
        path: EVA._CFG.evaBase + 'widget/colorbox/colorbox.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['jquery', 'colorbox-css']
    },
    'colorbox-css': {
        path: EVA._CFG.evaBase + 'widget/colorbox/colorbox.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'checkall': {
        path: EVA._CFG.evaBase + 'widget/checkall/checkall.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'inputip': {
        path: EVA._CFG.evaBase + 'widget/inputip/inputip.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'gotop': {
        path: EVA._CFG.evaBase + 'widget/gotop/gotop.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'anim']
    },
    'rating': {
        path: EVA._CFG.evaBase + 'widget/rating/rating.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'io', 'rating-css']
    },
    'rating-css': {
        path: EVA._CFG.evaBase + 'widget/rating/rating.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'nav': {
        path: EVA._CFG.evaBase + 'widget/nav/nav.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'anim']
    },
    'rank': {
        path: EVA._CFG.evaBase + 'widget/rank/rank.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'tip': {
        path: EVA._CFG.evaBase + 'widget/tip/tip.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'anim', 'tip-css']
    },
    'tip-css': {
        path: EVA._CFG.evaBase + 'widget/tip/tip-skin.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'box-skin': {
        path: EVA._CFG.evaBase + 'widget/box/skin.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'box': {
        path: EVA._CFG.evaBase + 'widget/box/box.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['box-skin', 'node', 'overlay', 'dd-plugin']
    },
    'togglefold': {
        path: EVA._CFG.evaBase + 'widget/toggle-fold/toggle-fold.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'linkshare': {
        path: EVA._CFG.evaBase + 'widget/linkshare/linkshare.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'ebase', 'linkshare-css']
    },
    'linkshare-css': {
        path: EVA._CFG.evaBase + 'widget/linkshare/linkshare.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'overlayer': {
        path: EVA._CFG.evaBase + 'widget/overlayer/overlayer.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'jcarousel': {
        path: EVA._CFG.evaBase + 'widget/jcarousel/jcarousel.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['jquery', 'jcarousel-css']
    },
    'magnifier-css': {
        path: EVA._CFG.evaBase + 'widget/magnifier/magnifier.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'count': {
        path: EVA._CFG.evaBase + 'widget/count/count.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'carousel': {
        path: EVA._CFG.evaBase + 'widget/carousel/carousel.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'anim-base', 'carousel-css']
    },
    'carousel-css': {
        path: EVA._CFG.evaBase + 'widget/carousel/carousel.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    },
    'datalazyloader': {
        path: EVA._CFG.evaBase + 'widget/datalazyloader/datalazyloader.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'oop']
    },
    'navi': {
        path: EVA._CFG.evaBase + 'widget/navi/navi.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node']
    },
    'tab':{
        path:EVA._CFG.evaBase+'widget/tabview/tab.js'+EVA._CFG._isRelease,
        emojo:EVA._CFG._isCombo,
        requires: ['plug-switchable']
    },
    'plug-switchable': {
        path: EVA._CFG.evaBase + 'widget/plug-switchable/plug-switchable.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'plugin', 'event-mouseenter']
    },
    'plug-slide': {
        path: EVA._CFG.evaBase + 'widget/plug-slide/plug-slide.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['plug-switchable']
    },
    'plug-switchable-effect': {
        path: EVA._CFG.evaBase + 'widget/plug-switchable-effect/plug-effect.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node', 'plugin', 'anim']
    },
    'plug-carousel': {
        path: EVA._CFG.evaBase + 'widget/plug-carousel/plug-carousel.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['plug-switchable']
    },
	//dp-SyntaxHighlight
	'dp': {
        path: EVA._CFG.evaBase + 'widget/dp/dp.js' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        requires: ['node','dpcss']
    },
    'dpcss': {
        path: EVA._CFG.evaBase + 'widget/dp/dpcss.css' + EVA._CFG._isRelease,
        emojo: EVA._CFG._isCombo,
        type: 'css'
    }

});
