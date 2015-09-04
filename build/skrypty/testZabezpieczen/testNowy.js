/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'zmienneGlobalne', 'wspolne/odswiezajObiekt', 'alert'], function ($, varGlobal, odswiezajObiekt, alert) {
    'use strict';

    var intervalId,
        config = {},
        init = false,
        zabezpieczeniaAktywne = [],


        koniec = function () { // wyczyszcenie pamięci
            config = {};
            init = false;
            zabezpieczeniaAktywne = [];
            clearInterval(intervalId);
            console.log('koniec testu zabezpieczen');
        },


        inicjacja = function (_config) { // Dodanie pojedynczej tabeli do wskazanego diva
            var i,
                idAlertDialog;

            config = { // Konfiguracja wstępna   
                statusData: _config.statusData, // tablica z obiektami, które mają dane statusowe, czyli np czy rozpoczął się test, czy wynik jest ok itp
                displayData: _config.displayData, // wszystkie dane które zostały wyświetlone w okienku pop up
                exceptions: _config.exceptions // niektóre zabezpieczenia mogą być wyłączone z przeprowadzanego testu, np. w KTW nie zawsze są instalowane silniki M7, M8
            };
            //console.log(config);

            $.each(config.displayData, function (key, val) { // sprawdzenie, czy są wyjątki - ich id muszą być takie same jak id zabezpieczeń
                var czyWyjatek = false;
                for (i = 0; i < _config.exceptions.length; i += 1) {
                    if (val.id === _config.exceptions[i].id) {
                        czyWyjatek = true;
                        odswiezajObiekt.typBit(val, '', '');
                    }
                }
                if (!czyWyjatek) { // jeśli nie ma wyjątku - dodaj do paczki danych do odświeżania
                    zabezpieczeniaAktywne.push(val);
                }
            });

            // rozpoczęcie odświeżania danych
            intervalId = setInterval(function () { //przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                // sygnały poszczególnych zabezpieczeń
                $.each(zabezpieczeniaAktywne, function (key, val) {
                    odswiezajObiekt.typBit(val, 'darkred', 'green');
                });

                // sygnały statusów
                $.each(config.statusData, function (key, val) {
                    var wyswietlWynikTestu = function (_tekstWynikTestu, _tlo) {
                        if (!init) {
                            init = true;
                            idAlertDialog = alert.inicjacja({
                                texts: [val.opis_pelny, _tekstWynikTestu],
                                background: _tlo,
                                windowCenter: "#dialogTestZabezpieczen"
                            });
                        }
                    };

                    switch (val.id) {
                    case 'czyTestZabezpieczenOK':
                        if (odswiezajObiekt.typBitStan(val)) {
                            wyswietlWynikTestu(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.OK, 'ui-state-default');
                        }
                        break;
                    case 'czyTestZabezpieczenNOK':
                        if (odswiezajObiekt.typBitStan(val)) {
                            wyswietlWynikTestu(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.blad);
                        }
                        break;
                    case 'trwaTestZabezpieczen':
                        if (!odswiezajObiekt.typBitStan(val)) {
                            if ($(idAlertDialog).length !== 0) { // przyszło polecenie z PLC zakończenia testu - zamknij okienko
                                $(idAlertDialog).dialog("close");
                            }
                        }
                        break;
                    }
                });

            }, varGlobal.czasOdswiezania);


        };


    return { // Metody publiczne
        inicjacja: inicjacja,
        koniec: koniec
    };
});