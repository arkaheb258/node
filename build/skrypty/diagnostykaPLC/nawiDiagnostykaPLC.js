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

    var sel,

        wykonaj = function (kod, selected) {
            //console.log('wykonaj');
            switch (kod) {
            case varGlobal.kodyKlawiszy.escape:
                require(['diagnostykaPLC/main'], function (main) {
                    main.zamknij();
                });
                if ($("#DialogPopUpKomunikaty").length !== 0) {
                    $("#DialogPopUpKomunikaty").dialog("close");
                }
                break;

            case varGlobal.kodyKlawiszy.lewo:
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                if (selected.prev().length === 0) {
                    sel = selected.parent().find(".radioButtonPLC").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    sel = selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                require(['diagnostykaPLC/main'], function (main) {
                    main.dodajSygnalyPLC(sel.attr('id'));
                });

                if ($("#DialogPopUpKomunikaty").length !== 0) { // w przypadku otwartego okienka z ostatnimi alarmami i ostrzezeniami - zamkniecie ich
                    $("#DialogPopUpKomunikaty").dialog("close");
                }
                break;

            case varGlobal.kodyKlawiszy.prawo:
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                if (selected.next().length === 0) {
                    sel = selected.parent().find(".radioButtonPLC").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    sel = selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                require(['diagnostykaPLC/main'], function (main) {
                    main.dodajSygnalyPLC(sel.attr('id'));
                });

                if ($("#DialogPopUpKomunikaty").length !== 0) {
                    $("#DialogPopUpKomunikaty").dialog("close");
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['komunikaty/popUpKomunikaty'], function (popUpKomunikaty) {
                    popUpKomunikaty.inicjacja();
                });
                break;

            default:
            }
        };

    return {
        wykonaj: wykonaj
    };
});