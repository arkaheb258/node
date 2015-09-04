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


    var czyKlawiaturaOtwarta,

        wykonaj = function (kod, selected) {

            //console.log('nawi poziomDostepu');
            $('#keyboard').focus();

            $('#keyboard').keyup(function (event) {
                event.preventDefault();
                event.stopPropagation();
                //console.log('keyboard keyup');
            });

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                $('#keyboard').triggerHandler('navigate', "left");
                break;

            case varGlobal.kodyKlawiszy.prawo:
                $('#keyboard').triggerHandler('navigate', "right");
                break;

            case varGlobal.kodyKlawiszy.gora:
                $('#keyboard').triggerHandler('navigate', "up");
                break;

            case varGlobal.kodyKlawiszy.dol:
                $('#keyboard').triggerHandler('navigate', "down");

                break;
            case varGlobal.kodyKlawiszy.enter:
                $('#keyboard').triggerHandler('navigate', "enter"); // Nawigacja po wirtualnej klawiaturze
                break;

            case varGlobal.kodyKlawiszy.escape:
                require(['poziomDostepu/main'], function (poziomDostepu) {
                    poziomDostepu.zamkniecieOkienka();
                });
                break;

            default:

            }
        };

    return {
        wykonaj: wykonaj
    };
});
