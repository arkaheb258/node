/*! Data kompilacji: Tue Jul 28 2015 11:01:42 */
define(["jquery","zmienneGlobalne"],function(a,b){"use strict";var c=function(){var a={dostepne:0,zalozone:0,max:0};switch(b.poziomDostepu){case"Brak":a.max="0";break;case"User":case"User2":a.max=b.blokady.maxUser,a.zalozone=b.blokady.zalUser;break;case"Srvc":a.max=b.blokady.maxSrvc,a.zalozone=b.blokady.zalSrvc;break;case"Adv":a.max=b.blokady.maxAdv,a.zalozone=b.blokady.zalAdv}return a.dostepne=a.max-a.zalozone,a.dostepne<0&&(a.dostepne=0),a};return{inicjacja:c}});