/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'keyboard', 'jqueryUI', 'zmienneGlobalne', 'keyboardNav', 'dateTime', 'dateTimePL'], function ($, keyboard, ui, varGlobal, keyboardNav, dateTime, dateTimePL) { // 'dateTimePL'
    'use strict';

    var ccc = "drop", // drop    blind   clip fold slide

        aktywujTabs = function () {
            $("#tabs").tabs({ // Wypelnienie tabow
                heightStyle: "fill",
                active: 0,
                activate: function (event, ui) {
                    $("#accordion").accordion("refresh"); // Trzeba odswiezac po otworzeniu tabu bo wysokosc accordiona sie rozjezdza
                },
                load: function (event, ui) {

                },
                beforeActivate: function (event, ui) { // za każdym przejściem przez tab sprawdzenie czy nie zmieniła się obudowa LP -> wtedy przeładować grafikę
                    if (ui.newPanel.attr('id') === 'tab1') {
                        require(['parametry/odswiez'], function (odswiez) {
                            switch (varGlobal.typKombajnu) {
                            case 'KTW':
                                odswiez.sprawdzTypObudowyLP();
                                break;
                            case 'GUL':
                                odswiez.sprawdzKierunekRolki();
                                break;
                            default:
                            }
                        });
                    }
                },
                create: function (event, ui) {
                    //$("#tabs").find("li").first().focus(); // ustawienie focusu na pierwszym tabie aby wymusic mozliwosc nawigacji z klawiatury
                }
            });
        },

        aktywujDialog = function () { // Wyskakujace okienka (dane bitowe, analogi, parametry itp)
            $('.OknaDialog').dialog({
                position: {
                    my: "center",
                    at: "center",
                    of: $("body"),
                    within: $("body")
                },
                scrollable: true,
                closeOnEscape: false,
                autoOpen: false,
                modal: true,
                show: {
                    effect: varGlobal.efektShowHide,
                    duration: 350
                },
                hide: {
                    effect: varGlobal.efektShowHide,
                    duration: 350
                },
                close: function (event, ui) {
                    $('.tabelaMain').empty(); // Po zamknieciu wyczyszczenie zawartosci okienka
                    $('.kontenerGauge').empty();
                },
                height: 'auto', // auto
                width: '99%'
            });

            //            $("#DialogBlokady").dialog({
            //                buttons: [
            //                    {
            //                        disabled: true,
            //                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zatwierdz
            //                    },
            //                    {
            //                        disabled: true,
            //                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
            //                    }
            //                ]
            //            });

            $("#DialogEdycjaParametru").dialog({
                buttons: [
                    {
                        id: "button-cancel",
                        disabled: true,
                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj,
                        click: function () {
                            $(this).dialog("close");
                        }
                    }
                ],
                show: false,
                hide: false
            });

            $("#DialogPoziomDostepu").dialog({
                //dialogClass: "no-close",
                buttons: [
                    {
                        disabled: true,
                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
                    }
                ]
            });

            //            $("#DialogDataCzas").dialog({
            //                buttons: [
            //                    {
            //                        disabled: true,
            //                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zatwierdz
            //                    },
            //                    {
            //                        disabled: true,
            //                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
            //                    }
            //                ]
            //            });


            if (varGlobal.czyAnimacje === false) {
                $('#DialogWyjsciaCyfrowe').dialog("option", "show", false);
                $('#DialogWyjsciaCyfrowe').dialog("option", "hide", false);
                $('#PelnaListaKomm').dialog("option", "show", false);
                $('#PelnaListaKomm').dialog("option", "hide", false);
            }

        },

        aktywujWirualnaKlawiature = function () { // rozszerzenie dla wirtualnej klawiatury (nawigacja arrow keysami itp)
            $.extend($.keyboard.navigationKeys, {
                toggle: 112, // toggle key; F1 = 112 (event.which value for function 1 key)
                enter: 13, // Enter
                pageup: 33, // PageUp key
                pagedown: 34, // PageDown key
                end: 35, // End key
                home: 36, // Home key
                left: 37, // Left arrow key
                up: 38, // Up arrow key
                right: 39, // Right arrow key
                down: 40, // Down arrow key
                caretRt: 45, // Insert key
                caretLt: 46 // delete key
            });
        },

        aktywujSpinner = function () { // Modyfikacja kontrolki spinner aby przewijala dane typu string pobrane z tablicy
            $.widget("ui.formatSpinner", $.ui.spinner, {
                options: {},
                _parse: function (value) {
                    if (typeof value === "string") {
                        return this.options.values.indexOf(value);
                    }
                    return value;
                },
                _format: function (value) {
                    //wrap around
                    if (value < 0) {
                        value = this.options.count - 1;
                    }
                    if (value > this.options.count - 1) {
                        value = 0;
                    }
                    //console.log(value);
                    var format = this.options.values[value];
                    return format;
                }
            });
        },


        inicjacja = function () {

            aktywujTabs();
            aktywujDialog();
            aktywujWirualnaKlawiature();
            aktywujSpinner();

            // Lista komunikatow
            $(".selectable").selectable({});
        };

    return { // Metody publiczne
        inicjacja: inicjacja
    };





});