/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c,d=function(){var d,e,f,g,h,i,j=function(c){for(d=0;4>d;d+=1)0===d?("#listaAlarmy"===c&&(h=b.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbAlrm+" "+b.komunikaty.alarmy),"#listaOstrzezenia"===c&&(h=b.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbOstrz+" "+b.komunikaty.ostrz),i="",g=!0):("#listaAlarmy"===c&&(i="ui-state-error"),"#listaOstrzezenia"===c&&(i="ui-state-highlight"),a(c).find("li").eq(d-1).length>0?(h=d+") "+a(c).find("li").eq(d-1).text(),g=!0):g=!1),g&&(f=document.createElement("p"),a(f).attr("id","komm_"+d).addClass("ui-corner-all").addClass(i).text(h).css({padding:"0.1em","padding-left":"0.5em",margin:"0.2em","font-size":"1.0em","text-align":"left",height:"100%",width:"99%"}),a("#DialogPopUpKomunikaty").append(f))};0===a("#DialogPopUpKomunikaty").length?(e=document.createElement("div"),a(e).addClass("OknaDialog").addClass("ui-corner-all").attr("id","DialogPopUpKomunikaty").css({"justify-content":"center","text-align":"center"}),a("body").append(e),j("#listaAlarmy"),j("#listaOstrzezenia"),a("#DialogPopUpKomunikaty").dialog({modal:!1,closeOnEscape:!0,height:"auto",width:"90%",show:{delay:200,effect:"clip",duration:500},hide:{effect:"clip",duration:300},position:{my:"center",at:"bottom",of:window}}),a("#DialogPopUpKomunikaty").siblings(".ui-dialog-titlebar").remove(),a("#DialogPopUpKomunikaty").dialog("open")):console.log("popupalarm juz otwarty - zmiana tekstu"),clearTimeout(c),c=setTimeout(function(){a("#DialogPopUpKomunikaty").dialog("close")},1e4),a("#DialogPopUpKomunikaty").on("dialogclose",function(){a("#DialogPopUpKomunikaty").remove()})};return{inicjacja:d}});