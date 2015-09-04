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
        tabIndex,

        wykonaj = function (kod) {
            var tabIndex = $('#tabs').tabs("option", "active");

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                break;

            case varGlobal.kodyKlawiszy.prawo:
                break;

            case varGlobal.kodyKlawiszy.dol:
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['komunikaty/zalozBlokade'], function (blokady) {
                    //console.log('wyslij');
                    blokady.wyslij();
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                require(['komunikaty/zalozBlokade'], function (blokady) {
                    blokady.zamknij();
                });

                if (tabIndex === 1) { // ma nie wyskakiwać na pełnej liście komunikatów
                    require(['komunikaty/tooltip'], function (tooltip) { // wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                        tooltip.naSelectable();
                    });
                }
                break;

            default:
            }
        };

    return {
        wykonaj: wykonaj
    };
});