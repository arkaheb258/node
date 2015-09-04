/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define*/


define(['jquery', 'kommTCP', 'wspolne/odswiezajObiekt'], function ($, dane, odswiezajObiekt) {
    'use strict';


    var aktualizuj = function (_daneWej) {
        var i,
            daneTCP,
            length;

        //console.log(daneTCP);
        daneTCP = dane.daneTCP;
        length = _daneWej.length;
        for (i = 0; i < length; i += 1) {
            // ------------------------------
            // dane typu analog
            // ------------------------------
            if (_daneWej[i].typ_danych === "Analog" && daneTCP.analog[_daneWej[i].poz_ramka] !== undefined) {
                odswiezajObiekt.typAnalog(_daneWej[i]);
            }

            // ------------------------------
            // dane typu lista
            // ------------------------------
            if (_daneWej[i].typ_danych === "Lista") {
                odswiezajObiekt.typLista(_daneWej[i]);
            }

            // ------------------------------
            // dane typu bit
            // ------------------------------
            if (_daneWej[i].typ_danych === "Bit") { // Wyswietlenie danych bitowych
                if ((_daneWej[i].jednostka === "DO") || (_daneWej[i].jednostka === "Lampka") || (_daneWej[i].jednostka === "LED")) {
                    odswiezajObiekt.typBit(_daneWej[i], 'transparent', 'darkOrange');
                } else if ((_daneWej[i].jednostka === "error") || (_daneWej[i].jednostka === "CAN")) {
                    odswiezajObiekt.typBit(_daneWej[i], 'transparent', 'darkred');
                } else if ((_daneWej[i].jednostka === "DI") || (_daneWej[i].jednostka === "NAM")) {
                    odswiezajObiekt.typBit(_daneWej[i], 'transparent', 'green');
                } else {
                    odswiezajObiekt.typBit(_daneWej[i], 'transparent', 'green');
                }
            }
        }
    };


    return {
        aktualizuj: aktualizuj
    };

});