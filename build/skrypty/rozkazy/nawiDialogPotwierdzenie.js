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
                if ($('#DialogEdycjaRozkazu').length > 0) {
                    require(['rozkazy/edytuj'], function (edytuj) {
                        edytuj.zamknij();
                    });
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['rozkazy/edytuj'], function (edytuj) {
                    edytuj.wyslijpBrak();
                });
                break;

            default:

            }
        };

    return {
        wykonaj: wykonaj
    };
});
