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
            //console.log('wykonaj nawiMenu');

            selected.blur();

            switch (kod) {
            case varGlobal.kodyKlawiszy.gora:
                if (selected.prev().length === 0) {
                    selected.parent().find(".przyciskMenuDiagnostBlokow").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (selected.next().length === 0) {
                    selected.parent().find(".przyciskMenuDiagnostBlokow").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['diagnostykaBloki/main'], function (main) {
                    main.otworzDiagnostykeBloku(selected.attr('id'));
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                $("#dialogDiagnostykaBlokiMenu").dialog('close');
                break;

            default:
            }
        };

    return {
        wykonaj: wykonaj
    };
});
