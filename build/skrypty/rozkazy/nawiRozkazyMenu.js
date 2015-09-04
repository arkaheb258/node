/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'scroll'], function ($, varGlobal, scroll) {
    'use strict';


    // Nawigacja po rozwijalnym menu z lista parametrow
    var zz,

        wykonaj = function (kod, selected) {

            //console.log(selected.attr('id'));

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                selected.menu("collapse");
                break;

            case varGlobal.kodyKlawiszy.prawo:
                selected.menu("expand");
                break;

            case varGlobal.kodyKlawiszy.gora:
                selected.menu("previous");
                break;

            case varGlobal.kodyKlawiszy.dol:
                selected.menu("next");
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['rozkazy/edytuj'], function (edytuj) {
                    edytuj.inicjacja();
                    selected.menu("select");
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                require(['rozkazy'], function (rozkazy) {
                    rozkazy.zamknij();
                });
                break;
            }

            //scroll.rozkazyPLC(selected);

        };

    return {
        wykonaj: wykonaj
    };
});
