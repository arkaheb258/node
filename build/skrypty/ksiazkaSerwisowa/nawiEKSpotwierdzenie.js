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

            //console.log('wykonaj nawiEKSpotwierdzenie');

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                return;

            case varGlobal.kodyKlawiszy.prawo:
                return;

            case varGlobal.kodyKlawiszy.gora:
                break;

            case varGlobal.kodyKlawiszy.dol:
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['ksiazkaSerwisowa/potwierdzenie'], function (potwierdzenie) {
                    potwierdzenie.wyslijDoPLC();
                });
                return;

            case varGlobal.kodyKlawiszy.escape:
                require(['ksiazkaSerwisowa/potwierdzenie'], function (potwierdzenie) {
                    potwierdzenie.zamknij();
                });

                break;

            default:
            }


        };

    return {
        wykonaj: wykonaj
    };
});
