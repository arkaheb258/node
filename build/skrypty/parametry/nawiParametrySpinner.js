/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c,d=function(d){switch(d){case b.kodyKlawiszy.gora:a("#spinner").formatSpinner("stepUp");break;case b.kodyKlawiszy.dol:a("#spinner").formatSpinner("stepDown");break;case b.kodyKlawiszy.enter:c=a("#spinner").formatSpinner("value"),require(["parametry/edycjaParametru"],function(a){a.wyslijListeDoPLC(c)});break;case b.kodyKlawiszy.escape:a("#DialogEdycjaParametru").empty(),a("#DialogEdycjaParametru").dialog("close"),a("#menu").addClass("kopex-selected")}};return{wykonaj:d}});