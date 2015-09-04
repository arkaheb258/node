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
    var scrollPoziom2,

        wykonaj = function (kod, selected) {



            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                selected.menu("collapse");
                break;

            case varGlobal.kodyKlawiszy.prawo:
                selected.menu("expand");
                //                $("#menu").menu("option", "position", {
                //                    my: "left top",
                //                    at: "right-5 top+5"
                //                });

                //console.log($("#menu").menu("option", "position"));
                break;

            case varGlobal.kodyKlawiszy.gora:
                selected.menu("previous");
                break;

            case varGlobal.kodyKlawiszy.dol:
                selected.menu("next");
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['parametry/edycjaParametru'], function (edycja) {
                    edycja.inicjacja();
                    selected.menu("select");
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                $('#DialogParametryLista').dialog('close');
                require(['parametry/main'], function (parametry) {
                    parametry.stworzMenuGlowne();
                });
                break;
            }

            //console.log('scroll');
            if ($('#DialogParametryLista').length > 0) {
                scroll.parametry();
            }


        };

    return {
        wykonaj: wykonaj
    };
});