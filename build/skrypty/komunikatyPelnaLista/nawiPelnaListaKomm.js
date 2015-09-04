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

    var inicjacja = false,

        wykonaj = function (kod) {
            var idButtona,
                selected = $(".ui-selected");

            //selected.blur(); // Po otwarciu okienka dialogu pierwszy element jest zafocusowany (taka waściwość jquery) - pozbycie sie tego zaznaczenia

            switch (kod) {

            case varGlobal.kodyKlawiszy.gora:
                $(".selectable li").removeClass("ui-selected");
                if (selected.prev().length === 0) { // po dojsciu do pierwszego elementu przeskoczenie na ostatni
                    selected.siblings().last().addClass("ui-selected");
                } else {
                    selected.prev().addClass("ui-selected");
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                $(".selectable li").removeClass("ui-selected");
                if (selected.next().length === 0) { // po dojsciu do ostatniego elementu przejscie na pierwszy
                    selected.siblings().first().addClass("ui-selected");
                } else {
                    selected.next().addClass("ui-selected");
                    //selected.next().focus();
                }
                break;

            case varGlobal.kodyKlawiszy.lewo:
                require(['komunikatyPelnaLista/main'], function (pelnaLista) {
                    pelnaLista.poprzedniaStrona();
                });
                break;

            case varGlobal.kodyKlawiszy.prawo:
                require(['komunikatyPelnaLista/main'], function (pelnaLista) {
                    pelnaLista.nastepnaStrona();
                });
                break;

            case varGlobal.kodyKlawiszy.enter:
                require(['sprawdzPozDostepu'], function (sprawdzPozDostepu) {
                    sprawdzPozDostepu.inicjacja({
                        selected: selected,
                        parentId: 'listaPelnaOLselectable'
                    });
                });
                break;

            case varGlobal.kodyKlawiszy.escape:
                require(['komunikatyPelnaLista/main'], function (pelnaLista) {
                    pelnaLista.zamknij();
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