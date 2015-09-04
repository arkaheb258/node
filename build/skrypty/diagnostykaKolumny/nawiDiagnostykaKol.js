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

            switch (kod) {
            case varGlobal.kodyKlawiszy.escape:
                require(['diagnostykaKolumny/main'], function (main) {
                    main.zamknij();
                });
                if ($("#DialogPopUpKomunikaty").length !== 0) {
                    $("#DialogPopUpKomunikaty").dialog("close");
                }

                // jest aktywny tryb serwisowy!!!
                if ($("#DialogGULtrybSerwisowy").length !== 0) {
                    require(['gulTrybSerwisowy/main'], function (main) {
                        main.wylaczTrybSerwisowy();
                    });
                }
                break;

            case varGlobal.kodyKlawiszy.lewo:
                if ($("#DialogPopUpKomunikaty").length !== 0) { // w przypadku otwartego okienka z ostatnimi alarmami i ostrzezeniami - zamkniecie ich
                    $("#DialogPopUpKomunikaty").dialog("close");
                }
                break;

            case varGlobal.kodyKlawiszy.prawo:
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