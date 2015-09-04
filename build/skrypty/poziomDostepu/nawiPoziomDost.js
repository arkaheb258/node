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


    var cc,

        wykonaj = function (kod, selected) {

            selected.blur();

            switch (kod) {
            case varGlobal.kodyKlawiszy.gora:
                if (selected.prev().length === 0) {
                    selected.parent().find(".przyciskMenuPoziomDost").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (selected.next().length === 0) {
                    selected.parent().find(".przyciskMenuPoziomDost").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;
            case varGlobal.kodyKlawiszy.enter:
                require(['poziomDostepu/main'], function (poziomDostepu) {
                    poziomDostepu.otworzKlawiature(selected.attr('id'));
                });
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                return;

            case varGlobal.kodyKlawiszy.escape:
                require(['poziomDostepu/main'], function (poziomDostepu) {
                    poziomDostepu.zamkniecieOkienka();
                });
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;

            default:

            }

            //selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);

        };

    return {
        wykonaj: wykonaj
    };
});
