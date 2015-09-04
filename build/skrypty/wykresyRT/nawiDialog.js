/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';


    var idSelected,
        idNext,
        idDialog,
        czySelectMenuZwiniete = false,

        // STRUKTURA HTML opisująca umieszczenie kontrolkę selectMenu:
        //                <div class="klasaButtonWykresy">
        //                    <select id="idFalownikTrybPracy"> </select>
        //                    <span class=ui-selectmenu-button> </span>
        //                </div>

        wykonaj = function (kod, selected) {
            var tablicaVal = ['0', '1', '2'], // tutaj są wrzucone wybrane wartości z wszystkich trzech menuselect
                e = jQuery.Event("keydown"), // działa tylko zdarzenie keydown
                wcisnietoEscape = function (_kierunek) {
                    if (!czySelectMenuZwiniete) { // menu jest otwarte
                        czySelectMenuZwiniete = true;
                        $('#' + idSelected).selectmenu("close");
                    } else {
                        czySelectMenuZwiniete = false;
                        require(['wykresyRT/main'], function (main) {
                            main.zamknij();
                        });
                    }
                },
                wcisnietoEnter = function (_kierunek) {
                    tablicaVal[0] = $("#idWykresy01").val();
                    if (!czySelectMenuZwiniete) { // menu jest otwarte
                        czySelectMenuZwiniete = true; // enter automatycznie zwija menu
                        require(['wykresyRT/rysujWykresy'], function (rysujWykresy) {
                            rysujWykresy.inicjacja('#' + idDialog, tablicaVal);
                        });
                    } else { // menu jest zamkniete
                        czySelectMenuZwiniete = false;
                        $('#' + idSelected).selectmenu("open");
                    }
                };

            
            idDialog = selected.parent().attr('id');
            idSelected = selected.find('select').attr('id');

            // Nawigacja reagująca na dane z klawiatury usb
            if (varGlobal.typNawigacjiPoEkranach === 0) { // 0 - komendy z klawiatury usb,  1 - komendy z ramki tcp
                switch (kod) {
                case varGlobal.kodyKlawiszy.escape:
                    wcisnietoEscape();
                    break;
                case varGlobal.kodyKlawiszy.enter:
                    wcisnietoEnter();
                    break;
                }
            }
            // Nawigacja reagująca na dane z ramki tcp
            if (varGlobal.typNawigacjiPoEkranach === 1) {
                switch (kod) {
                case varGlobal.kodyKlawiszy.gora:
                    e.keyCode = $.ui.keyCode.UP;
                    $("#" + idSelected).next().trigger(e); // trzeba zadziałać na element <span>
                    break;
                case varGlobal.kodyKlawiszy.dol:
                    e.keyCode = $.ui.keyCode.DOWN;
                    $("#" + idSelected).next().trigger(e); // trzeba zadziałać na element <span>
                    break;
                case varGlobal.kodyKlawiszy.escape:
                    wcisnietoEscape();
                    break;
                case varGlobal.kodyKlawiszy.enter:
                    e.keyCode = $.ui.keyCode.ENTER;
                    $("#" + idSelected).next().trigger(e); // trzeba zadziałać na element <span>
                    //console.log('tcp: ' + $("#" + idSelected).val());
                    wcisnietoEnter();
                    break;
                }
                varGlobal.typNawigacjiPoEkranach = 0; // oczekiwanie na ewentualną nawigację z klawiatury
            }


        };

    return {
        wykonaj: wykonaj
    };
});