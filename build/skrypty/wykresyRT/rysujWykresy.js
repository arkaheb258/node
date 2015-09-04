/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define, Raphael */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'd3', 'c3', 'wspolne/odswiezajObiekt'], function ($, varGlobal, json, d3, c3, odswiezajObiekt) {
    'use strict';

    var init = false,
        idDiv = '#idMainDivWykresy',
        czyBrakSeriiDoRysowania = false,
        czyZezwolenieDoRysowania = false,
        chart, // zmienna na której będzie rysowany wykres
        seriaCzas = ['x1', new Date().getTime()],
        seriaDane = ['_1', 5],
        intervalIdLadujDoBufora,
        tablicaObiektow = [],


        getRandomInt = function (_min, _max) {
            return Math.floor(Math.random() * (_max - _min)) + _min;
        },


        getAnalogVal = function (_idZmiennej) {
            var i,
                length,
                wartoscAnalogu;

            length = varGlobal.daneDoWykresow.length;
            for (i = 0; i < length; i += 1) {
                if (varGlobal.daneDoWykresow[i].id === _idZmiennej) {
                    wartoscAnalogu = odswiezajObiekt.typAnalog(varGlobal.daneDoWykresow[i]);
                }
            }
            // nie znaleziono podanego id w strukturze obiektów do rysowania na wykresie
            if (wartoscAnalogu === undefined) {
                wartoscAnalogu = 0;
            }

            return wartoscAnalogu;
        },


        ladujDaneDoBufora = function () {
            var temp01;

            intervalIdLadujDoBufora = setInterval(function () {
                if (czyBrakSeriiDoRysowania) {
                    return;
                }
                if (!czyZezwolenieDoRysowania) {
                    return;
                }

                seriaCzas.push(new Date().getTime()); // uzupełnienie danych
                //seriaDane.push(getRandomInt(20, 30));
                seriaDane.push(getAnalogVal(seriaDane[0]));

                if (seriaCzas.length === 10) { // rysowanie wykresu po uzyskaniu odpowiedniej liczby próbek
                    chart.flow({
                        columns: [
                            seriaCzas,
                            seriaDane
                        ],
                        length: 0,
                        duration: 0,
                        to: new Date().setSeconds(new Date().getSeconds() - 120), // wielkość bufora w sekundach
                        done: function () {}
                    });
                    seriaCzas.length = 1; // zerowanie bufora
                    seriaDane.length = 1;
                }
            }, 200);
        },


        inicjacja = function (_idDialog, _valNoweIdSerii) {
            var div;

            if ($(idDiv).length === 0) { // div w którym ma być rysowany wykres nie istnieje
                seriaDane[0] = _valNoweIdSerii[0];

                div = document.createElement("div");
                $(div)
                    .attr('id', idDiv.replace("#", ""))
                    .css({
                        'border': '0.1em solid',
                        'border-color': 'grey',
                        'border-radius': '0.5em',
                        'padding': '1',
                        'width': '99%',
                        'height': '90%',
                        'fill': 'grey',
                        'margin': '2px 2px 2px 2px'
                    });
                $(_idDialog).append(div);

                chart = c3.generate({ // pierwsze wyrysowanie wykresu
                    bindto: idDiv,
                    data: {
                        interaction: {
                            enabled: false
                        },
                        x: 'x1',
                        empty: {
                            label: {
                                text: "No Data"
                            }
                        },
                        columns: [
                            seriaCzas,
                            seriaDane
                        ]
                    },
                    legend: {
                        show: false
                    },
                    onrendered: function () {
                        if (!init) {
                            init = true;
                            czyZezwolenieDoRysowania = true;
                            ladujDaneDoBufora();
                        }
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            tick: {
                                fit: false,
                                count: 20,
                                format: '%H:%M:%S' // '%Y-%m-%d %H:%M:%S'
                            }
                        }
                    },
                    point: {
                        show: false
                    }
                });
            } else { // aktualizacja wykresu o nowe serie danych wybrane przez użytkownika z kontrolek selectMenu
                // sprawdzenie czy nie wyłączono wszystkich serii do rysowania na kontrolkach selectMenu
                if (_valNoweIdSerii[0] === '1') {
                    czyBrakSeriiDoRysowania = true;
                } else {
                    czyBrakSeriiDoRysowania = false;
                }

                if (seriaDane[0] !== _valNoweIdSerii[0]) { // nowa seria danych!!!
                    czyZezwolenieDoRysowania = false;
                    chart.unload({ // usunięcie starej serii danych
                        id: seriaDane[0],
                        done: function () {
                            seriaCzas.length = 1;
                            seriaDane.length = 1;
                            seriaDane[0] = _valNoweIdSerii[0]; // nadanie nowego id
                            setTimeout(function () {
                                czyZezwolenieDoRysowania = true;
                            }, 1000);
                        }
                    });
                }
            }
            // oczekiwanie na zdarzenie zamknięcia okienka
            $(_idDialog).one("dialogclose", function (event, ui) {
                czyZezwolenieDoRysowania = false;
                clearInterval(intervalIdLadujDoBufora);
                init = false;
                chart = chart.destroy(); //chart.destroy();
                seriaDane.length = 0;
            });
        };


    return {
        inicjacja: inicjacja
    };
});