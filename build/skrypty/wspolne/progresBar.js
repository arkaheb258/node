/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c="#DialogProgressbar",d=function(){var d,e,f,g,h=new a.Deferred;return d=document.createElement("div"),a(d).addClass("OknaDialog").attr("id",c.replace("#","")),a("body").append(d),a(c).dialog({modal:!0,width:"40%",height:a(document).height()/5,show:{delay:200,effect:b.efektShowHide,duration:350},hide:{delay:200,effect:b.efektShowHide,duration:350},close:function(){a(this).parent().promise().done(function(){a(c).remove()})}}),a(c).siblings(".ui-dialog-titlebar").remove(),b.czyAnimacjeMale===!1&&(a(c).dialog("option","show",!1),a(c).dialog("option","hide",!1)),d=document.createElement("div"),a(d).attr("id","progressbar").css({width:"80%","text-align":"center","margin-left":"auto","margin-right":"auto",position:"relative",top:"20%"}),f=document.createElement("div"),a(f).attr("id","progressLabel").text(b.danePlikuKonfiguracyjnego.TEKSTY.paramWys).css({"letter-spacing":"0.5em",width:"100%","float":"left","line-height":"200%","font-weight":"bold"}),a(d).append(f),a(c).append(d),e=document.createElement("p"),a(e).attr("id","ptekstBledu").addClass("ui-corner-all").text("").css({position:"relative",top:"30%","text-align":"center",width:"100%"}),a(c).append(e),a("#progressbar").progressbar({value:!1}),setTimeout(function(){g=a("#progressbar").find(".ui-progressbar-value"),b.czyBladWyslaniaJSON?(g.css({background:"red"}),a(f).text(b.danePlikuKonfiguracyjnego.TEKSTY.paramBlad),a(e).text(b.kodBleduWysylania)):(g.css({background:"green"}),a(f).text(b.danePlikuKonfiguracyjnego.TEKSTY.paramOK)),setTimeout(function(){a(c).dialog("close"),b.kodBleduWysylania="",h.resolve(!0)},2e3)},1500),h.promise()};return{inicjacja:d}});