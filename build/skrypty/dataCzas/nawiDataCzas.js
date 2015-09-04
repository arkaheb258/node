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

        wykonaj = function (kod) {
            var e = jQuery.Event("keydown"); // działa tylko zdarzenie keydown

            $("#dateEntry").focus(); // gdy jest otwarte okienko i pojawi sie komunikat popup (ten wyskakujący z dołu) to traci się podświetlenie (focus)
            $("#dateEntry").on("keyup", function (event, ui) {
                event.preventDefault();
                event.stopPropagation();

                switch (event.keyCode) {
                case varGlobal.kodyKlawiszy.enter:
                    varGlobal.trwaZmianaCzasu = true;
                    require(['dataCzas/main'], function (main) {
                        main.wyslijDoPLC();
                    });
                    break;
                case varGlobal.kodyKlawiszy.escape:
                    require(['dataCzas/main'], function (main) {
                        main.zamknij();
                    });
                    break;
                }
                //console.log(event.keyCode);
            });

            //console.log('wykonaj');
            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                e.keyCode = $.ui.keyCode.LEFT;
                $("#dateEntry").trigger(e);
                break;
            case varGlobal.kodyKlawiszy.prawo:
                e.keyCode = $.ui.keyCode.RIGHT;
                $("#dateEntry").trigger(e);
                break;
            case varGlobal.kodyKlawiszy.gora:
                e.keyCode = $.ui.keyCode.UP;
                $("#dateEntry").trigger(e);
                break;
            case varGlobal.kodyKlawiszy.dol:
                e.keyCode = $.ui.keyCode.DOWN;
                $("#dateEntry").trigger(e);
                break;
            case varGlobal.kodyKlawiszy.enter:
                varGlobal.trwaZmianaCzasu = true;
                require(['dataCzas/main'], function (main) {
                    main.wyslijDoPLC();
                });
                break;
            case varGlobal.kodyKlawiszy.escape:
                require(['dataCzas/main'], function (main) {
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
