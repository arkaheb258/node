/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c=function(c){switch(c){case b.kodyKlawiszy.escape:a("#DialogEdycjaRozkazu").length>0&&require(["rozkazy/edytuj"],function(a){a.zamknij()});break;case b.kodyKlawiszy.enter:require(["rozkazy/edytuj"],function(a){a.wyslijpBrak()})}};return{wykonaj:c}});