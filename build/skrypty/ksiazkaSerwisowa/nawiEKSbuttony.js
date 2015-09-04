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

    var ccc,

        wykonaj = function (kod, selected) {
            var selectedScroll,
                disabled;

            //console.log('nawiEKSbuttony');



            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
                require(['ksiazkaSerwisowa/nawiEKStaby'], function (nawiEKStaby) {
                    $("#DialogKsiazkaSerwisowa").addClass("kopex-selected");
                    nawiEKStaby.wykonaj(kod);
                    selected.removeClass("kopex-selected");
                });
                return;

            case varGlobal.kodyKlawiszy.prawo:
                require(['ksiazkaSerwisowa/nawiEKStaby'], function (nawiEKStaby) {
                    $("#DialogKsiazkaSerwisowa").addClass("kopex-selected");
                    nawiEKStaby.wykonaj(kod);
                    selected.removeClass("kopex-selected"); // usunięcie tylko klasy kopex-selected -> zaznaczenie buttona zostaje, po powrocie na tą zakładkę będzie pamięć ostatniego zaznaczenia (inne podejście niż na buttonach głównych)
                });
                return;

            case varGlobal.kodyKlawiszy.gora:
                if (selected.prev().length === 0) {
                    selectedScroll = selected.parent().find(".buttonEKS").last().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selectedScroll = selected.prev().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                if (selected.next().length === 0) {
                    selectedScroll = selected.parent().find(".buttonEKS").first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                } else {
                    selectedScroll = selected.next().addClass("kopex-selected").addClass(varGlobal.ui_state);
                }

                break;

            case varGlobal.kodyKlawiszy.enter:
                disabled = $(selected).button("option", "disabled");
                if (!disabled) { // wyświetlenie okienka z potwierdzeniem tylko dla aktywnych klawiszy
                    require(['ksiazkaSerwisowa/potwierdzenie'], function (potwierdzenie) {
                        potwierdzenie.inicjacja(selected);
                    });
                }
                return;

            case varGlobal.kodyKlawiszy.escape:
                require(['ksiazkaSerwisowa/main'], function (main) {
                    main.zamknij();
                });
                break;

            default:
            }

            // Przy dlugiej liscie komunikatow sterowanie scroll barem
            scroll.eks(selectedScroll);
            //console.log($(selected).attr('id'));

            selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);

        };

    return {
        wykonaj: wykonaj
    };
});
