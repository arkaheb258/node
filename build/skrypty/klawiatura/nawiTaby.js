/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


define(['jquery', 'zmienneGlobalne', 'komunikaty/uaktualnijStatus', 'tab1/main', 'klawiatura/nawiWspolne'], function ($, varGlobal, uaktualnijStatus, zmienKomm_Zegar, nawiWspolne) {
    'use strict';

    var tabID,
        tabIndex,
        init = false,

        wykonaj = function (kod) {
            var ostatniTab = 0;

            ostatniTab = $('#tabs').children().children('li').length - 1;
            tabIndex = $('#tabs').tabs("option", "active"); // Pobranie indexu aktywnego tabu

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                if (tabIndex === 0) { // przejscie na ostatni tab
                    tabIndex = ostatniTab;
                } else {
                    tabIndex -= 1;
                }
                tabIndex = nawiWspolne.sprawdzNieatywneTaby('-', tabIndex);
                $("#tabs").tabs("option", "active", tabIndex);
                nawiWspolne.sprawdzPamiecButtona(tabIndex);
                nawiWspolne.wejdzNaKomunikaty(tabIndex);
                break;

            case varGlobal.kodyKlawiszy.prawo:
                if (tabIndex === ostatniTab) { // Jak jest na indexie 0 to przeskoczy na ostatni - w druga strone juz nie. Cholera wie dlaczego
                    tabIndex = 0;
                } else {
                    tabIndex += 1;
                }
                tabIndex = nawiWspolne.sprawdzNieatywneTaby('+', tabIndex);
                $("#tabs").tabs("option", "active", tabIndex);
                nawiWspolne.wejdzNaKomunikaty(tabIndex);
                nawiWspolne.sprawdzPamiecButtona(tabIndex);
                break;

            case varGlobal.kodyKlawiszy.gora:
                if (tabIndex === 0) {
                    uaktualnijStatus.dodajTekstKomunikatu('next');
                } else {
                    tabID = $("#tabs ul>li a").eq(tabIndex).attr('href');
                    $(tabID).find(".przyciskMenuGlowne").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (tabIndex === 0) { // Przewijanie ostatniego komunikatu na tab 1
                    uaktualnijStatus.dodajTekstKomunikatu('prev');
                } else { // przechodzenie po buttonach
                    tabID = $("#tabs ul>li a").eq(tabIndex).attr('href');
                    $(tabID).find(".przyciskMenuGlowne").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                if (tabIndex === 0) {
                    require(['alert'], function (alert) {
                        alert.inicjacja({
                            texts: [
                                'PLC: ' + varGlobal.parametry.DANE.grupa1.podgrupa1.sKonfWersjaProgramu.WART,
                                'LCD: ' + varGlobal.hardware.verWizu,
                                'NODE: ' + varGlobal.hardware.verSerwer,
                                varGlobal.danePlikuKonfiguracyjnego.TEKSTY.infoPar + ': ' + varGlobal.parametry.WER
                            ],
                            background: 'ui-state-default',
                            timer: 5000
                        });
                    });
                }
                break;

            case varGlobal.kodyKlawiszy.escape:
                if (tabIndex === 0) {
                    if (($('#tab1_komunikat').hasClass('ui-state-error')) || ($('#tab1_komunikat').hasClass('ui-state-highlight'))) { // Jest aktywna plansza z ostatnim alarmem
                        zmienKomm_Zegar.stworzZegar();
                    } else {
                        zmienKomm_Zegar.stworzOstatniKomunikat();
                        uaktualnijStatus.dodajTekstKomunikatu('first');
                    }
                }
                break;

            default:
            }
        };

    return {
        wykonaj: wykonaj
    };
});