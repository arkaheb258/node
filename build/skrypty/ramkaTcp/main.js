/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    "use strict";


    var idButtonPowrot,
        init = false,
        idDialog = '#DialogRamkaTcp',
        modulyPLC = ['analog', 'bit', 'blockAdv', 'blockSrvc', 'blockUser', 'mesg', 'mesgStatus', 'mesgType'],


        zamknij = function () {
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button
            $(idDialog).dialog('close');
            require(['ramkaTcp/odswiezaj'], function (odswiezaj) {
                odswiezaj.zamknij();
            });
        },



        dodajSygnaly = function (_nazwaBloku) {
            //console.log(_nazwaBloku);
            require(['ramkaTcp/odswiezaj'], function (odswiezaj) {
                odswiezaj.wyswietlBlokDanych(_nazwaBloku);
            });
        },


        otworzDialog = function () { // otwarcie listy menu ui
            var div,
                i,
                tabela,
                szerokoscDialog,
                button;

            //console.log('otworz');
            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                szerokoscDialog = $(window).width() * 0.90;
                $(idDialog).dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: false,
                    height: 'auto', // ($(document).height() / 2.5)
                    width: szerokoscDialog, // '80%'
                    title: $(idButtonPowrot).text()
                });

                div = document.createElement("div"); // stworzenie radiobuttona z nazwami modulow PLC
                $(div)
                    .attr('id', 'radio')
                    .attr('text', 'bla bla');
                for (i = 0; i < modulyPLC.length; i += 1) {
                    button = document.createElement('button');
                    $(button)
                        .addClass('radioButtonRamkaTCP')
                        .attr('id', modulyPLC[i])
                        .text(modulyPLC[i])
                        .appendTo(div)
                        .button();
                }
                $(idDialog).append(div);

                if (!init) {
                    init = true;
                    require(['ramkaTcp/odswiezaj'], function (odswiezaj) {
                        odswiezaj.inicjacja(idDialog);
                    });
                }

                //                tabela = document.createElement("table"); // stworzenie tabeli do ktorej beda ladowane komorki z sygnalami PLC
                //                $(tabela)
                //                    .addClass('tabelaSub')
                //                    .attr('id', 'tabelaPLCMain');
                //                $(idDialog).append(tabela);

                //dodajSygnalyPLC(modulyPLC[0]);

                $(idDialog).dialog("open"); // otwarcie dialogu
                $("#radio").children().first().blur();
                $("#radio").children().first().addClass("kopex-selected").addClass(varGlobal.ui_state);
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
                init = false;
                $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button wywołujący
            });
        },


        inicjacja = function (idButtona) {
            //console.log('ramkaTcp - inicjacja');
            idButtonPowrot = '#' + idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworzDialog();
            });
        };

    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        dodajSygnaly: dodajSygnaly
    };

});