/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c,d=function(b){void 0!==c&&(b?a("#DialogPopUpAntykolizja").dialog("isOpen")===!1&&c.show():c.hide())},e=function(d){var e;e=a("#grafika").height()-30,c=d.setStart(),d.rect(50,e,a("#grafika").width()-100,30).attr({fill:"red"}),d.text(a("#grafika").width()/2,e+15,b.danePlikuKonfiguracyjnego.TEKSTY.antykolizja2).attr({font:"16px 'Fontin Sans', Fontin-Sans, sans-serif",fill:"white","font-weight":"bold"}),c=d.setFinish(),c.hide()};return{inicjacja:e,antykolizja:d}});