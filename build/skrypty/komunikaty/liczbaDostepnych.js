/*! Data kompilacji: Fri Oct 03 2014 10:52:28 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c=function(){var a={dostepne:0,zalozone:0,max:0};switch(b.poziomDostepu){case"Brak":a.max="0";break;case"User":a.max=b.blokady.maxUser,a.zalozone=b.blokady.zalUser;break;case"Srvc":a.max=b.blokady.maxSrvc,a.zalozone=b.blokady.zalSrvc;break;case"Adv":a.max=b.blokady.maxAdv,a.zalozone=b.blokady.zalAdv}return a.dostepne=a.max-a.zalozone,a};return{inicjacja:c}});