/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define, Raphael */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'kommTCP', 'wspolne/odswiezajObiekt', 'dodajPojedynczaTabele'], function ($, varGlobal, json, dane, odswiezajObiekt, dodajPojedynczaTabele) {
    'use strict';

    var init = false,
        liczniki = [],
        intervalId,
        idButtonPowrot,


        zamknij = function () {
            clearInterval(intervalId);
            $("#DialogLiczniki").remove();
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state);
        },


        odswiezaj = function () {
            var wartoscAnaloguPoPrzeliczeniu,
                i,
                button_id,
                daneTCP;

            daneTCP = dane.daneTCP;
            for (i = 0; i < liczniki.length; i += 1) {
                odswiezajObiekt.typAnalog(liczniki[i]);
            }
        },


        dodajElementyTabeli = function () {
            $("#DialogLiczniki").dialog("option", "height", 'auto');
            $("#DialogLiczniki").dialog("open");
            dodajPojTabele2.dodaj({
                objects: liczniki,
                id: '#DialogLiczniki'
            });
            $("#DialogLiczniki").addClass("kopex-selected");

            intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                odswiezaj();
            }, varGlobal.czasOdswiezania);
        },



        otworz = function () {
            var div,
                p;

            if (init === false) { // pobranie informacji o danych potrzebnych do odswiezania (pozycja w ramce, bitu itp)
                liczniki = liczniki.concat(json.szukajWartosci("licznikiCzasuPracyCalkowite", varGlobal.sygnaly));
                liczniki = liczniki.concat(json.szukajWartosci("licznikiCzasuPracyDzienne", varGlobal.sygnaly));
                init = true;
                //console.log(liczniki);
            }

            div = document.createElement("div");
            $(div)
                .addClass('OknaDialog')
                .addClass('ui-corner-all')
                .attr('id', 'DialogLiczniki');
            $('body').append(div);

            $("#DialogLiczniki").dialog({
                autoOpen: false,
                modal: true,
                closeOnEscape: false,
                height: ($(document).height() / 1.2), // ($(document).height() / 1.2)                  'auto'
                width: '70%',
                title: 'Liczniki czasu pracy'
            });

            dodajElementyTabeli();
        },


        inicjacja = function (idButtona) {
            //console.log('inicjacja - liczniki');
            idButtonPowrot = '#' + idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });
        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij
    };
});