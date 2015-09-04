/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'kommTCP', 'dodajPojedynczaTabele'], function ($, varGlobal, json, dane, dodajPojedynczaTabele) {
    'use strict';

    var tablicaZezwolen = [],
        intervalId,

        zamknijPopUp = function () {
            clearInterval(intervalId);
            $("#DialogZezwoleniaNaped").dialog('close');
        },

        odswiezajDane = function () {
            var i,
                maska,
                button_id,
                length;

            //console.log('odswiezanie');
            length = tablicaZezwolen.length;
            for (i = 0; i < length; i += 1) {
                maska = 1;
                maska = maska << tablicaZezwolen[i].poz_bit; // Ustawienie maski na odpowiedniej pozycji
                button_id = tablicaZezwolen[i].id;

                if (dane.daneTCP.bit[tablicaZezwolen[i].poz_ramka] & maska) {
                    $("#" + button_id).css({ // Dla wejsc cyfrowych kolor zielony
                        backgroundColor: 'green' // lime
                    });
                } else {
                    $("#" + button_id)
                        .css({
                            backgroundColor: ''
                        });
                }
            }
        },


        wyswietlPopUp = function (obiekt) {
            var i,
                div;
            //fragmentHtml = document.createDocumentFragment();

            tablicaZezwolen = []; // wyczyszczenie poprzedniej paczzki danych
            $("#DialogZezwoleniaNaped").empty();
            $("#DialogZezwoleniaNaped").dialog("option", "width", '55%'); // Ustawienie szerokosci okienka
            $("#DialogZezwoleniaNaped").dialog("option", "title", obiekt.opis_pelny); // Nadanie tytulu okienku

            $.each(varGlobal.sygnaly, function (key, val) {
                var aktualnyObiekt = this;
                $.each(aktualnyObiekt, function (k, v) {
                    if ((v === obiekt.id) && (k === 'grupa')) {
                        tablicaZezwolen.push(aktualnyObiekt);
                    }
                });
            });


            $("#DialogZezwoleniaNaped").dialog("open");
            dodajPojedynczaTabele.dodaj({
                objects: tablicaZezwolen,
                id: '#DialogZezwoleniaNaped'
            });
            $("button").button(); // Nadanie stylu jquery

            intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                odswiezajDane(obiekt);
            }, varGlobal.czasOdswiezania);
            //console.log(intervalId);
        },


        inicjacja = function (menu, klasa) { // pobranie danych tylko raz przy starcie wizualizacji
            // tutaj dodanie tylko odpowiednich bitow do ciaglego odswiezania
            //varGlobal.daneDoOdswiezania = varGlobal.daneDoOdswiezania.concat(json.szukajWartosci("pokazStanZezwolen", varGlobal.sygnaly));

            require(['zezwoleniaNapedy/odswiezaj'], function (odswiezaj) { // inicjacja odświeżania dancy
                odswiezaj.inicjacja();
            });

            $("#DialogZezwoleniaNaped").one("dialogclose", function (event, ui) { // po zamknieciu okenka zakonczenie odswieznia danych
                console.log('zakonczenie odswiezania danych - zezwolenia napędów');
                clearInterval(intervalId);
            });


        };


    return { // Metody publiczne
        inicjacja: inicjacja,
        wyswietlPopUp: wyswietlPopUp,
        zamknijPopUp: zamknijPopUp
    };
});