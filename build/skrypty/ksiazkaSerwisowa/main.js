/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */

// po kliknięciu na button z czynnością serwisową wyświetli się okienko z pytaniem potwierdzającym o zatwierdzenie akcji
define(['jquery', 'obslugaJSON', 'zmienneGlobalne', 'kommTCP'], function ($, json, varGlobal, dane) {
    "use strict";

    var daneDoOdswiezania = [],
        idDialog,
        idButtonPowrot,


        zamknij = function () {
            $(idDialog).empty();
            $(idDialog).dialog('close');
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button eks
        },


        dodajDaneDoOdswiezania = function () {
            daneDoOdswiezania = [];
            daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("licznikiEKS", varGlobal.sygnaly));
            //console.log(daneDoOdswiezania);
        },


        otworz = function () {
            var div,
                i,
                j,
                licznik,
                ul,
                button,
                li,
                a,
                menuEKS,
                p,
                wartoscLicznika, // cała wartość licznika (zawiera w sobie dwie informacje - czas do przeglądu i po przeglądzie)
                tekst,
                kolorTekstu,
                length;

            if ($("#DialogKsiazkaSerwisowa").length === 0) { // sprawdzenie czy div już nie istnieje

                idDialog = "#DialogKsiazkaSerwisowa";
                dodajDaneDoOdswiezania(); // pobranie liczników dla wszystkich czynności przy każdym otwarciu okienka

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', 'DialogKsiazkaSerwisowa');
                $('body').append(div);

                $("#DialogKsiazkaSerwisowa").dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() / 1.2),
                    width: '90%',
                    title: $(idButtonPowrot).text()
                });

                // dodanie zakładek tabs - szkielet
                div = document.createElement("div");
                $(div)
                    .addClass('panelTab')
                    .attr('id', 'tabsEKS')
                    .appendTo('#DialogKsiazkaSerwisowa');
                ul = document.createElement("ul");
                $(ul).appendTo('#tabsEKS');

                //console.log(daneDoOdswiezania);
                //console.log(varGlobal.danePlikuKonfiguracyjnego.MENU_EKS);
                menuEKS = varGlobal.danePlikuKonfiguracyjnego.MENU_EKS;
                for (i = 0; i < menuEKS.length - 1; i += 1) {

                    li = document.createElement("li");
                    a = document.createElement("a");
                    $(a)
                        .attr('href', "#" + menuEKS[i].id)
                        .text(menuEKS[i].OPIS)
                        .appendTo(li);
                    $(li).appendTo(ul);

                    div = document.createElement("div");
                    $(div)
                        .addClass('panelTab')
                        .css({
                            'width': '95%',
                            'overflow': 'auto', // auto    scroll
                            'height': '90%'
                        })
                        .attr('id', menuEKS[i].id)
                        .appendTo('#tabsEKS');

                    for (j = 0; j < menuEKS[i].zawartosc.length; j += 1) {


                        length = daneDoOdswiezania.length;
                        for (licznik = 0; licznik < length; licznik += 1) {

                            if (daneDoOdswiezania[licznik].id === menuEKS[i].zawartosc[j].id) {
                                kolorTekstu = '';
                                // wartość dodatnia licznika mówi nam, że termin został przekroczony
                                wartoscLicznika = dane.daneTCP.analog[daneDoOdswiezania[licznik].poz_ramka];
                                if (wartoscLicznika > 0) {
                                    wartoscLicznika = wartoscLicznika & 0x7FFF;
                                    tekst = '[ ' + wartoscLicznika + ' ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.dniDoPrzegladu + ' ]'; // "dniDoPrzegladu"
                                } else if (wartoscLicznika === 0) {
                                    tekst = ''; //ccc
                                } else {
                                    kolorTekstu = 'red';
                                    tekst = '[ ' + Math.abs(wartoscLicznika) + ' ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.dniPoTerminie + ' ]'; // "dniPoTerminie"
                                }
                            }
                        }

                        button = document.createElement('button');
                        $(button)
                            .addClass('buttonEKS')
                            .appendTo("#" + menuEKS[i].id)
                            .attr('id', menuEKS[i].zawartosc[j].id)
                            .text(menuEKS[i].zawartosc[j].OPIS + ' ' + tekst)
                            .css({
                                'color': kolorTekstu,
                                'margin': '0.3%',
                                'width': '95%',
                                'padding-left': '3%',
                                'text-align': 'left',
                                'font-weight': 'normal',
                                'top': '5%'
                            });

                        if (menuEKS[i].id === "tab1eks") { // na zakładce 1 ze zdarzeniami dziennymi...
                            if (menuEKS[i].zawartosc[j].id === "eks0") { // ...tylko pierwsze pole ma być aktywne, reszta ma służyć czysto informacyjnie
                                $(button).button({
                                    disabled: false
                                });
                            } else {
                                $(button).button({
                                    disabled: true
                                });
                            }
                        }

                    }
                }

                $("div#tabsEKS").tabs(); // sformatowanie na jquerry
                $("div#tabsEKS").tabs("refresh");
                $("button").button();
                $("#DialogKsiazkaSerwisowa").dialog("open");

                $("#DialogKsiazkaSerwisowa").addClass("kopex-selected");
            }

            $("#DialogKsiazkaSerwisowa").one("dialogclose", function (event, ui) {
                $("#DialogKsiazkaSerwisowa").remove();
            });
        },


        inicjacja = function (idButtona) {

            idButtonPowrot = '#' + idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });

            require(['ksiazkaSerwisowa/odswiezaj'], function (odswiezaj) { // inicjacja odświeżania danych
                odswiezaj.inicjacja();
            });

        };

    return {
        inicjacja: inicjacja,
        zamknij: zamknij
    };
});
