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

    var ccc,


        zamknij = function () {
            $("#dialogPrzypomnienieEKS").empty();
            $('#dialogPrzypomnienieEKS').dialog('close');
        },


        inicjacja = function (obiekt) { // typPrzypomnienia: codzienne, tygodniowe, miesięczne, motogodziny
            var div,
                tekstPrzypomnienia,
                p;


            if ($("#dialogPrzypomnienieEKS").length === 0) { // sprawdzenie czy div już nie istnieje

                console.log(obiekt);

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', 'dialogPrzypomnienieEKS');
                $('body').append(div);

                $("#dialogPrzypomnienieEKS").dialog({
                    modal: true,
                    title: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.przypomnienieEKS,
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
                    .text(obiekt.opis_pelny)
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
                $("#dialogPrzypomnienieEKS").append(p);
                $("#dialogPrzypomnienieEKS").dialog("open");

                $("#dialogPrzypomnienieEKS").addClass("kopex-selected");
            }

            $("#dialogPrzypomnienieEKS").one("dialogclose", function (event, ui) {
                $("#dialogPrzypomnienieEKS").remove(); // zniszczenie całego okienka
            });

        },


        wyslijDoPLC = function () {

            console.log('wyslijDoPLC');

        };



    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        wyslijDoPLC: wyslijDoPLC
    };
});
