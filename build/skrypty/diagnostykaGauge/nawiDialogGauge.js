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


    var ccc,

        wykonaj = function (kod, selected) {

            switch (kod) {
            case varGlobal.kodyKlawiszy.escape:
                require(['diagnostykaGauge/main'], function (main) {
                    main.zamknij();
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

            case varGlobal.kodyKlawiszy.lewo:
            case varGlobal.kodyKlawiszy.prawo:
            case varGlobal.kodyKlawiszy.gora:
            case varGlobal.kodyKlawiszy.dol:
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