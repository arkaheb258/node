/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'wspolne/dodajMenu2'], function ($, varGlobal, json, dodajMenu2) {
    "use strict";

    var nazwaDialog,
        idDialog = "#DialogParametry",
        subMenuAktywne = false,
        idButtonMenuGlowne,
        idButtonPowrot,

        otworzDialog = function (tytul, frag) {
            var ul,
                div;


            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", "")); //idDialog.replace("#", ""))            dialogWymianaPLC
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() / 2),
                    width: '55%',
                    title: tytul,
                    show: {
                        delay: 200,
                        effect: varGlobal.efektShowHide, // shake  bounce  pulsate
                        duration: 350
                    },
                    hide: {
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    }
                });

                $(idDialog).append(frag);
                $("button").button(); // Nadanie stylu jquery
                $(idDialog).dialog("open");
            } else {
                $(idDialog).empty();
                $(idDialog).append(frag);
                $("button").button(); // Nadanie stylu jquery
                $(idDialog).dialog("open");
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });

        },


        zamkniecieOkienka = function () {
            var fragMenu2 = document.createDocumentFragment();

            if (subMenuAktywne) { // Przejscie poziom wyzej w menu parametrow...
                fragMenu2 = dodajMenu2.dodajElementyHtml(varGlobal.danePlikuKonfiguracyjnego.MENU_PAR, 'przyciskMenuParametry');
                otworzDialog(nazwaDialog, fragMenu2);
                dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y
                subMenuAktywne = false;
                $('#' + idButtonMenuGlowne).addClass("kopex-selected").addClass(varGlobal.ui_state);
            } else { // Wyjscie z menu parametrow i zamkniecie okienka dialog
                $(idDialog).empty();
                $(idDialog).dialog('close');
                $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button parametrow
            }
        },


        wyslijDoPLC = function () { // wyslanie save / load file z parametrami uzytkownika
            require(['progresBar'], function (progresBar) {
                progresBar.inicjacja({
                    show: true,
                    status: 'sending'
                }).done(function (odpowiedzAsynch) {
                    require(['alert'], function (alert) {
                        alert.inicjacja({
                            texts: [varGlobal.danePlikuKonfiguracyjnego.TEKSTY.uruchomPonownie],
                            background: 'ui-state-default',
                            timer: 5000
                        });
                    });
                });
            });

            json.wyslij(varGlobal.doWyslania.parametrPlik);
            console.log(varGlobal.doWyslania.parametrPlik);
        },


        subMenu = function (buttonId) {
            var znalezionyObiekt,
                i,
                menu,
                fragMenu2,
                stworzsubMenu = function (buttonId) {
                    menu = varGlobal.danePlikuKonfiguracyjnego.MENU_PAR;
                    for (i = 0; i < menu.length; i += 1) {
                        if (menu[i].id === buttonId) {
                            fragMenu2 = dodajMenu2.dodajElementyHtml(menu[i].zawartosc, 'przyciskMenuParametry');
                            otworzDialog($("#" + buttonId).text(), fragMenu2);
                            dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y
                            $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state); // Skierowanie nawigacji z klawiatury na nowo stworzone elementy submenu
                        }
                    }
                };

            switch (buttonId) {
            case 'mg_edycja':
                idButtonMenuGlowne = buttonId;
                require(['parametry/listaParametrow'], function (lista) { //   /oknoMenuGlowne
                    lista.inicjacja();
                });
                break;

            case 'mg_domyslne':
                idButtonMenuGlowne = buttonId;
                stworzsubMenu(buttonId);
                subMenuAktywne = true;
                break;

            case 'mg_wczytaj':
                idButtonMenuGlowne = buttonId;
                stworzsubMenu(buttonId);
                subMenuAktywne = true;
                break;

            case 'mg_zapisz':
                idButtonMenuGlowne = buttonId;
                stworzsubMenu(buttonId);
                subMenuAktywne = true;
                break;

            case 'mg_poziomDostepu':
                require(['poziomDostepu/main'], function (poziomDostepu) {
                    poziomDostepu.otworzMenu();
                });
                break;

            case 'ms_nie':
                zamkniecieOkienka();
                break;

            case 'default':
                varGlobal.doWyslania.parametrPlik.plik = 'default';
                varGlobal.doWyslania.parametrPlik.akcja = 'load';
                wyslijDoPLC();
                break;
            case 'loadFileUser1':
                varGlobal.doWyslania.parametrPlik.plik = 'user1';
                varGlobal.doWyslania.parametrPlik.akcja = 'load';
                wyslijDoPLC();
                break;
            case 'loadFileUser2':
                varGlobal.doWyslania.parametrPlik.plik = 'user2';
                varGlobal.doWyslania.parametrPlik.akcja = 'load';
                wyslijDoPLC();
                break;
            case 'loadFileUser3':
                varGlobal.doWyslania.parametrPlik.plik = 'user3';
                varGlobal.doWyslania.parametrPlik.akcja = 'load';
                wyslijDoPLC();
                break;
            case 'loadFileUser4':
                varGlobal.doWyslania.parametrPlik.plik = 'user4';
                varGlobal.doWyslania.parametrPlik.akcja = 'load';
                wyslijDoPLC();
                break;
            case 'loadFileUser5':
                varGlobal.doWyslania.parametrPlik.plik = 'user5';
                varGlobal.doWyslania.parametrPlik.akcja = 'load';
                wyslijDoPLC();
                break;
            case 'saveFileUser1':
                varGlobal.doWyslania.parametrPlik.plik = 'user1';
                varGlobal.doWyslania.parametrPlik.akcja = 'save';
                wyslijDoPLC();
                break;
            case 'saveFileUser2':
                varGlobal.doWyslania.parametrPlik.plik = 'user2';
                varGlobal.doWyslania.parametrPlik.akcja = 'save';
                wyslijDoPLC();
                break;
            case 'saveFileUser3':
                varGlobal.doWyslania.parametrPlik.plik = 'user3';
                varGlobal.doWyslania.parametrPlik.akcja = 'save';
                wyslijDoPLC();
                break;
            case 'saveFileUser4':
                varGlobal.doWyslania.parametrPlik.plik = 'user4';
                varGlobal.doWyslania.parametrPlik.akcja = 'save';
                wyslijDoPLC();
                break;
            case 'saveFileUser5':
                varGlobal.doWyslania.parametrPlik.plik = 'user5';
                varGlobal.doWyslania.parametrPlik.akcja = 'save';
                wyslijDoPLC();
                break;
            }



        },


        stworzMenuGlowne = function () { //idKliknietegoButtona
            var fragMenu2 = document.createDocumentFragment();

            //varGlobal.parametry = json.pobierz("parametry.json");
            fragMenu2 = dodajMenu2.dodajElementyHtml(varGlobal.danePlikuKonfiguracyjnego.MENU_PAR, 'przyciskMenuParametry'); //varGlobal.parametry.MENU
            otworzDialog(nazwaDialog, fragMenu2);
            dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y
            $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state); // Skierowanie nawigacji z klawiatury na nowo stworzone elementy submenu
        },


        inicjacja = function () {
            idButtonPowrot = "#idParametry";
            nazwaDialog = $("#idParametry").text();
            $("#idParametry").on("click", function (event, ui) {
                stworzMenuGlowne(); // otwarcie okienka dialog
            });
        };


    return {
        inicjacja: inicjacja,
        stworzMenuGlowne: stworzMenuGlowne,
        subMenu: subMenu,
        zamkniecieOkienka: zamkniecieOkienka
    };
});