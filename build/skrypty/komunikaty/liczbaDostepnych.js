/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var ccc,

        inicjacja = function () {
            var blokady = {
                dostepne: 0,
                zalozone: 0,
                max: 0
            };

            switch (varGlobal.poziomDostepu) {
            case 'Brak':
                blokady.max = '0';
                break;

            case 'User':
            case 'User2':
                blokady.max = varGlobal.blokady.maxUser;
                blokady.zalozone = varGlobal.blokady.zalUser;
                break;

            case 'Srvc':
                blokady.max = varGlobal.blokady.maxSrvc;
                blokady.zalozone = varGlobal.blokady.zalSrvc;
                break;

            case 'Adv':
                blokady.max = varGlobal.blokady.maxAdv;
                blokady.zalozone = varGlobal.blokady.zalAdv;
                break;
            }

            //console.log(blokady.max + ' ' + blokady.zalozone);
            blokady.dostepne = blokady.max - blokady.zalozone;
            if (blokady.dostepne < 0) { // czasami PLC po świeżym wydaniu softu ma bardzo dużo założonych blokad i pojawia się liczba ujemna
                blokady.dostepne = 0;
            }

            return blokady;
        };


    return {
        inicjacja: inicjacja
    };
});