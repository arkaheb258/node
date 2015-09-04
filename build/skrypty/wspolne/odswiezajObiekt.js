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


        //        pobierzPaczkeDanych = function (_typDanych) {
        //            var dane;
        //
        //            if (_typDanych === 'diagnostykaBlokow') {
        //                ///console.log('bloki');
        //                dane = dane.daneDiag;
        //            } else {
        //                //console.log('norm');
        //                dane = dane.daneTCP;
        //            }
        //            
        //            return dane;
        //        },


        typAnalog = function (obiekt, _typ) {
            var mnoznik,
                precyzja,
                jednostka = '',
                daneSocketIO,
                wartoscAnaloguPoPrzeliczeniu;

            //daneSocketIO = pobierzPaczkeDanych(_typ);

            if ((typeof obiekt.mnoznik) !== 'number') { // sprawdzenie czy jest prawidłowy mnoznik
                mnoznik = 1;
            } else {
                mnoznik = obiekt.mnoznik;
            }

            mnoznik = mnoznik.toString(); // konwersja mnożnika na string a potem policzenie ilości zer
            //console.log(mnoznik.match(/0/g));
            if (mnoznik.match(/0/g) !== null) {
                precyzja = mnoznik.match(/0/g).length;
            }

            if (obiekt.jednostka !== undefined) { // w przypadku braku jednostki na planszy wywietla się "undefined"
                jednostka = obiekt.jednostka;
            }
            wartoscAnaloguPoPrzeliczeniu = dane.daneTCP.analog[obiekt.poz_ramka] / mnoznik; // wartość analogu po uwzględnieniu mnożnika
            $("#" + obiekt.id).text(wartoscAnaloguPoPrzeliczeniu.toFixed(precyzja) + " " + jednostka); // ustawienie końcowego tekstu na kontrolce
            return wartoscAnaloguPoPrzeliczeniu;
        },


        typLista = function (obiekt) {
            var tekst,
                przeladujGrafikeTab1 = false,
                daneTCP,
                index;

            // wykrywanie błędów w tekstach pliku konfiguracja.json
            //            if (varGlobal.danePlikuKonfiguracyjnego.TEKSTY[obiekt.id] === undefined) {  
            //                console.log(obiekt);
            //            }

            index = dane.daneTCP.analog[obiekt.poz_ramka];
            tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY[obiekt.id][index];
            $("#" + obiekt.id)
                .addClass('ui-state-default')
                .text(tekst);
        },


        typBitStan = function (obiekt) { // analiza samego stanu bitu, bez żadnych kolorów, tekstów itp. jak w "typBit"
            var stanBitu,
                maska = 1;

            //            if (obiekt === undefined) {
            //                console.log(obiekt);
            //            }
            maska = maska << obiekt.poz_bit; // Ustawienie maski na odpowiedniej pozycj
            if (dane.daneTCP.bit[obiekt.poz_ramka] & maska) {
                stanBitu = true;
            } else {
                stanBitu = false;
            }
            return stanBitu;
        },

        // border: 1px solid black;

        typBit = function (_obiekt, _kolorLow, _kolorHigh) {
            var i,
                stanBitu,
                kolorObwodki,
                maska = 1,
                ustawKolor = function (kolor) {
                    $("#" + _obiekt.id).removeClass('ui-state-default');
                    $("#" + _obiekt.id).removeClass('ui-state-error');
                    $("#" + _obiekt.id).removeClass('ui-state-highlight');
                    switch (kolor) {
                    case '':
                        $("#" + _obiekt.id)
                            .css({
                                'border': ''
                            })
                            .addClass('ui-state-default');
                        break;
                    case 'red':
                        $("#" + _obiekt.id).addClass('ui-state-error');
                        break;
                    case '#ffff00':
                        $("#" + _obiekt.id).addClass('ui-state-highlight');
                        break;
                    case 'transparent':
                        $("#" + _obiekt.id)
                            .css({
                                'backgroundColor': '', // tło
                                'color': '',
                                'border': '1px solid #363636'
                            });
                        break;
                    default:
                        if (kolor === 'green') {
                            kolorObwodki = 'lime';
                        }
                        if (kolor === 'darkOrange') {
                            kolorObwodki = 'yellow';
                        }
                        if (kolor === 'darkred') {
                            kolorObwodki = 'red';
                        }
                        $("#" + _obiekt.id)
                            .css({
                                'backgroundColor': kolor,
                                'border': '1px solid ' + kolorObwodki
                            });
                        break;
                    }
                },
                ustawTekst = function (_index) {
                    if (varGlobal.danePlikuKonfiguracyjnego.TEKSTY[_obiekt.id] !== undefined) {
                        $("#" + _obiekt.id).text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY[_obiekt.id][_index]); // jeśli istnieje tekst w pliku konfiguracyjnym - użyj go...
                    } else {
                        $("#" + _obiekt.id).text(_obiekt.jednostka); // ...jeśli nie, wykorzystaj tekst z pola "jednostka"
                    }
                };

            maska = maska << _obiekt.poz_bit; // Ustawienie maski na odpowiedniej pozycji
            if (dane.daneTCP.bit[_obiekt.poz_ramka] & maska) { // stan wysoki bitu
                stanBitu = true; // ustawienie wyjścia funkcji
                ustawKolor(_kolorHigh); // ustawienie koloru tła
                ustawTekst(1); // ustawienie tekstu dla stanu wysokiego
            } else { // stan niski bitu
                stanBitu = false;
                ustawKolor(_kolorLow);
                ustawTekst(0);
            }


            return stanBitu;
        };

    return {
        typAnalog: typAnalog,
        typLista: typLista,
        typBitStan: typBitStan,
        typBit: typBit
    };
});