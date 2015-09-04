/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'dodajPojedynczaTabele', 'ustawKolejnosc'], function ($, varGlobal, json, dodajPojedynczaTabele, ustawKolejnosc) {
    'use strict';


    // robione po staremu, bez specjalnego rozkazu o dane diagnostyczne. Dane są brane ze standardowej ramki tcp
    var pasujaceObiekty,
        modulyPLC = [],
        idDialog = "#dialogDiagnostykaPLC", // tak będzie nazwane okienko popup
        idButtonPowrot, // po zamknięciu caego okienka dialog powrot na button w zakladce tab ustawienia
        intervalId,
        init = false,


        dodajSygnalyPLC = function (_nazwaPLC) {
            var i,
                length,
                tr,
                sygnalyPLC = [];

            $("#tabelaPLCMain").empty();
            length = pasujaceObiekty.length;
            for (i = 0; i < length; i += 1) {
                if (pasujaceObiekty[i].plc_nr === _nazwaPLC) {
                    sygnalyPLC.push(pasujaceObiekty[i]);
                }
            }

            dodajPojedynczaTabele.dodaj({
                objects: sygnalyPLC,
                id: '#tabelaPLCMain',
                cssDescription: 'tdOpis',
                cssValue: 'tdWartosc'
            });

            // zmiana pozycji okienka dialogo po zwieksznie/zmniejszeniu liczby elementow
            $(idDialog).dialog("option", "position", {
                my: "center",
                at: "center",
                of: window
            });

            clearInterval(intervalId); // wyłączenie timera z poprzedniego radiobutoona, inaczej powstawałyby coraz to nowe instancje timerów
            intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                require(['diagnostykaPLC/odswiezaj'], function (odswiezaj) {
                    odswiezaj.aktualizuj(sygnalyPLC);
                });
            }, varGlobal.czasOdswiezania);
        },


        zamknij = function () {
            $(idDialog).trigger('dialogclose');
            clearInterval(intervalId);
            //console.log('zamykam');
        },


        otworz = function () {
            var div,
                i,
                input,
                label,
                szerokoscDialog,
                button,
                tabela;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                szerokoscDialog = $(window).width() * 0.65;
                $(idDialog).dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: false,
                    height: 'auto',
                    width: szerokoscDialog,
                    title: $(idButtonPowrot).text() //varGlobal.danePlikuKonfiguracyjnego.MENU_ZMIANA_PLC.tytul
                });

                div = document.createElement("div"); // stworzenie radiobuttona z nazwami modulow PLC
                $(div)
                    .attr('id', 'radio')
                    .attr('text', 'bla bla');
                for (i = 0; i < modulyPLC.length; i += 1) {
                    button = document.createElement('button');
                    $(button)
                        .addClass('radioButtonPLC')
                        .attr('id', modulyPLC[i])
                        .text(modulyPLC[i])
                        .css({
                            'margin': '0.1em'
                        })
                        .appendTo(div)
                        .button();
                }
                $(idDialog).append(div);

                tabela = document.createElement("table"); // stworzenie tabeli do ktorej beda ladowane komorki z sygnalami PLC
                $(tabela)
                    .addClass('tabelaSub')
                    .attr('id', 'tabelaPLCMain');
                $(idDialog).append(tabela);

                dodajSygnalyPLC(modulyPLC[0]);

                $(idDialog).dialog("open"); // otwarcie dialogu
                $("#radio").children().first().blur();
                $("#radio").children().first().addClass("kopex-selected").addClass(varGlobal.ui_state);
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
                $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button wywołujący
            });
        },


        inicjacja = function () {
            var i;

            if (!init) {
                init = true;
                $(".PLC").on("click", function (event, ui) {
                    idButtonPowrot = event.target.id;
                    pasujaceObiekty = []; // wyczyszczenie tablicy z poprzedniego wyszukiwania
                    modulyPLC = []; // Wyczyszczenie tablicy z poprzednich wynikow
                    modulyPLC = idButtonPowrot.split("_"); // stworzenie z nazwy buttona tablicy stringow oddzielonych znakiem "_"
                    //console.log(modulyPLC);
                    for (i = 0; i < modulyPLC.length; i += 1) {
                        //pasujaceObiekty = pasujaceObiekty.concat(json.szukajWartosciWerWypos(modulyPLC[i])); // przeszukanie tablicy pod katem pasujacych id i scalenie wynikow
                        pasujaceObiekty = pasujaceObiekty.concat(json.szukajWartosci(modulyPLC[i])); // przeszukanie tablicy pod katem pasujacych id i scalenie wynikow
                    }
                    idButtonPowrot = '#' + idButtonPowrot;
                    
                    pasujaceObiekty = ustawKolejnosc.inicjacja({
                        inputData: pasujaceObiekty,
                        sortData: false
                    });

                    otworz(); // otwarcie okienka dialog
                });
            }

        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        dodajSygnalyPLC: dodajSygnalyPLC
    };


});