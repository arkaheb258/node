/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","obslugaJSON","zmienneGlobalne","kommTCP"],function(a,b,c,d){"use strict";var e=!1,f=[],g=function(){e===!1&&(f=f.concat(b.szukajWartosci("statusWordEKS",c.sygnaly)),e=!0)},h=function(a){require(["ksiazkaserwisowa/przypomnienie"],function(b){b.inicjacja(a)})},i=function(){var a,b,c;for(c=f.length,a=0;c>a;a+=1)"Bit"===f[a].typ_danych&&(b=1,b<<=f[a].poz_bit,d.daneTCP.bit[f[a].poz_ramka]&b&&h(f[a]))},j=function(){g(),setInterval(function(){i()},c.czasOdswiezania)};return{inicjacja:j}});