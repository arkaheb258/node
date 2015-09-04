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
                require(['liczniki/main'], function (liczniki) {
                    liczniki.zamknij();
                });
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['diagnostyka/popUpKomunikaty'], function (popUpKomunikaty) {
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
