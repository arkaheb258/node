/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","obslugaJSON","zmienneGlobalne","kommTCP","wspolne/odswiezajObiekt","grafikaGUL/main","paper"],function(a,b,c,d,e,f,g){"use strict";var h=!1,i=[],j=function(){h===!1&&(i=i.concat(b.szukajWartosci("grFalownikNL",c.sygnaly)),i=i.concat(b.szukajWartosci("grFalownikNP",c.sygnaly)),i=i.concat(b.szukajWartosci("grFalownikNR",c.sygnaly)),h=!0)},k=function(){var b,c,h;g.view.onFrame=function(g){if(0===a("#tabs").tabs("option","active")&&g.count%12===0)for(h=i.length,b=0;h>b;b+=1)"Bit"===i[b].typ_danych&&"grafikaTab1Krancowki"===i[b].grupa&&(c=e.typBitStan(i[b]),f.odswiezKrancowke(i[b],c)),"Lista"===i[b].typ_danych&&"idKierunekJazdy"===i[b].id&&f.odswiezJazde(e.typAnalog(i[b])),"Analog"===i[b].typ_danych&&void 0!==d.daneTCP.analog[i[b].poz_ramka]&&("grafikaTab1Analog"===i[b].grupa||"grafikaTab1Analog"===i[b].grupa_2)&&f.odswiezAnalog(i[b],e.typAnalog(i[b]))}},l=function(){j(),k()};return{inicjacja:l}});