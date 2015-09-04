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

            //console.log('wykonaj nawiEKSprzypomnienie');

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
                require(['ksiazkaSerwisowa/przypomnienie'], function (przypomnienie) {
                    przypomnienie.wyslijDoPLC();
                });
                return;

            case varGlobal.kodyKlawiszy.escape:
                // to też ma być 'wyslijDoPLC!!!', okienko ma być zamykane po zdjęciu flagi po otrzymaniu przez sterownik rozkazu z wyświetlacza
                require(['ksiazkaSerwisowa/przypomnienie'], function (przypomnienie) {
                    przypomnienie.zamknij();
                });
                break;

            default:
            }


        };

    return {
        wykonaj: wykonaj
    };
});
