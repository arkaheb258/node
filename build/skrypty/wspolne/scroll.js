/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne","scrollTo"],function(a){"use strict";var b=function(){var b,c;b=a("#menu").find(".ui-state-focus").parent(),c=a("#menu").find(".ui-state-focus").parent().index(),a("#DialogParametry").stop().scrollTo(b,800,{offset:-50})},c=function(){var b,c,d,e;b=a("#menuRozkazy").find(".ui-state-focus").parent(),c=a("#menuRozkazy").find(".ui-state-focus").parent().index(),d=a(b).parent(),e=d.find("li:eq("+c+")"),a("#DialogRozkazy").stop().scrollTo(e,800,{})},d=function(){var b,c;b=a(".ui-selected"),c=a(b).parent().parent(),a(c).stop().scrollTo(b,800,{offset:-50})},e=function(b){var c;c=a(b).parent(),a(c).stop().scrollTo(b,800,{offset:-50})},f=function(a){a.parent().parent().scrollTo(0)};return{komunikaty:d,komunikatyTop:f,parametry:b,rozkazyPLC:c,eks:e}});