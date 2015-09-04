/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery', 'zmienneGlobalne', 'obslugaJSON'], function ($, varGlobal, json) {
    'use strict';

    var pasujaceObiekty,
        modulyGauge = [],
        idDialog = "#dialogDiagnostykaGauge", // tak będzie nazwane okienko popup
        idButtonPowrot, // po zamknięciu caego okienka dialog powrot na button w zakladce tab ustawienia
        intervalId,
        init = false,


        zamknij = function () {
            $(idDialog).trigger('dialogclose');
        },


        otworz = function () {
            var div,
                i,
                input,
                label,
                button,
                tabela;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                //console.log($(idButtonPowrot).text());
                $(idDialog).dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: false,
                    height: 'auto', // ($(document).height() / 2.5)
                    width: '98%',
                    title: $(idButtonPowrot).text() //varGlobal.danePlikuKonfiguracyjnego.MENU_ZMIANA_PLC.tytul
                });

                div = document.createElement("div"); // stworzenie radiobuttona z nazwami modulow PLC
                $(div)
                    .addClass('kontenerGauge')
                    .attr('id', 'idDivGauge')
                    .attr('text', 'bla bla');
                $(idDialog).append(div);

                require(['diagnostykaGauge/oknoAnalogi2'], function (noweOkno) {
                    $("#dialogDiagnostykaGauge").addClass("kopex-selected");
                    noweOkno.inicjacja(pasujaceObiekty);
                });
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
                $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button wywołujący
            });
        },


        inicjacja = function () {
            var i;

            if (!init) {
                init = true;
                $(".gauge").on("click", function (event, ui) {
                    idButtonPowrot = event.target.id;

                    pasujaceObiekty = []; // wyczyszczenie tablicy z poprzedniego wyszukiwania
                    modulyGauge = []; // Wyczyszczenie tablicy z poprzednich wynikow
                    modulyGauge = idButtonPowrot.split("_"); // stworzenie z nazwy buttona tablicy stringow oddzielonych znakiem "_"
                    for (i = 0; i < modulyGauge.length; i += 1) {
                        // pasujaceObiekty = pasujaceObiekty.concat(json.szukajWartosciWerWypos(modulyGauge[i])); // przeszukanie tablicy pod katem pasujacych id i scalenie wynikow
                        pasujaceObiekty = pasujaceObiekty.concat(json.szukajWartosci(modulyGauge[i], varGlobal.sygnaly));
                    }
                    idButtonPowrot = '#' + idButtonPowrot;
                    otworz(); // otwarcie okienka dialog
                });
            }
        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij
    };


});