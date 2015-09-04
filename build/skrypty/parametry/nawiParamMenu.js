/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne'], function ($, varGlobal, scroll) {
    'use strict';

    var inicjacja = false,

        wykonaj = function (kod, selected) {
            selected.blur(); // Po otwarciu okienka dialogu pierwszy element jest zafocusowany (taka waściwość jquery) - pozbycie sie tego zaznaczenia

            switch (kod) {
            case varGlobal.kodyKlawiszy.gora:
                if (selected.prev().length === 0) {
                    selected.parent().find(".przyciskMenuParametry").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (selected.next().length === 0) {
                    selected.parent().find(".przyciskMenuParametry").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['parametry/main'], function (noweOkno) {
                    //console.log('naviparamMenu - enter');
                    noweOkno.subMenu(selected.attr('id'));
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                require(['parametry/main'], function (noweOkno) {
                    noweOkno.zamkniecieOkienka();
                });
                break;

            default:
                return;
            }


        };

    return {
        wykonaj: wykonaj
    };
});
