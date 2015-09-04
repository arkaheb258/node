/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery', 'zmienneGlobalne', 'kommTCP', 'dodajPojedynczaTabele', 'obslugaJSON'], function ($, varGlobal, dane, dodajPojedynczaTabele, json) {
    'use strict';


    var idDialog = "#dialogDiagnostykaBloku", // tak będzie nazwane okienko popup
        pasujaceObiekty,
        intervalId,

        dodajSygnalyPLC = function (_nazwaPLC) {
            var i,
                length,
                tr,
                sygnalyPLC = [];

            $("#tabelaPLCMain").empty();
            length = pasujaceObiekty.length;
            for (i = 0; i < length; i += 1) {
                if (pasujaceObiekty[i].PLCNR === _nazwaPLC) {
                    sygnalyPLC.push(pasujaceObiekty[i]);
                }
            }

            dodajPojedynczaTabele.dodaj({
                objects: sygnalyPLC,
                id: '#tabelaPLCMain',
                cssDescription: 'tdOpis',
                cssValue: 'tdWartosc',
                advDiagn: true
            });

            // zmiana pozycji okienka dialog po zwieksznie/zmniejszeniu liczby elementow
            $(idDialog).dialog("option", "position", {
                my: "center",
                at: "center",
                of: window
            });

            //console.log(sygnalyPLC);

            clearInterval(intervalId); // zakończenie odświeżania z poprzedniej karty
            intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                require(['diagnostykaBloki/odswiezaj'], function (odswiezaj) {
                    odswiezaj.aktualizuj(sygnalyPLC);
                });
            }, varGlobal.czasOdswiezania);

        },


        zamknij = function () {
            $(idDialog).remove();
            pasujaceObiekty = [];
            clearInterval(intervalId);
            require(['diagnostykaBloki/main'], function (main) {
                main.otworz();
            });
        },


        dodajPozycjeDanych = function () { // dodanie dodatkowych pól json z pozycjami bitów oraz analogów w ramce rozkazu a dane diagnostyczne
            var i,
                tempDaneDiag,
                licznikWordow = 0,
                licznikBitow = 0,
                licznikAnalogow = 0,
                length;

            tempDaneDiag = dane.daneDiag;
            length = pasujaceObiekty.length;
            //sprawdzenie czy ilości danych w ramce zgadzają się z ilością obiektów znalezionych w jsonie
            if (tempDaneDiag.DigitData_Len !== length) {
                console.log('Nieprawidłowa ilość danych, DigitData_Len:' + tempDaneDiag.DigitData_Len + ' obiektyJson:' + length);
            }

            for (i = 0; i < length; i += 1) {
                if (licznikBitow > 15) {
                    licznikWordow += 1;
                    licznikBitow = 0;
                }

                pasujaceObiekty[i].pozWord = licznikWordow;
                pasujaceObiekty[i].pozBit = licznikBitow;
                pasujaceObiekty[i].id = 'tempId_' + licznikWordow + '_' + licznikBitow; // nadanie id - potrzebne do odświeżania
                if ((pasujaceObiekty[i].TYPWEWY === 'AN') || (pasujaceObiekty[i].TYPWEWY === 'NAM')) {
                    pasujaceObiekty[i].pozAn = licznikAnalogow;
                    licznikAnalogow += 1;
                }

                // dodanie nowych pól aby móc odświeżać dane standardową procedura diagnostykaPLC/odswiezaj.js
                //                pasujaceObiekty[i].typ_danych = 'Bit';
                //                if (pasujaceObiekty[i].TYPWEWY === 'AN') {
                //                    pasujaceObiekty[i].typ_danych = 'Analog';
                //                } else {
                //                    pasujaceObiekty[i].typ_danych = 'Bit';
                //                }
                //                pasujaceObiekty[i].jednostka = pasujaceObiekty[i].TYPWEWY;

                licznikBitow += 1;
            }
        },


        inicjacja = function (_menu, _obiekty) {
            var div,
                i,
                input,
                label,
                button,
                szerokoscDialog,
                tabela;

            pasujaceObiekty = _obiekty;
            dodajPozycjeDanych();

            //console.log(pasujaceObiekty);

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                szerokoscDialog = $(window).width() * 0.70;
                $(idDialog).dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: false,
                    height: 'auto', // ($(document).height() / 2.5)
                    width: szerokoscDialog,
                    title: _obiekty[0].NBLK //varGlobal.danePlikuKonfiguracyjnego.MENU_ZMIANA_PLC.tytul
                });

                div = document.createElement("div"); // stworzenie radiobuttona z nazwami modulow PLC
                $(div)
                    .attr('id', 'radio')
                    .attr('text', 'bla bla');
                for (i = 0; i < _menu.length; i += 1) {
                    button = document.createElement('button');
                    $(button)
                        .addClass('radioButtonDiagnBloki')
                        .attr('id', _menu[i])
                        .text(_menu[i])
                        .css({
                            'margin': '0.1em'
                        })
                        .appendTo(div)
                        .button();
                }
                $(idDialog).append(div);

                tabela = document.createElement("table"); // stworzenie tabeli do ktorej beda ladowane komorki z sygnala,mi PLC
                $(tabela)
                    .addClass('tabelaSub')
                    .attr('id', 'tabelaPLCMain');
                $(idDialog).append(tabela);

                dodajSygnalyPLC(_menu[0]);
                $(idDialog).dialog("open"); // otwarcie dialogu
                $("#radio").children().first().blur();
                $("#radio").children().first().addClass("kopex-selected").addClass(varGlobal.ui_state);
            }
        };


    return {
        inicjacja: inicjacja,
        dodajSygnalyPLC: dodajSygnalyPLC,
        zamknij: zamknij
    };


});