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
            //console.log('wykonaj nawiBlok');
            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                if (selected.prev().length === 0) {
                    sel = selected.parent().find(".radioButtonDiagnBloki").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    sel = selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                require(['diagnostykaBloki/wyswietlBlok'], function (wyswietlBlok) {
                    wyswietlBlok.dodajSygnalyPLC(sel.attr('id'));
                });

                if ($("#DialogPopUpKomunikaty").length !== 0) { // w przypadku otwartego okienka z ostatnimi alarmami i ostrzezeniami - zamkniecie ich
                    $("#DialogPopUpKomunikaty").dialog("close");
                }
                break;

            case varGlobal.kodyKlawiszy.prawo:
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                if (selected.next().length === 0) {
                    sel = selected.parent().find(".radioButtonDiagnBloki").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    sel = selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                require(['diagnostykaBloki/wyswietlBlok'], function (wyswietlBlok) {
                    wyswietlBlok.dodajSygnalyPLC(sel.attr('id'));
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

            case varGlobal.kodyKlawiszy.escape:
                require(['diagnostykaBloki/wyswietlBlok'], function (wyswietlBlok) {
                    wyswietlBlok.zamknij();
                });
                if ($("#DialogPopUpKomunikaty").length !== 0) {
                    $("#DialogPopUpKomunikaty").dialog("close");
                }
                break;

            default:
            }
        };

    return {
        wykonaj: wykonaj
    };
});