/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c=function(c,d){var e,f,g,h;0===a("#DialogBrakKomunikacjiTCP").length?(e=document.createElement("div"),a(e).addClass("OknaDialog").addClass("ui-state-error").addClass("ui-corner-all").attr("id","DialogBrakKomunikacjiTCP"),a("body").append(e),h=document.createElement("p"),a(h).attr("id","brakPolTCP1").addClass("ui-corner-all").text(c).css({"font-weight":"bold","font-size":"1.0em","text-align":"center",width:"100%"}),a("#DialogBrakKomunikacjiTCP").append(h),h=document.createElement("p"),a(h).attr("id","brakPolTCP2").addClass("ui-corner-all").text(d).css({"font-weight":"normal","font-size":"1.0em","text-align":"center",width:"100%"}),a("#DialogBrakKomunikacjiTCP").append(h),b.danePlikuKonfiguracyjnego.OPCJE.czyNaviRamkaPLC?(f=a(document).height()/4.5,g="40%"):(f=a(document).height()/1.5,g="95%"),a("#DialogBrakKomunikacjiTCP").dialog({modal:!0,closeOnEscape:!0,height:f,width:g,show:{delay:200,effect:b.efektShowHide,duration:350},hide:{effect:b.efektShowHide,duration:350}}),a("#DialogBrakKomunikacjiTCP").siblings(".ui-dialog-titlebar").remove(),a("#DialogBrakKomunikacjiTCP").dialog("open")):(a("#brakPolTCP1").text(c),a("#brakPolTCP2").text(d)),a("#DialogBrakKomunikacjiTCP").one("dialogclose",function(){a("#DialogBrakKomunikacjiTCP").remove()})};return{inicjacja:c}});