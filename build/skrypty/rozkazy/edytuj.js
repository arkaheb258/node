/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","zmienneGlobalne","obslugaJSON"],function(a,b,c){"use strict";var d,e="#DialogEdycjaRozkazu",f=[],g=function(){var b;b=a("#keyboard").keyboard().getkeyboard(),void 0!==b&&b.isVisible()&&(b.close(),b.destroy()),a(e).empty(),a(e).remove(),a("#menuRozkazy").addClass("kopex-selected")},h=function(){setTimeout(function(){g()},500),void 0!==d.rozkaz.ioEmit?require(["kommTCP"],function(a){a.rozkazSIO(d.rozkaz)}):(require(["progresBar"],function(a){a.inicjacja({show:!0,status:"sending"})}),c.wyslij(d.rozkaz),console.log(d.rozkaz))},i=function(e){var f,h=!1;f=a("#keyboard").keyboard().getkeyboard(),isNaN(e)?h=!1:(e=Number(e).toFixed(d.PREC),e=Number(e),h=e<d.MIN||e>d.MAX?!1:!0),h?(void 0!==d.rozkaz.pozycja&&(d.rozkaz.pozycja=e),void 0!==d.rozkaz.wartosc&&(d.rozkaz.wartosc=e),f.close(),f.destroy(),require(["progresBar"],function(a){a.inicjacja({show:!0,status:"sending"})}),setTimeout(function(){g()},500),c.wyslij(d.rozkaz)):setTimeout(function(){f.$el.val(b.danePlikuKonfiguracyjnego.TEKSTY.paramZlaWartosc),setTimeout(function(){f.$el.val("")},1500)},200),console.log(d.rozkaz)},j=function(){a("#keyboard").bind("canceled.keyboard",function(){setTimeout(function(){g()},500)}),a("#keyboard").bind("accepted.keyboard",function(a,b,c){i(c.value)})},k=function(){var c,e,g;c=document.createElement("div"),a(c).addClass("OknaDialog").attr("id","DialogEdycjaRozkazu"),a("body").append(c),a("#DialogEdycjaRozkazu").dialog({autoOpen:!1,modal:!0,closeOnEscape:!1,width:"55%",height:a(document).height()/1.75,title:d.OPIS,buttons:[{disabled:!0,text:b.danePlikuKonfiguracyjnego.TEKSTY.zatwierdz},{disabled:!0,text:b.danePlikuKonfiguracyjnego.TEKSTY.anuluj}]}),a("#menuRozkazy").removeClass("kopex-selected"),void 0===d.MIN?(a("#DialogEdycjaRozkazu").addClass("kopex-selected"),a("#DialogEdycjaRozkazu").dialog("option","height","auto"),e="ustawAntykolizje1"===d.id?b.danePlikuKonfiguracyjnego.TEKSTY.ustawAntykolizje1:"ustawAntykolizje2"===d.id?b.danePlikuKonfiguracyjnego.TEKSTY.ustawAntykolizje2:b.danePlikuKonfiguracyjnego.ROZKAZY[f[0]].OPIS+" - "+d.OPIS,g=document.createElement("p"),a(g).attr("id","pParametrOpis").html(e).css({padding:"0.4em",border:"0.1em solid","border-color":"grey","font-style":"italic","font-size":"1.2em","text-align":"center","border-radius":"0.5em",width:"95%"}),a("#DialogEdycjaRozkazu").append(g)):require(["wspolne/dodajKlawiature"],function(a){d.TYP="pLiczba",a.inicjacja(d,"DialogEdycjaRozkazu"),j()}),a("#DialogEdycjaRozkazu").dialog("open")},l=function(){a("#menuRozkazy").one("menuselect",function(c,e){var g=e.item.attr("id");return f=g.split("__"),c.preventDefault(),e.item.hasClass("ui-state-disabled")?void a("#menuRozkazy").menu("next"):(d=b.danePlikuKonfiguracyjnego.ROZKAZY[f[0]].zawartosc[f[1]],void k())})};return{inicjacja:l,zamknij:g,wyslijpBrak:h}});