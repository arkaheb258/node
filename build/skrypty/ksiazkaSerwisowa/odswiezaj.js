/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'obslugaJSON', 'zmienneGlobalne', 'kommTCP'], function ($, json, varGlobal, dane) {
    "use strict";

    var init = false,
        daneDoOdswiezania = [],



        dodajDaneDoOdswiezania = function () {
            if (init === false) {
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("statusWordEKS", varGlobal.sygnaly));
                init = true;
                //console.log(daneDoOdswiezania);
            }
        },


        otworzPopUp = function (obiekt) {
            require(['ksiazkaserwisowa/przypomnienie'], function (przypomnienie) {
                przypomnienie.inicjacja(obiekt);
            });
        },


        odswiezajDane = function () {
            var i,
                maska,
                length;

            length = daneDoOdswiezania.length;
            for (i = 0; i < length; i += 1) {

                if (daneDoOdswiezania[i].typ_danych === "Bit") {
                    maska = 1;
                    maska = maska << daneDoOdswiezania[i].poz_bit; // Ustawienie maski na odpowiedniej pozycji

                    if (dane.daneTCP.bit[daneDoOdswiezania[i].poz_ramka] & maska) {
                        otworzPopUp(daneDoOdswiezania[i]);
                    }
                }
            }
        },


        inicjacja = function (obiekt) {

            dodajDaneDoOdswiezania();

            setInterval(function () {
                odswiezajDane();
            }, varGlobal.czasOdswiezania);

        };


    return {
        inicjacja: inicjacja

    };
});
