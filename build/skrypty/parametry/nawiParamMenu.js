/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c=function(a,c){switch(c.blur(),a){case b.kodyKlawiszy.gora:if(!c.prev().hasClass("przyciskMenuParametry"))return;c.removeClass("kopex-selected").removeClass(b.ui_state),c.prev().addClass("kopex-selected").addClass(b.ui_state);break;case b.kodyKlawiszy.dol:if(!c.next().hasClass("przyciskMenuParametry"))return;c.removeClass("kopex-selected").removeClass(b.ui_state),c.next().addClass("kopex-selected").addClass(b.ui_state);break;case b.kodyKlawiszy.enter:require(["parametry/main"],function(a){a.subMenu(c.attr("id"))});break;case b.kodyKlawiszy.escape:require(["parametry/main"],function(a){a.zamkniecieOkienka()});break;default:return}};return{wykonaj:c}});