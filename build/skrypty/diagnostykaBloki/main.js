/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","zmienneGlobalne","obslugaJSON","wspolne/dodajMenu2"],function(a,b,c,d){"use strict";var e,f,g=[],h=!1,i=[],j="#dialogDiagnostykaBlokiMenu",k=function(d){var f,h,i,k=[],l=[];for(i=g.length,f=0;i>f;f+=1)g[f].NBLK===d&&(l.push(g[f]),g[f].PLCNR!==h&&(k.push(g[f].PLCNR),h=g[f].PLCNR));require(["diagnostykaBloki/wyswietlBlok"],function(d){d.inicjacja(k,l),b.doWyslania.diagnostykaBloku.wWartosc=500,b.doWyslania.diagnostykaBloku.sID=l[0].IDBLK,clearInterval(e),e=setInterval(function(){c.wyslij(b.doWyslania.diagnostykaBloku)},1e3),console.log(b.doWyslania.diagnostykaBloku),k=[],l=[],a(j).children().removeClass("kopex-selected")})},l=function(){var c,g,h,k=document.createDocumentFragment();if(0===a(j).length){for(h=document.createElement("div"),a(h).addClass("OknaDialog").addClass("ui-corner-all").attr("id",j.replace("#","")),a("body").append(h),a(j).dialog({modal:!0,closeOnEscape:!1,height:a(document).height()/2,width:"55%",title:a(f).text()}),c=0;c<i.length;c+=1)g=document.createElement("button"),a(g).text(i[c]).addClass("przyciskMenuDiagnostBlokow").css({width:"75%","font-weight":"normal"}).attr("id",i[c]),a(k).append(g);a(j).append(k),a("button").button(),a(j).children().first().addClass("kopex-selected").addClass(b.ui_state),d.allignVertical(j)}else clearInterval(e),a(j).find("."+b.ui_state).addClass("kopex-selected");a(j).one("dialogclose",function(){a(j).remove(),a(f).addClass("kopex-selected").addClass(b.ui_state)})},m=function(){var a,c,d;for(c=b.diagnostykaBlokow.DANE.length,a=0;c>a;a+=1)parseInt(b.diagnostykaBlokow.DANE[a].WER,10)===b.wersjaWyposazenia&&g.push(b.diagnostykaBlokow.DANE[a]),b.diagnostykaBlokow.DANE[a].NBLK!==d&&parseInt(b.diagnostykaBlokow.DANE[a].WER,10)===b.wersjaWyposazenia&&(i.push(b.diagnostykaBlokow.DANE[a].NBLK),d=b.diagnostykaBlokow.DANE[a].NBLK);l()},n=function(b){f="#"+b,a(f).on("click",function(){h?l():(m(),h=!0)})};return{inicjacja:n,otworzDiagnostykeBloku:k,otworz:l}});