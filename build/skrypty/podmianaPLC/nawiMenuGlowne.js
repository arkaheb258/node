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

    var idButtona,

        wykonaj = function (kod, selected) {
            selected.blur();

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                return;

            case varGlobal.kodyKlawiszy.prawo:
                return;

            case varGlobal.kodyKlawiszy.gora:
                if (selected.prev().length === 0) {
                    selected.parent().find(".przyciskMenuPodmianaPLC").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (selected.next().length === 0) {
                    selected.parent().find(".przyciskMenuPodmianaPLC").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                idButtona = $(selected).attr("id");
                require(['podmianaPLC/main'], function (main) {
                    main.wcisnietoEnter(idButtona);
                });

                return;

            case varGlobal.kodyKlawiszy.escape:
                require(['podmianaPLC/main'], function (main) {
                    main.wcisnietoEscape();
                });

                //$("#dialogWymianaPLC").trigger('dialogclose'); // wymuszenie zdarzenia zamknięcia okienka dialog
                break;

            default:
            }

            selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);

        };

    return {
        wykonaj: wykonaj
    };
});
