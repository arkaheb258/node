/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'tab1/main'], function ($, varGlobal, json, dodajTab1) {
    "use strict";

    var tab1Komunikat, // Komunikat na ktory ma byc zalozona/zdjeta blokada
        tab1Lista,


        dodajTekstKomunikatu = function (akcja) {
            var tekst = '',
                tekstPopUp = '';

            tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbAlrm + ': ' + varGlobal.komunikaty.alarmy + ', ' +
                varGlobal.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbOstrz + ': ' + varGlobal.komunikaty.ostrz + ', ' +
                varGlobal.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbBlokad + ': ' + (varGlobal.blokady.zalUser + varGlobal.blokady.zalSrvc + varGlobal.blokady.zalAdv);


            switch (akcja) {
            case 'first':
                if (varGlobal.komunikaty.alarmy > 0) {
                    tab1Lista = $('#listaAlarmy');
                    tab1Komunikat = $('#listaAlarmy').children().first();
                } else if (varGlobal.komunikaty.alarmy === 0 && varGlobal.komunikaty.ostrz > 0) {
                    tab1Lista = $('#listaOstrzezenia');
                    tab1Komunikat = $('#listaOstrzezenia').children().first();
                } else {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakAlar;
                }
                break;


            case 'next':
                if (tab1Komunikat === undefined) { // Jesli jeszcze nie zaladowaly sie komunikaty -> wyjscie. Czesto przy starcie aplikacji pojawial sie blad
                    return;
                }

                if (tab1Komunikat.next().length === 0) { // po dojsciu do ostatniego elementu przejscie na pierwszy
                    tab1Komunikat = $(tab1Lista).children().first();
                } else {
                    tab1Komunikat = tab1Komunikat.next();
                }
                break;

            case 'prev':
                if (tab1Komunikat.prev().length === 0) { // po dojsciu do pierwszego elementu przeskoczenie na ostatni
                    tab1Komunikat = $(tab1Lista).children().last();
                } else {
                    tab1Komunikat = tab1Komunikat.prev();
                }
                break;
            }


            $('#p_liczbaAlarmow').text(tekst);

            if (varGlobal.komunikaty.alarmy > 0) {
                tekstPopUp = (tab1Komunikat.index() + 1) + '/' + varGlobal.komunikaty.alarmy + ' ' + tab1Komunikat.text();
                $('#p_tekstAlarmu').text(tekstPopUp);

                require(['komunikaty/popUpAlarm'], function (popUpAlarm) { // wyświetlenie małego okienka z najświeższym alarmem
                    if (varGlobal.komunikaty.alarmy > 0) {
                        popUpAlarm.inicjacja(tekstPopUp);
                    }
                });

            } else if ((varGlobal.komunikaty.alarmy === 0) && (varGlobal.komunikaty.ostrz > 0)) {
                $('#p_tekstAlarmu').text((tab1Komunikat.index() + 1) + '/' + varGlobal.komunikaty.ostrz + ' ' + tab1Komunikat.text());
            } else {
                $('#p_tekstAlarmu').text('');
            }
        },


        zmienStatus_Alarmy_OLD = function () { // do wywalenia jak Robert w końcu doda obsługe statusów w status wordzie !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
            if (varGlobal.komunikaty.alarmy > 0) { // Wyswietlenie statusu na tab1 o alarmach
                $('#statusKombajnu')
                    .removeClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.alarm)
                    .removeClass('ui-state-highlight')
                    .addClass('ui-state-error');
            } else if ((varGlobal.komunikaty.alarmy === 0) && (varGlobal.komunikaty.ostrz > 0)) {
                $('#statusKombajnu')
                    .removeClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.ostrz)
                    .addClass('ui-state-highlight')
                    .removeClass('ui-state-error');
            } else {
                $('#statusKombajnu')
                    .addClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakAlar)
                    .removeClass('ui-state-error')
                    .removeClass('ui-state-highlight');
            }
        },

        zmienStatus_Blokady_OLD = function () { // do wywalenia jak Robert w końcu doda obsługe statusów w status wordzie !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
            if ((varGlobal.blokady.zalUser > 0) || (varGlobal.blokady.zalSrvc > 0) || (varGlobal.blokady.zalAdv > 0)) { // Wyswietlenie informacji o blokadach na tab 1
                $('#diagnostykaBlokad')
                    .removeClass('ui-state-default')
                    .addClass('ui-state-error')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.diagnostykaBlokad[1]);

            } else {
                $('#diagnostykaBlokad')
                    .removeClass('ui-state-error')
                    .addClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.diagnostykaBlokad[0]);
            }
        },


        zmienStatusAlarm = function (czyAlarm, czyOstrzezenie) {
            if (czyAlarm) { // alarm
                $('#statusKombajnu')
                    .removeClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.alarm)
                    .removeClass('ui-state-highlight')
                    .addClass('ui-state-error');
            } else if ((!czyAlarm) && (czyOstrzezenie)) { // ostrzezenie
                $('#statusKombajnu')
                    .removeClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.ostrz)
                    .addClass('ui-state-highlight')
                    .removeClass('ui-state-error');
            } else { // brak alarmów i ostrzeżeń
                //dodajTab1.stworzZegar();
                $('#statusKombajnu')
                    .addClass('ui-state-default')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakAlar)
                    .removeClass('ui-state-error')
                    .removeClass('ui-state-highlight');
            }
        };

    return {
        zmienStatus_Alarmy_OLD: zmienStatus_Alarmy_OLD, // do wywalenia!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
        zmienStatus_Blokady_OLD: zmienStatus_Blokady_OLD,

        dodajTekstKomunikatu: dodajTekstKomunikatu,
        zmienStatusAlarm: zmienStatusAlarm
    };

});
