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
        intervalId,
        daneDoOdswiezania = [],



        dodajDaneDoOdswiezania = function () {
            if (init === false) {
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("pokazStanZezwolen", varGlobal.sygnaly));
                init = true;
                //console.log(daneDoOdswiezania);
            }
        },


        otworzPopUp = function (obiekt) {
            require(['ksiazkaserwisowa/przypomnienie'], function (przypomnienie) {
                przypomnienie.inicjacja(obiekt);
            });
        },

        pokazZezwoleniaDlaNapedow = function (obiekt, operacja) {
            require(['wspolne/zezwNapedy'], function (zezwNapedy) {
                if (operacja === 'otworz') {
                    zezwNapedy.wyswietlPopUp(obiekt);
                }
                if (operacja === 'zamknij') {
                    zezwNapedy.zamknijPopUp();
                }
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

                    if (daneDoOdswiezania[i].grupa === "pokazStanZezwolen") { // wyswietlenie okienka popup ze stanem zezwolen dla napedu
                        if (dane.daneTCP.bit[daneDoOdswiezania[i].poz_ramka] & maska) { // polecenie wyswietlenia okienka popup
                            if ($("#DialogZezwoleniaNaped").dialog("isOpen") === false) { // jesli nie ma otwartego okienka do odswiezania -> stworz nowe
                                pokazZezwoleniaDlaNapedow(daneDoOdswiezania[i], 'otworz');
                            }
                        } else { // polenie zamkniecia okienka
                            if ($("#DialogZezwoleniaNaped").dialog("isOpen")) { // jesli jest otwarte okienko -> zamknij

                                pokazZezwoleniaDlaNapedow(daneDoOdswiezania[i], 'zamknij');
                            }
                        }
                    }


                }
            }
        },


        inicjacja = function (obiekt) {

            dodajDaneDoOdswiezania();

            intervalId = setInterval(function () {
                odswiezajDane();
            }, varGlobal.czasOdswiezania);

        };


    return {
        inicjacja: inicjacja

    };
});
