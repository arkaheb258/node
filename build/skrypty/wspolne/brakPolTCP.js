/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c=function(c,d,e){var f,g,h,i,j;0===a("#DialogBrakKomunikacjiTCP").length?(i=e?"Błąd komunikacji":b.danePlikuKonfiguracyjnego.TEKSTY.bladKomunikacji,f=document.createElement("div"),a(f).addClass("OknaDialog").addClass("ui-state-error").addClass("ui-corner-all").attr("id","DialogBrakKomunikacjiTCP"),a("body").append(f),j=document.createElement("p"),a(j).addClass("ui-corner-all").text(i).css({"font-weight":"bold","text-decoration":"underline","font-size":"1.0em","text-align":"center",width:"100%"}),a("#DialogBrakKomunikacjiTCP").append(j),j=document.createElement("p"),a(j).attr("id","brakPolTCP1").addClass("ui-corner-all").text(c).css({"font-size":"1.0em","text-align":"center",width:"100%"}),a("#DialogBrakKomunikacjiTCP").append(j),j=document.createElement("p"),a(j).attr("id","brakPolTCP2").addClass("ui-corner-all").text(d).css({"font-weight":"normal","font-size":"1.0em","text-align":"center","font-style":"italic",width:"100%"}),a("#DialogBrakKomunikacjiTCP").append(j),b.hardware.czyMinimumViz?(g=a(document).height()/1.5,h="95%"):(g=a(document).height()/3.5,h="40%"),a("#DialogBrakKomunikacjiTCP").dialog({modal:!0,closeOnEscape:!1,height:g,minHeight:50,width:h,show:{delay:200,effect:b.efektShowHide,duration:350},hide:{effect:b.efektShowHide,duration:350}}),a("#DialogBrakKomunikacjiTCP").siblings(".ui-dialog-titlebar").remove(),a("#DialogBrakKomunikacjiTCP").dialog("open")):(a("#brakPolTCP1").text(c),a("#brakPolTCP2").text(d)),a("#DialogBrakKomunikacjiTCP").one("dialogclose",function(){a("#DialogBrakKomunikacjiTCP").remove()})};return{inicjacja:c}});