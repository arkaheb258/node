/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'kommTCP'], function ($, varGlobal, dane) {
    "use strict";


    var idDial,
        intervalId,
        idDivDaneSurowe = '#idDivDaneSurowe',
        idDivDaneUlozone = '#idDivDaneUlozone',


        zamknij = function () {
            clearInterval(intervalId);
        },


        wyswietlBlokDanych = function (_blokDanych) {
            var length,
                stringDaneSurowe = '',
                stringDaneUlozone = '',
                i,
                ccc,
                init = false,
                licznik,
                licznikDziesiatek,
                dopelnijDo10 = function (_tekst) {
                    var txt = '_' + _tekst.toString();
                    while (txt.length < 8) {
                        txt += '_';
                    }
                    return txt + '|';
                };

            clearInterval(intervalId);
            intervalId = setInterval(function () {
                $(idDivDaneSurowe).empty();
                $(idDivDaneUlozone).empty();

                //console.log(dane.daneTCP['analog']);
                //console.log(dane.daneTCP[_blokDanych]);

                //      _                                                    
                //   __| | __ _ _ __   ___    ___ _   _ _ __ _____      _____ 
                //  / _` |/ _` | '_ \ / _ \  / __| | | | '__/ _ \ \ /\ / / _ \
                // | (_| | (_| | | | |  __/  \__ \ |_| | | | (_) \ V  V /  __/
                //  \__,_|\__,_|_| |_|\___|  |___/\__,_|_|  \___/ \_/\_/ \___|
                stringDaneSurowe = '';
                length = dane.daneTCP[_blokDanych].length;
                stringDaneSurowe = JSON.stringify(dane.daneTCP[_blokDanych], null, 1);
                $(idDivDaneSurowe).append(stringDaneSurowe);

                //      _                          _                          
                //   __| | __ _ _ __   ___   _   _| | ___ _______  _ __   ___ 
                //  / _` |/ _` | '_ \ / _ \ | | | | |/ _ \_  / _ \| '_ \ / _ \
                // | (_| | (_| | | | |  __/ | |_| | | (_) / / (_) | | | |  __/
                //  \__,_|\__,_|_| |_|\___|  \__,_|_|\___/___\___/|_| |_|\___|

                // Pierwsza linijka z numeracją kolumn
                stringDaneUlozone = dopelnijDo10('_');
                for (i = 0; i < 10; i += 1) {
                    stringDaneUlozone += dopelnijDo10(i + '+');
                }
                $(idDivDaneUlozone).append(stringDaneUlozone);
                $(idDivDaneUlozone).append('<br/>');
                $(idDivDaneUlozone).append('<br/>');

                // Dane w kolumnach
                licznik = 0;
                licznikDziesiatek = 0;
                stringDaneUlozone = dopelnijDo10(licznikDziesiatek + '+');
                for (i = 0; i < length; i += 1) {
                    licznik += 1;

                    if (licznik === 10) {
                        licznik = 0;
                        licznikDziesiatek += 10;
                        stringDaneUlozone += dopelnijDo10(dane.daneTCP[_blokDanych][i]);

                        $(idDivDaneUlozone).append(stringDaneUlozone);
                        stringDaneUlozone = '';
                        stringDaneUlozone += dopelnijDo10(licznikDziesiatek + '+'); // rozpoczęcie zapisu nowej linii
                        $(idDivDaneUlozone).append('<br/>');
                    } else {
                        stringDaneUlozone += dopelnijDo10(dane.daneTCP[_blokDanych][i]);
                    }
                }
                if (licznik < 9) { // dopełnienie do 10 ostatniego wiersza tabeli
                    for (i = 0; i < (10 - licznik); i += 1) {
                        stringDaneUlozone += dopelnijDo10('');
                    }
                    $(idDivDaneUlozone).append(stringDaneUlozone);
                }

                $(idDial).dialog("option", "position", { // wycentrowanie okienka
                    my: "center",
                    at: "center",
                    of: window
                });

            }, 500);
        },


        inicjacja = function (_idDialog) {
            var div;

            idDial = _idDialog;
            div = document.createElement("div");
            $(div)
                .attr('id', idDivDaneSurowe.replace("#", ""))
                .css({
                    'border': '0.1em solid',
                    'border-color': 'grey',
                    'border-radius': '1em',
                    'font-size': '90%',
                    'padding': '0.5em',
                    'margin': '1em'
                });
            $(_idDialog).append(div);

            div = document.createElement("div");
            $(div)
                .attr('id', idDivDaneUlozone.replace("#", ""))
                .css({
                    'border': '0.1em solid',
                    'border-color': 'grey',
                    'border-radius': '1em',
                    'padding': '0.5em',
                    'font-size': '115%',
                    'font-family': 'monospace',
                    'text-transform': 'uppercase',
                    'margin': '1em'
                });
            $(_idDialog).append(div);

            // prz starcie pierwsze wyświetlamy analogi
            wyswietlBlokDanych('analog');
        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        wyswietlBlokDanych: wyswietlBlokDanych
    };

});


//if (dane.daneTCP[_blokDanych][i] === undefined) {
//    stringDaneUlozone += dopelnijDo10('_u');
//} else {
//    stringDaneUlozone += dopelnijDo10('_' + dane.daneTCP[_blokDanych][i]);
//}