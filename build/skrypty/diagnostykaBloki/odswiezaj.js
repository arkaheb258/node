/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define*/


define(['jquery', 'kommTCP'], function ($, dane) {
    'use strict';


    var ccc,

        typBit = function (_obiekt, _kolorLow, _kolorHigh) {
            var kolorObwodki,
                maska = 1,
                ustawKolor = function (__kolor) {
                    switch (__kolor) {
                    case 'transparent':
                        $("#" + _obiekt.id)
                            .css({
                                'backgroundColor': '', // tło
                                'color': '',
                                'border': '1px solid #363636'
                            });
                        break;
                    case 'darkred':
                        $("#" + _obiekt.id)
                            .css({
                                'backgroundColor': __kolor,
                                'border': '1px solid ' + 'red'
                            });
                        break;
                    case 'darkOrange':
                        $("#" + _obiekt.id)
                            .css({
                                'backgroundColor': __kolor,
                                'border': '1px solid ' + 'yellow'
                            });
                        break;
                    case 'green':
                        $("#" + _obiekt.id)
                            .css({
                                'backgroundColor': __kolor,
                                'border': '1px solid ' + 'lime'
                            });
                        break;
                    }
                };

            maska = maska << _obiekt.pozBit;
            if (dane.daneDiag.DigitData[_obiekt.pozWord] & maska) { // stan wysoki bitu
                ustawKolor(_kolorHigh); // ustawienie koloru tła
            } else { // stan niski bitu
                ustawKolor(_kolorLow);
            }
        },


        typAnalog = function (_obiekt) {
            var wartoscAnaloguPoPrzeliczeniu;

            typBit(_obiekt, 'transparent', 'darkred');
            wartoscAnaloguPoPrzeliczeniu = dane.daneDiag.AnalogData[_obiekt.pozAn] / 10; // wartość analogu po uwzględnieniu mnożnika
            $("#" + _obiekt.id).text(wartoscAnaloguPoPrzeliczeniu.toFixed(1)); // ustawienie końcowego tekstu na kontrolce
        },


        typNamur = function (_obiekt) {
            var stanNamur;

            stanNamur = dane.daneDiag.AnalogData[_obiekt.pozAn];
            //console.log(stanNamur);
            switch (stanNamur) {
            case 0: // praca prawidłowa
                $("#" + _obiekt.id).text('NAM');
                //typBit(_obiekt, 'green', 'transparent');
                typBit(_obiekt, 'transparent', 'green');
                break;
            case 1: // przerwa
                $("#" + _obiekt.id).text('Przerwa');
                typBit(_obiekt, 'darkred', 'darkred');
                break;
            case 2: // zwarcie
                $("#" + _obiekt.id).text('Zwarcie');
                typBit(_obiekt, 'darkred', 'darkred');
                break;

            default:
                $("#" + _obiekt.id).text('status: ' + stanNamur);
                typBit(_obiekt, 'darkred', 'darkred');
            }
        },


        aktualizuj = function (_daneWej) {
            var i,
                length;

            length = _daneWej.length;
            for (i = 0; i < length; i += 1) {
                if (_daneWej[i].TYPWEWY === 'AN') {
                    typAnalog(_daneWej[i]);
                }
                if (_daneWej[i].TYPWEWY === 'NAM') {
                    typNamur(_daneWej[i]);
                }
                if (_daneWej[i].TYPWEWY === 'CAN') {
                    typBit(_daneWej[i], 'darkred', 'green');
                }
                if (_daneWej[i].TYPWEWY === 'DI') {
                    typBit(_daneWej[i], 'transparent', 'green');
                }
                if (_daneWej[i].TYPWEWY === 'DO') {
                    typBit(_daneWej[i], 'transparent', 'darkOrange');
                }
            }
        };

    return {
        aktualizuj: aktualizuj
    };

});