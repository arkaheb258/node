/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'obslugaJSON', 'zmienneGlobalne'], function ($, json, varGlobal) {
    "use strict";

    var idButtona,
        idEKS,


        zamknij = function () {
            $("#dialogPotwierdzenieEKS").empty();
            $('#dialogPotwierdzenieEKS').dialog('close');
            $('#dialogPotwierdzenieEKS').removeClass("kopex-selected").removeClass(varGlobal.ui_state);
            $('#' + idButtona).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button eks
        },


        odswiezWygladButtona = function () {
            var button,
                regExp = /\[([\w\W]*?)\]/,   //     /\[(.*?)\]/   wyrażenie regularne wycinające wszystko co jest pomiędzy nawiasami [....] łącznie z nawiasami
                tekstButtona;

            button = $("#tabsEKS").find('#' + idButtona); // znalezienie buttona po jego id
            tekstButtona = $(button).text(); // pobranie jego tekstu
            tekstButtona = tekstButtona.replace(regExp, '[ ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.OK + ' ]'); // zastąpienie nowym stringiem starego tekstu z informacją o ilości godzin do przeglądu

            $(button)
                .button("option", "label", tekstButtona)
                .css({
                    'color': '' // ustawienie defaultowego koloru tekstu
                });
        },


        inicjacja = function (kliknietyButton) {
            var div,
                tytul,
                opis,
                p;


            if ($("#dialogPotwierdzenieEKS").length === 0) { // sprawdzenie czy div już nie istnieje

                tytul = $(kliknietyButton).attr('id');
                idEKS = tytul.replace('eks', '');
                opis = $(kliknietyButton).button("option", "label");

                // zdjęcie "kopex-selected" z kliknietego buttona
                idButtona = tytul;
                $('#' + idButtona).removeClass("kopex-selected").removeClass(varGlobal.ui_state);


                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', 'dialogPotwierdzenieEKS');
                $('body').append(div);

                $("#dialogPotwierdzenieEKS").dialog({
                    modal: true,
                    title: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.potwierdzenieEKS + ' ' + idEKS,
                    closeOnEscape: false,
                    width: '60%',
                    height: ($(document).height() / 2.5),
                    effect: varGlobal.efektShowHide,
                    buttons: [
                        {
                            disabled: true,
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zatwierdz
                        },
                        {
                            disabled: true,
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
                        }
                    ],
                    show: {
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    hide: {
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    }
                });

                $(div).css({ // potrzebne do wycentrowania elementu paragraph <p> w divie
                    'width': '95%',
                    'display': 'table'
                });

                p = document.createElement('p');
                $(p)
                    .attr('id', 'pEksOpis')
                    .text(opis)
                    .css({
                        'display': 'table-cell',
                        'vertical-align': 'middle', // to i powyżej do wycentrowania w divie
                        'width': '95%',
                        'padding': '0.4em',
                        'border': '0.1em solid',
                        'border-color': 'grey',
                        'font-style': 'italic',
                        'font-size': '1.2em',
                        'text-align': 'center',
                        'border-radius': '0.5em'
                    });
                $("#dialogPotwierdzenieEKS").append(p);
                $("#dialogPotwierdzenieEKS").dialog("open");

                $("#dialogPotwierdzenieEKS").addClass("kopex-selected");
            }

            $("#dialogPotwierdzenieEKS").one("dialogclose", function (event, ui) {
                $("#dialogPotwierdzenieEKS").remove(); // zniszczenie całego okienka
            });

        },


        wyslijDoPLC = function () {

            require(['progresBar'], function (progresBar) {
                progresBar.inicjacja().done(function (czyZamknacDialog) { // Wywolanie asynchroniczne progresBar.inicjacja() --> po jej wykonaniu (czyZamknacDialog=true) przejscie do nastepnych czynnosci
                    if (czyZamknacDialog) {
                        zamknij();

                        odswiezWygladButtona(); // wywalić to jak już będzie poprawna obsługa rozkazu z Arkiem -> obslugaJson
                    }
                });
            });

            varGlobal.doWyslania.eks_520.wActivID = idEKS;
            json.wyslij(varGlobal.doWyslania.eks_520);
            console.log(varGlobal.doWyslania.eks_520);

        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        wyslijDoPLC: wyslijDoPLC,
        odswiezWygladButtona: odswiezWygladButtona
    };
});
