/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","zmienneGlobalne","obslugaJSON","wspolne/dodajMenu2"],function(a,b,c,d){"use strict";var e,f,g,h="#DialogParametry",i=!1,j=function(c,d){var e;0===a(h).length?(e=document.createElement("div"),a(e).addClass("OknaDialog").addClass("ui-corner-all").attr("id",h.replace("#","")),a("body").append(e),a(h).dialog({modal:!0,closeOnEscape:!1,height:a(document).height()/2,width:"55%",title:c,show:{delay:200,effect:b.efektShowHide,duration:350},hide:{effect:b.efektShowHide,duration:350}}),a(h).append(d),a("button").button(),a(h).dialog("open")):(a(h).empty(),a(h).append(d),a("button").button(),a(h).dialog("open")),a(h).one("dialogclose",function(){a(h).remove()})},k=function(){var c=document.createDocumentFragment();i?(c=d.dodajElementyHtml(b.danePlikuKonfiguracyjnego.MENU_PAR,"przyciskMenuParametry"),j(e,c),d.allignVertical(h),i=!1,a("#"+f).addClass("kopex-selected").addClass(b.ui_state)):(a(h).empty(),a(h).dialog("close"),a(g).addClass("kopex-selected").addClass(b.ui_state))},l=function(){require(["progresBar"],function(a){a.inicjacja({show:!0,status:"sending"}).done(function(){require(["alert"],function(a){a.inicjacja({texts:[b.danePlikuKonfiguracyjnego.TEKSTY.uruchomPonownie],background:"ui-state-default",timer:5e3})})})}),c.wyslij(b.doWyslania.parametrPlik),console.log(b.doWyslania.parametrPlik)},m=function(c){var e,g,m,n=function(c){for(g=b.danePlikuKonfiguracyjnego.MENU_PAR,e=0;e<g.length;e+=1)g[e].id===c&&(m=d.dodajElementyHtml(g[e].zawartosc,"przyciskMenuParametry"),j(a("#"+c).text(),m),d.allignVertical(h),a(h).children().first().addClass("kopex-selected").addClass(b.ui_state))};switch(c){case"mg_edycja":f=c,require(["parametry/listaParametrow"],function(a){a.inicjacja()});break;case"mg_domyslne":f=c,n(c),i=!0;break;case"mg_wczytaj":f=c,n(c),i=!0;break;case"mg_zapisz":f=c,n(c),i=!0;break;case"mg_poziomDostepu":require(["poziomDostepu/main"],function(a){a.otworzMenu()});break;case"ms_nie":k();break;case"default":b.doWyslania.parametrPlik.plik="default",b.doWyslania.parametrPlik.akcja="load",l();break;case"loadFileUser1":b.doWyslania.parametrPlik.plik="user1",b.doWyslania.parametrPlik.akcja="load",l();break;case"loadFileUser2":b.doWyslania.parametrPlik.plik="user2",b.doWyslania.parametrPlik.akcja="load",l();break;case"loadFileUser3":b.doWyslania.parametrPlik.plik="user3",b.doWyslania.parametrPlik.akcja="load",l();break;case"loadFileUser4":b.doWyslania.parametrPlik.plik="user4",b.doWyslania.parametrPlik.akcja="load",l();break;case"loadFileUser5":b.doWyslania.parametrPlik.plik="user5",b.doWyslania.parametrPlik.akcja="load",l();break;case"saveFileUser1":b.doWyslania.parametrPlik.plik="user1",b.doWyslania.parametrPlik.akcja="save",l();break;case"saveFileUser2":b.doWyslania.parametrPlik.plik="user2",b.doWyslania.parametrPlik.akcja="save",l();break;case"saveFileUser3":b.doWyslania.parametrPlik.plik="user3",b.doWyslania.parametrPlik.akcja="save",l();break;case"saveFileUser4":b.doWyslania.parametrPlik.plik="user4",b.doWyslania.parametrPlik.akcja="save",l();break;case"saveFileUser5":b.doWyslania.parametrPlik.plik="user5",b.doWyslania.parametrPlik.akcja="save",l()}},n=function(){var c=document.createDocumentFragment();c=d.dodajElementyHtml(b.danePlikuKonfiguracyjnego.MENU_PAR,"przyciskMenuParametry"),j(e,c),d.allignVertical(h),a(h).children().first().addClass("kopex-selected").addClass(b.ui_state)},o=function(){g="#idParametry",e=a("#idParametry").text(),a("#idParametry").on("click",function(){n()})};return{inicjacja:o,stworzMenuGlowne:n,subMenu:m,zamkniecieOkienka:k}});