/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'klawiatura/nawiWspolne'], function ($, varGlobal, json, nawiWspolne) { // , 'parametry' , parametry
    'use strict';


    var oldMemory,
        infoBrakDostepuAktywne = false,

        wykonaj = function (kod, selected) {
            var tabIndex = $('#tabs').tabs("option", "active"),
                idButtona, // Pobranie indexu aktywnego tabu,
                tytulButtona,
                ostatniTab = 0,
                wprowadzDoPamieci = function () {
                    if (selected.hasClass("przyciskMenuGlowne")) { // jesli jest zaznaczony jakis button ...
                        varGlobal.buttonMemory[tabIndex] = $(selected).attr('id'); // ... zapamietanie jego id na odpowoedniej komorce pamieci (odpowiadajacej indekowi tabu)
                    }
                },
                brakDostepuDoButtona = function (selectedButton) {
                    infoBrakDostepuAktywne = true; // bez tej flagi przy szybkim wciskaniu ENTERa na końcu pojawiał się problem z tekstem (nie było powrotu do pierwotnego opisu)
                    $(selected).addClass('ui-state-error');
                    $(selected).button("option", "label", varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakDostepu);
                    setTimeout(function () {
                        infoBrakDostepuAktywne = false;
                        $(selected).removeClass('ui-state-error');
                        $(selected).button("option", "label", tytulButtona);
                    }, 1500);
                };

            ostatniTab = $('#tabs').children().children('li').length - 1;

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                wprowadzDoPamieci();
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
                wprowadzDoPamieci();
                if (tabIndex === ostatniTab) { // Jak jest na indexie 0 to przeskoczy na ostatni - w druga strone juz nie. Cholera wie dlaczego
                    tabIndex = 0;
                } else {
                    tabIndex += 1;
                }

                tabIndex = nawiWspolne.sprawdzNieatywneTaby('+', tabIndex);
                $("#tabs").tabs("option", "active", tabIndex);
                nawiWspolne.sprawdzPamiecButtona(tabIndex);
                nawiWspolne.wejdzNaKomunikaty(tabIndex);
                break;

            case varGlobal.kodyKlawiszy.gora:
                wprowadzDoPamieci();
                if (selected.prev().length === 0) {
                    selected.parent().find(".przyciskMenuGlowne").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                wprowadzDoPamieci();
                if (selected.next().length === 0) {
                    selected.parent().find(".przyciskMenuGlowne").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                idButtona = $(selected).attr("id"); //Pobranie id kliknietego buttona;
                tytulButtona = $(selected).text();
                wprowadzDoPamieci();
                //console.log(idButtona);
                switch (varGlobal.poziomDostepu) { // Sprawdzenie jaki aktualnie jest ustawiony poziom dostepu
                case 'Brak':
                    if ($(selected).hasClass('Srvc')) {
                        if (!infoBrakDostepuAktywne) {
                            brakDostepuDoButtona();
                        }
                        return;
                    }
                    break;
                case 'User':
                case 'User2':
                    if ($(selected).hasClass('Srvc')) {
                        if (!infoBrakDostepuAktywne) {
                            brakDostepuDoButtona();
                        }
                        return;
                    }
                    break;
                }

                idButtona = $(selected).attr("id"); //Pobranie id kliknietego buttona;
                $('#' + idButtona).trigger('click');
                $('#' + idButtona).removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                return;

            case varGlobal.kodyKlawiszy.escape:
                oldMemory = $('.kopex-memory'); // jesli bylo gdzies wczesniej zaznaczenie - usuniecie go (moze byc tylko jedno)
                $(oldMemory).removeClass('kopex-memory');

                $(selected).addClass('kopex-memory');
                tabIndex = 1;
                $("#tabs").tabs("option", "active", tabIndex);
                nawiWspolne.wejdzNaKomunikaty(tabIndex);

                //wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                require(['komunikaty/tooltip'], function (tooltip) {
                    tooltip.naAccordionie(0);
                });
                break;

            default:
                return; // wyjscie z funkcji (nie kasowanie podswietlenia)
            }

            selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
        };

    return {
        wykonaj: wykonaj
    };
});