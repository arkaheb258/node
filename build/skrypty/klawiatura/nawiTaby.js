/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne","komunikaty/uaktualnijStatus","tab1ktw/main"],function(a,b,c,d){"use strict";var e,f,g=function(g){var h=0,i=function(){1===f&&(a("#accordion").accordion("option","active",0),a("#accordion").addClass("kopex-selected"),require(["komunikaty/tooltip"],function(a){a.naAccordionie(0)}))},j=function(){"string"==typeof b.buttonMemory[f]&&a("#"+b.buttonMemory[f]).addClass("kopex-selected").addClass(b.ui_state)};switch(h=a("#tabs").children().children("li").length-1,f=a("#tabs").tabs("option","active"),g){case b.kodyKlawiszy.lewo:0===f?(f=h,a("#tabs").tabs("option","active",f)):(f-=1,a("#tabs").tabs("option","active",f)),j(),i();break;case b.kodyKlawiszy.prawo:f===h?(f=0,a("#tabs").tabs("option","active",f)):(f+=1,a("#tabs").tabs("option","active",f),i()),j();break;case b.kodyKlawiszy.gora:0===f?c.dodajTekstKomunikatu("next"):(e=a("#tabs ul>li a").eq(f).attr("href"),a(e).find(".przyciskMenuGlowne").last().addClass("kopex-selected").addClass(b.ui_state));break;case b.kodyKlawiszy.dol:0===f?c.dodajTekstKomunikatu("prev"):(e=a("#tabs ul>li a").eq(f).attr("href"),a(e).find(".przyciskMenuGlowne").first().addClass("kopex-selected").addClass(b.ui_state));break;case b.kodyKlawiszy.enter:0===f&&require(["wspolne/wersjaInfo"],function(a){a.inicjacja()});break;case b.kodyKlawiszy.escape:0===f&&(a("#tab1_komunikat").hasClass("ui-state-error")||a("#tab1_komunikat").hasClass("ui-state-highlight")?d.stworzZegar():(d.stworzOstatniKomunikat(),c.dodajTekstKomunikatu("first")))}};return{wykonaj:g}});