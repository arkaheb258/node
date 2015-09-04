/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define, Raphael */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'ustawKolejnosc'], function ($, varGlobal, json, ustawKolejnosc) {
    'use strict';

    var init = false,
        idButtonPowrot,
        idDialog = '#DialogRozkazy',
        obiektyDoWykresow = [],


        zamknij = function () {
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button
            $(idDialog).dialog('close');
        },


        otworz = function (idButtona) {
            var div,
                i,
                idSelected,
                cssSelect = {
                    //'border': '0.1em solid',
                    //'border-color': 'grey',
                    'padding': '1',
                    'width': '80%',
                    'display': 'inline-block',
                    'margin': '2px 2px 2px 2px'
                },
                tempPlcId = '',
                select;

            //if (init === false) { // pobranie informacji o danych potrzebnych do odswiezania (pozycja w ramce, bitu itp)
            obiektyDoWykresow = [];
            obiektyDoWykresow = obiektyDoWykresow.concat(json.szukajWykresow("tak", varGlobal.sygnaly));
            //init = true;
            //console.log(obiektyDoWykresow.length);
            obiektyDoWykresow = ustawKolejnosc.inicjacja({
                inputData: obiektyDoWykresow,
                sortData: false
            });
            //console.log(obiektyDoWykresow.length);
            varGlobal.daneDoWykresow = obiektyDoWykresow;
            //}

            div = document.createElement("div");
            $(div)
                .addClass('OknaDialog')
                .attr('id', idDialog.replace("#", ""));
            $('body').append(div);

            $(idDialog).dialog({
                autoOpen: false,
                modal: false,
                closeOnEscape: false,
                height: ($(document).height() - 50),
                width: '95%',
                title: $(idButtonPowrot).text(),
                show: {
                    delay: 0,
                    effect: varGlobal.efektShowHide, // shake  bounce  pulsate
                    duration: 350
                },
                hide: {
                    effect: varGlobal.efektShowHide,
                    duration: 350
                }
            });

            div = document.createElement("div");
            $(div)
                .addClass('klasaButtonWykresy')
                .css(cssSelect);
            select = document.createElement("select");
            $(select)
                .text('_text')
                .attr('id', 'idWykresy01')
                .attr('name', 'idWykresy01');
            $(div).append(select);
            $(idDialog).append(div);
            $("#idWykresy01")[0].options.add(new Option(" - ", 1));
            for (i = 0; i < obiektyDoWykresow.length; i += 1) {
                tempPlcId = '';
                if (obiektyDoWykresow[i].plc_id !== undefined) {
                    tempPlcId = obiektyDoWykresow[i].plc_id;
                }
                $("#idWykresy01")[0].options.add(new Option(tempPlcId + ' ' + obiektyDoWykresow[i].opis_pelny, obiektyDoWykresow[i].id));
            }
            $("#idWykresy01")
                .selectmenu({
                    width: '100%'
                })
                .selectmenu("menuWidget")
                .addClass("overflow");

            $(idDialog).dialog("open");
            $(idDialog).find(".klasaButtonWykresy").first().addClass("kopex-selected");
            idSelected = $(idDialog).find(".klasaButtonWykresy").first().find('select').attr('id');
            $("#" + idSelected).selectmenu("open"); // rozwinięcie wszystkich opcji
            //$("#" + idSelected).next().focus(); // focus na element <span> składający się na kontrolkę selectMenu

            $(idDialog).on("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });

        },


        inicjacja = function (idButtona) {
            idButtonPowrot = '#' + idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });
        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij
    };
});