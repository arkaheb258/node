/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","zmienneGlobalne","dodajPojedynczaTabele","obslugaJSON","komunikaty/uaktualnijStatus"],function(a,b){"use strict";var c=function(){var c;a("#tab1_komunikat").removeClass("ui-state-error").removeClass("ui-state-highlight").addClass("ui-state-default").empty(),c=document.createElement("p"),a(c).attr("id","p_dataCzas").text(b.data).css({"text-align":"center","font-weight":"bold","font-size":"4.0em",margin:"0.1em"}).appendTo("#tab1_komunikat")},d=function(){var c,d,e;d=b.komunikaty.alarmy>0?"ui-state-error":(0===b.komunikaty.alarmy&&b.komunikaty.ostrz>0,"ui-state-highlight"),a("#tab1_komunikat").removeClass("ui-state-default").addClass(d).empty(),c=document.createElement("p"),a(c).attr("id","p_tekstAlarmu").text("").css({padding:"0.4em",margin:"1px",height:"50%","font-size":"1.1em","font-weight":"bold"}).appendTo("#tab1_komunikat"),c=document.createElement("p"),a(c).attr("id","p_liczbaAlarmow").css({margin:"1px",padding:"1px","font-weight":"normal"}).appendTo("#tab1_komunikat"),c=document.createElement("p"),a(c).css({"margin-top":"0.5em","font-weight":"normal"}).text(b.danePlikuKonfiguracyjnego.TEKSTY.tab1Nawi),e=document.createElement("span"),a(e).addClass("ui-icon").addClass("ui-icon-circle-arrow-n").css({"float":"left"}).appendTo(c),e=document.createElement("span"),a(e).addClass("ui-icon").addClass("ui-icon-circle-arrow-s").css({"float":"left"}).appendTo(c),a(c).appendTo("#tab1_komunikat")},e=function(d){var e,f,g,h=new a.Deferred,i=document.createDocumentFragment(),j=function(){f=.95*(a("#tab1").height()-a("#tab1_info1").outerHeight()-a("#tab1_info2").outerHeight()),e=document.createElement("div"),a(e).attr("id","grafika").css({height:f}).addClass("ui-corner-all"),a("#tab1").append(e),c(),a("#grafika").length>0&&h.resolve(!0)};switch(e=document.createElement("div"),a(e).attr("id","tab1_info1").css({}).addClass("ui-corner-all"),g=document.createElement("div"),a(g).attr("id","tab1_komunikat").css({}).addClass("ui-corner-all").appendTo(e),g=document.createElement("div"),a(g).attr("id","tab1_statusy").css({}).addClass("ui-corner-all").appendTo(e),a(i).append(e),e=document.createElement("div"),a(e).attr("id","tab1_info2").css({height:"auto"}).addClass("ui-corner-all"),g=document.createElement("div"),a(g).attr("id","tab1_dol1").addClass("ui-corner-all").appendTo(e),g=document.createElement("div"),a(g).attr("id","tab1_dol2").addClass("ui-corner-all").appendTo(e),g=document.createElement("div"),a(g).attr("id","tab1_dol3").addClass("ui-corner-all").appendTo(e),a(i).append(e),a("#tab1").append(i),d){case b.identyfikatorKombajnu.ktw:require(["tab1/statusyKTW"],function(a){a.inicjacja(),j()});break;case b.identyfikatorKombajnu.gul:require(["tab1/statusyGUL"],function(a){a.inicjacja(),j()})}return h.promise()};return{inicjacja:e,stworzZegar:c,stworzOstatniKomunikat:d}});