/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON'], function ($, varGlobal, json) {
    "use strict";

    var init = false,
        idDialog = "#dialogWymianaPLC", // tak będzie nazwane okienko popup
        idButtonPowrot, // po zamknięciu caego okienka dialog powrot na button w zakladce tab ustawienia
        tytul,
        idButtonPowrotMenu,
        noweMenu,
        fragMenu2 = document.createDocumentFragment(),


        nowaZawartoscMenu = function (_noweMenu) {
            $(idDialog).empty();
            require(['wspolne/dodajMenu2'], function (dodajMenu2) {
                fragMenu2 = dodajMenu2.dodajElementyHtml(_noweMenu, 'przyciskMenuPodmianaPLC'); // przyciskMenuPoziomDost
                $(idDialog).append(fragMenu2);
                $("button").button();
                // podświetlenie klaiwsza, który był wcześniej kliknięty
                if ($(idButtonPowrotMenu).length === 0) { // wejscie do pod-menu
                    $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state);
                    $(idDialog).dialog("option", "title", tytul);
                } else { // wyjscie z pod-menu

                    $(idButtonPowrotMenu).addClass("kopex-selected").addClass(varGlobal.ui_state);
                    $(idDialog).dialog("option", "title", $(idButtonPowrot).button('option', 'label'));
                }

                dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y
            });
        },


        wyswietlPotwierdzenie = function (_obiekt) {
            require(['potwierdzenie'], function (potwierdzenie) {
                potwierdzenie.inicjacja({ // wywołanie
                    text: _obiekt.OPIS
                }).done(function (odpowiedzAsynch) { // odpowiedź asynchroniczna 
                    $(idButtonPowrotMenu).addClass("kopex-selected");
                    switch (odpowiedzAsynch) {
                    case 'enter':
                        require(['progresBar'], function (progresBar) {
                            progresBar.inicjacja({
                                show: true,
                                status: 'sending'
                            });
                        });
                        json.wyslij(_obiekt.rozkaz);
                        console.log(_obiekt.rozkaz);
                        break;
                    case 'escape':
                        break;
                    }
                });
            });
        },


        wcisnietoEscape = function () {
            if ($(idDialog).hasClass('submenu')) {
                $(idDialog).removeClass('submenu');
                nowaZawartoscMenu(varGlobal.danePlikuKonfiguracyjnego.MENU_ZMIANA_PLC);
            } else {
                $(idDialog).trigger('dialogclose'); // wymuszenie zdarzenia zamknięcia okienka dialog
            }
        },


        wcisnietoEnter = function (_buttonId) { // sprawdzenie czy wywołać submenu czy okienko potwierdzające z wysłaniem rozkazu do plc
            var obiekt,
                obiektPodButtonem,
                sprawdzMenu = function (_menu) {
                    var i;
                    for (i = 0; i < _menu.length; i += 1) {
                        if (_menu[i].id === _buttonId) {
                            obiektPodButtonem = _menu[i];
                        }
                    }
                };

            sprawdzMenu(varGlobal.danePlikuKonfiguracyjnego.MENU_ZMIANA_PLC); // sprawdzenie czy klikniety button to element glownego menu
            idButtonPowrotMenu = '#' + _buttonId;
            console.log($(idButtonPowrotMenu).button('option', 'label'));
            //$(selected).button("option", "label", varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakDostepu);
            tytul = $(idButtonPowrotMenu).button('option', 'label');

            if (obiektPodButtonem === undefined) { // klawisz z submenu (np wybór pojedynczego pliku parametrów)
                $(idButtonPowrotMenu).removeClass("kopex-selected");
                sprawdzMenu(noweMenu);
                wyswietlPotwierdzenie(obiektPodButtonem);
            } else {
                if (obiektPodButtonem.zawartosc.length > 1) { // wciśnięty klawisz posiada submenu
                    $(idDialog).addClass('submenu');
                    noweMenu = obiektPodButtonem.zawartosc;
                    nowaZawartoscMenu(noweMenu);
                } else { // wciśnięty klawisz nie posiada submenu
                    $(idButtonPowrotMenu).removeClass("kopex-selected");
                    wyswietlPotwierdzenie(obiektPodButtonem);
                }
            }
        },


        otworz = function () {
            var div,
                top,
                iloscButtonow,
                wysokoscButtona,
                wysokoscDiv;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .css({
                        'padding': '1em',
                        'margin': '1em'
                    })
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    autoOpen: false,
                    height: "auto",
                    width: '60%',
                    title: $(idButtonPowrot).text()
                });

                require(['wspolne/dodajMenu2'], function (dodajMenu2) {
                    fragMenu2 = dodajMenu2.dodajElementyHtml(varGlobal.danePlikuKonfiguracyjnego.MENU_ZMIANA_PLC, 'przyciskMenuPodmianaPLC'); // przyciskMenuPoziomDost
                    $(idDialog).append(fragMenu2);
                    $(idDialog).dialog("open");
                    $("button").button();
                    $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state);

                    //console.log($(idDialog).children().first().attr('id'));

                    dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y


                    $(idDialog).dialog("option", "position", {
                        my: "center",
                        at: "center",
                        of: window
                    });
                });
            } else {
                console.log('dialog juz otwarty: ' + idDialog);
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
                $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button wywołujący
            });
        },


        inicjacja = function (_idButtona) {
            idButtonPowrot = '#' + _idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });
        };


    return {
        inicjacja: inicjacja,
        wcisnietoEnter: wcisnietoEnter,
        wcisnietoEscape: wcisnietoEscape
    };

});