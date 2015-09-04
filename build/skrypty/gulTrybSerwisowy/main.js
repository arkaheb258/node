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
        idDialog = "#DialogGULtrybSerwisowy", // tak będzie nazwane okienko popup
        idButtonPowrot, // po zamknięciu caego okienka dialog powrot na button w zakladce tab ustawienia
        tytul,
        idButtonPowrotMenu,
        intervalId,


        zamknij = function () {
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button
            $(idDialog).dialog('close');
        },


        wylaczTrybSerwisowy = function () {
            clearInterval(intervalId);
            varGlobal.doWyslania.zalTrybSerwisowy.wTrybCiagnikowId = 0;
            varGlobal.doWyslania.zalTrybSerwisowy.aktywuj = 0;
            json.wyslij(varGlobal.doWyslania.zalTrybSerwisowy);
            console.log(varGlobal.doWyslania.zalTrybSerwisowy);
        },


        podtrzymujTrybSerwisowy = function (_rozkaz) {
            clearInterval(intervalId);
            intervalId = setInterval(function () {
                //console.log(_rozkaz);
                //json.wyslij(_rozkaz);
            }, 3000);
        },



        otworzMenu = function () {
            var div,
                fragMenu2 = document.createDocumentFragment();


            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .css({
                        'padding': '2em',
                        'margin': '1em'
                    })
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    autoOpen: false,
                    height: "auto",
                    width: '70%',
                    title: $(idButtonPowrot).text()
                });

                require(['wspolne/dodajMenu2'], function (dodajMenu2) {
                    fragMenu2 = dodajMenu2.dodajElementyHtml(varGlobal.danePlikuKonfiguracyjnego.MENU_GULTRYBSERW[0].zawartosc, 'przyciskMenuGULTrybSerw');
                    $(idDialog).append(fragMenu2);
                    $(idDialog).dialog("open");
                    $("button").button(); // Nadanie stylu jquery
                    $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state); // Skierowanie nawigacji z klawiatury na nowo stworzone elementy submenu
                    dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y   

                    $(idDialog).dialog("option", "position", {
                        my: "center",
                        at: "center",
                        of: window
                    });
                });
            }

//            require(['gulTrybSerwisowy/tooltip'], function (tooltip) {
//                tooltip.inicjacja(idDialog);
//            });

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });
        },


        inicjacja = function (_idButtona) {
            idButtonPowrot = '#' + _idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworzMenu();
            });
        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        podtrzymujTrybSerwisowy: podtrzymujTrybSerwisowy,
        wylaczTrybSerwisowy: wylaczTrybSerwisowy
    };

});