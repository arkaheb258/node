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


        inicjacja = function (nowyPoziom) {
            var tekst;

            switch (nowyPoziom) { // Sprawdzenie jaki aktualnie jest ustawiony poziom dostepu
            case 'Brak':
                varGlobal.poziomDostepu = 'Brak';
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[0];
                break;

            case 'User':
                varGlobal.poziomDostepu = 'User';
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[1];
                break;

            case 'User2':
                varGlobal.poziomDostepu = 'User2';
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[2];
                break;

            case 'Srvc':
                varGlobal.poziomDostepu = 'Srvc';
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[3];
                break;

            case "Adv":
                varGlobal.poziomDostepu = 'Adv';
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[4];
                break;
            }

            $("#poziomDostepuUzytkownika").text(tekst);
            
            return tekst;
        };


    return {
        inicjacja: inicjacja // wywoływanie z funcji poziomDostepu/main
    };
});