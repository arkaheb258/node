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


    var wartoscSpinnera,

        wykonaj = function (kod, selected) {

            //lected.blur();
            //"#DialogEdycjaParametru").find('ui-state-hover').removeClass();

            switch (kod) {
            case varGlobal.kodyKlawiszy.gora:
                $('#spinner').formatSpinner("stepUp");
                break;

            case varGlobal.kodyKlawiszy.dol:
                $('#spinner').formatSpinner("stepDown");
                break;

            case varGlobal.kodyKlawiszy.enter:
                wartoscSpinnera = $('#spinner').formatSpinner("value");
                require(['parametry/edycjaParametru'], function (edycja) {
                    edycja.wyslijListeDoPLC(wartoscSpinnera);
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                $("#DialogEdycjaParametru").empty();
                $("#DialogEdycjaParametru").dialog('close');
                $('#menu').addClass("kopex-selected");
                //$('#menu').menu("next"); // Zaznaczenie pierwszego elementu menu rozwijalnego
                break;

            default:

            }
        };

    return {
        wykonaj: wykonaj
    };
});
