/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var tabID,
        selected,
        buttonID,
        wykonaj = function (kod) {
            var ostatniTab = 0,
                tabIndex,
                sprawdzZaznaczenie = function () { // sprawdyenie cyz jakis button na tabie nie bz wcyeđniej yaynacyonz
                    tabID = $("#tabsEKS ul>li a").eq(tabIndex).attr('href');
                    buttonID = $(tabID).find("." + varGlobal.ui_state).attr('id');
                    if (buttonID !== undefined) { // jest już jakiś zaznaczony
                        selected = $(tabID).find("." + varGlobal.ui_state);

                        $("#DialogKsiazkaSerwisowa").removeClass("kopex-selected"); // jesli jest zaznaczony to skierowanie od razu na niego nawigacji
                        selected.addClass("kopex-selected");
                    } else {
                        selected = undefined;
                    }
                },
                przejdzNaButtony = function (kierunek) {
                    if (selected !== undefined) { // jest już jakiś zaznaczony button
                        require(['ksiazkaSerwisowa/nawiEKSbuttony'], function (nawiEKSbuttony) {
                            $('#' + buttonID).addClass("kopex-selected");
                            $("#DialogKsiazkaSerwisowa").removeClass("kopex-selected");
                            nawiEKSbuttony.wykonaj(kod, selected);
                        });
                    } else { // brak zaznaczonego buttona
                        tabID = $("#tabsEKS ul>li a").eq(tabIndex).attr('href');
                        $("#DialogKsiazkaSerwisowa").removeClass("kopex-selected");
                        switch (kierunek) {
                        case 'dol':
                            $(tabID).find(".buttonEKS").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                            break;

                        case 'gora':
                            $(tabID).find(".buttonEKS").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                            break;
                        }
                    }
                };


            ostatniTab = $('#tabsEKS').children().children('li').length - 1;
            tabIndex = $('#tabsEKS').tabs("option", "active"); // Pobranie indexu aktywnego tabu

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:

                if (tabIndex === 0) { // przejscie na ostatni tab
                    tabIndex = ostatniTab;
                    $("#tabsEKS").tabs("option", "active", tabIndex);
                } else {
                    tabIndex -= 1;
                    $("#tabsEKS").tabs("option", "active", tabIndex);
                }
                sprawdzZaznaczenie();
                break;

            case varGlobal.kodyKlawiszy.prawo:

                if (tabIndex === ostatniTab) { // Jak jest na indexie 0 to przeskoczy na ostatni - w druga strone juz nie. Cholera wie dlaczego
                    tabIndex = 0;
                    $("#tabsEKS").tabs("option", "active", tabIndex);
                } else {
                    tabIndex += 1;
                    $("#tabsEKS").tabs("option", "active", tabIndex);
                }
                sprawdzZaznaczenie();
                break;

            case varGlobal.kodyKlawiszy.gora:
                if (tabIndex !== 4) {
                    przejdzNaButtony('gora');
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (tabIndex !== 4) {
                    przejdzNaButtony('dol');
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                break;

            case varGlobal.kodyKlawiszy.escape:
                require(['ksiazkaSerwisowa/main'], function (main) {
                    main.zamknij();
                });
                break;

            default:
            }
        };

    return {
        wykonaj: wykonaj
    };
});
