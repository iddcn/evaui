/// <reference path="../../../../yui/3.2.0/build/yui/yui.js" />

/*
 *  提供slide效果，继承自S.Plugin.Switchable
 */

YUI.add("plug-slide", function (S) {

    var Slide = function () {
        var self = this;
        Slide.superclass.constructor.apply(self, arguments);
    }
    Slide.NAME = "Slide";
    Slide.NS = "slide";
    Slide.ATTRS = {
       
    }
    S.extend(Slide, S.Plugin.Switchable, {
        
        initializer: function () {

            
        },
        destructor: function () {

        }
    });
    S.namespace("Plugin");
    S.Plugin.Slide = Slide;

}, "1.0.2", { requires: ["plug-switchable"] });