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


    var ccc = false,

        wykonaj = function (kod, selected) {

            //console.log(kod);

            $('#keyboard').keyup(function (event) {
                event.preventDefault();
                event.stopPropagation();
            });

            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                $('#keyboard').trigger('navigate', "left");
                break;

            case varGlobal.kodyKlawiszy.prawo:
                $('#keyboard').trigger('navigate', "right");
                break;

            case varGlobal.kodyKlawiszy.gora:
                $('#keyboard').trigger('navigate', "up");
                break;

            case varGlobal.kodyKlawiszy.dol:
                $('#keyboard').trigger('navigate', "down");
                break;

            case varGlobal.kodyKlawiszy.enter:
                $('#keyboard').trigger('navigate', "enter"); // Nawigacja po wirtualnej klawiaturze
                break;

            case varGlobal.kodyKlawiszy.escape:
                if ($('#DialogEdycjaParametru').dialog("isOpen")) {
                    require(['parametry/edycjaParametru'], function (edycja) {
                        edycja.zamknijKlawiature();
                    });
                }

                if ($('#DialogEdycjaRozkazu').length > 0) {
                    require(['rozkazy/edytuj'], function (edytuj) {
                        edytuj.zamknij();
                    });
                }
                break;

            default:

            }
        };

    return {
        wykonaj: wykonaj
    };
});
