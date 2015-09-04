/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


define(['jquery', 'zmienneGlobalne', 'komunikaty/uaktualnijStatus', 'tab1/main'], function ($, varGlobal, uaktualnijStatus, zmienKomm_Zegar) {
    'use strict';

    var ccc,


        wejdzNaKomunikaty = function (_tabIndex) {
            if (_tabIndex === 1) { // Komunikaty i blokady
                $("#accordion").accordion("option", "active", 0);
                $("#accordion").addClass("kopex-selected");
                require(['komunikaty/tooltip'], function (tooltip) { // wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                    tooltip.naAccordionie(0);
                });
            }
        },
        

        sprawdzNieatywneTaby = function (_kierunek, _tabIndex) { // funkcja rekurencyjna 
            var ostatniTab,
                aDisabledTabs,
                i;

            ostatniTab = $('#tabs').children().children('li').length - 1;
            aDisabledTabs = $("#tabs").tabs("option", "disabled");
            for (i = 0; i < aDisabledTabs.length; i += 1) {
                if (_tabIndex === aDisabledTabs[i]) { // następny tab jest nieaktywny, w zależności od kierunku spróbuj wejść na następny tab
                    //console.log('znaleziono nieaktywny tab: ' + aDisabledTabs[i]);
                    if (_kierunek === '+') {
                        if (_tabIndex === ostatniTab) {
                            _tabIndex = 0;
                        } else {
                            _tabIndex += 1;
                        }
                    }
                    if (_kierunek === '-') {
                        _tabIndex -= 1;
                    }
                    return sprawdzNieatywneTaby(_kierunek, _tabIndex); // samowywołanie się funkcji (rekurencja)
                }
            }
            return _tabIndex;
        },


        sprawdzPamiecButtona = function (_tabIndex) {
            if (typeof varGlobal.buttonMemory[_tabIndex] === "string") { // sprawdzenie czy dla aktualnego indeksu tabu istnieje pamiec poprzednio zaznaczonego buttona
                $("#" + varGlobal.buttonMemory[_tabIndex]).addClass("kopex-selected").addClass(varGlobal.ui_state);
            }
        }; // wprowadzanie zaznaczonych buttonów do pamięci znajduję się w skrypcie klawiatura/nawiButtony.js


    return {
        sprawdzNieatywneTaby: sprawdzNieatywneTaby,
        sprawdzPamiecButtona: sprawdzPamiecButtona,
        wejdzNaKomunikaty: wejdzNaKomunikaty
    };
});