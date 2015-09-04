/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define, Raphael */


// 
define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'kommTCP', 'wspolne/odswiezajObiekt', 'dodajPojedynczaTabele', 'ustawKolejnosc'], function ($, varGlobal, json, dane, odswiezajObiekt, dodajPojedynczaTabele, ustawKolejnosc) {
    'use strict';

    var init = false,
        idDialog = "#dialogDiagnostykaKolumny",
        intervalId,
        idButtonPowrot,
        daneDoOdswiezania = [],


        zamknij = function () {
            clearInterval(intervalId);
            $(idDialog).remove();
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state);
        },


        otworz = function (_modulyPLC) {
            var div,
                sygnalyPLC = [],
                i,
                szerokoscDialog,
                szerokoscKolumny,
                td,
                tempId,
                table;

            //            if ($(idDialog).length > 0) {
            //                return;
            //            }

            szerokoscDialog = $(window).width() * 0.95;
            div = document.createElement("div");
            $(div)
                .addClass('OknaDialog')
                .addClass('ui-corner-all')
                .attr('id', idDialog.replace("#", ""));
            $('body').append(div);

            // ustawienie szerokości kolumn, maxymalnie 3 kolumny
            if (_modulyPLC.length > 3) {
                //console.log('>3 ' + _modulyPLC.length);
                szerokoscKolumny = szerokoscDialog / 3.2;
            } else {
                //console.log('<=3 ' + _modulyPLC.length);
                szerokoscKolumny = szerokoscDialog / _modulyPLC.length * 0.95;
            }
            //szerokoscKolumny = szerokoscDialog / 3.2;
            for (i = 0; i < _modulyPLC.length; i += 1) {
                tempId = 'falId_0' + i;
                sygnalyPLC = [];
                //sygnalyPLC = sygnalyPLC.concat(json.szukajWartosciWerWypos(_modulyPLC[i]));
                sygnalyPLC = sygnalyPLC.concat(json.szukajWartosci(_modulyPLC[i]));
                sygnalyPLC = ustawKolejnosc.inicjacja({
                    inputData: sygnalyPLC,
                    sortData: false
                });
                daneDoOdswiezania = daneDoOdswiezania.concat(sygnalyPLC);

                div = document.createElement("div");
                $(div)
                    .attr('id', tempId)
                    .css({
                        'border': '0.1em solid',
                        'border-color': 'grey',
                        'border-radius': '1em',
                        'display': 'inline-block',
                        'margin': '0.1em',
                        'width': szerokoscKolumny
                    });
                $(idDialog).append(div);

                dodajPojedynczaTabele.dodaj({
                    objects: sygnalyPLC,
                    id: '#' + tempId,
                    cssDescription: 'tdOpis',
                    cssValue: 'tdWartosc'
                });
            }

            $(idDialog).dialog({
                autoOpen: false,
                modal: true,
                closeOnEscape: false,
                height: 'auto',
                width: szerokoscDialog,
                title: $(idButtonPowrot).text()
            });
            $(idDialog).dialog("open");
            $(idDialog).addClass("kopex-selected");

            // Odświeżanie to samo w w diagnostyce PLC
            intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                require(['diagnostykaPLC/odswiezaj'], function (odswiezaj) {
                    odswiezaj.aktualizuj(daneDoOdswiezania);
                });
            }, varGlobal.czasOdswiezania);

        },

        // to specjalnie pod tryb serwisowy GUL - wszystkie plansze będą takie same - stąd _sztywneId -> patrz gultrybSerwisowy/nawiMenu/Enter
        start = function (_buttonPowrot, _sztywneId) {
            var modulyPLC = [];

            idButtonPowrot = _buttonPowrot;
            modulyPLC = []; // Wyczyszczenie tablicy z poprzednich wynikow
            modulyPLC = _sztywneId.split("_"); // stworzenie z nazwy buttona tablicy stringow oddzielonych znakiem "_"
            idButtonPowrot = '#' + idButtonPowrot;
            otworz(modulyPLC); // otwarcie okienka dialog
        },


        inicjacja = function () {
            if (!init) {
                init = true;
                $(".diagKol").on("click", function (event, ui) {
                    //start(event.target.id);

                    var modulyPLC = [];

                    idButtonPowrot = event.target.id;
                    modulyPLC = []; // Wyczyszczenie tablicy z poprzednich wynikow
                    modulyPLC = idButtonPowrot.split("_"); // stworzenie z nazwy buttona tablicy stringow oddzielonych znakiem "_"
                    idButtonPowrot = '#' + idButtonPowrot;
                    otworz(modulyPLC); // otwarcie okienka dialog
                });
            }
        };


    return {
        inicjacja: inicjacja,
        start: start,
        zamknij: zamknij
    };
});