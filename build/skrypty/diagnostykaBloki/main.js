/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'wspolne/dodajMenu2'], function ($, varGlobal, json, dodajMenu2) {
    'use strict';

    //strukturaJsonPelna, // pełna struktura, czyli plik pobrany w całości
    var tablicaJson = [], // struktura bez obiektów z niepasującą wersją wyposażenia itp
        init = false,
        nazwyBlokow = [],
        intervalId,
        IDBLK,
        idDialog = "#dialogDiagnostykaBlokiMenu", // tak będzie nazwane okienko popup
        idButtonPowrot, // po zamknięciu całego okienka dialog powrot na button w  tab


        otworzDiagnostykeBloku = function (_idButtona) {
            var i,
                nazwyKartPLC = [],
                pasujaceObiekty = [],
                poprzedniaNazwaKartyPLC,
                length;

            length = tablicaJson.length;
            for (i = 0; i < length; i += 1) {
                if (tablicaJson[i].NBLK === _idButtona) {
                    pasujaceObiekty.push(tablicaJson[i]); // wychwycenie wszystkich pasujących obiektów z id wciśniętego buttona menu
                    if (tablicaJson[i].PLCNR !== poprzedniaNazwaKartyPLC) { // wychwycenie wszystkich nazw kart
                        nazwyKartPLC.push(tablicaJson[i].PLCNR);
                        poprzedniaNazwaKartyPLC = tablicaJson[i].PLCNR;
                    }
                }
            }
            require(['diagnostykaBloki/wyswietlBlok'], function (wyswietlBlok) {
                wyswietlBlok.inicjacja(nazwyKartPLC, pasujaceObiekty);

                varGlobal.doWyslania.diagnostykaBloku.wWartosc = 500;
                varGlobal.doWyslania.diagnostykaBloku.sID = pasujaceObiekty[0].IDBLK;

                clearInterval(intervalId);
                intervalId = setInterval(function () {
                    //console.log(varGlobal.doWyslania.diagnostykaBloku);
                    json.wyslij(varGlobal.doWyslania.diagnostykaBloku);
                }, 1000);

                //json.wyslij(varGlobal.doWyslania.diagnostykaBloku);
                console.log(varGlobal.doWyslania.diagnostykaBloku);

                nazwyKartPLC = [];
                pasujaceObiekty = [];
                $(idDialog).children().removeClass("kopex-selected");
            });
        },


        otworz = function () {
            var ul,
                fragMenu = document.createDocumentFragment(),
                i,
                button,
                div;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: $(document).height() / 2,
                    width: '55%',
                    title: $(idButtonPowrot).text()
                });

                for (i = 0; i < nazwyBlokow.length; i += 1) {
                    button = document.createElement('button');
                    $(button)
                        .text(nazwyBlokow[i])
                        .addClass('przyciskMenuDiagnostBlokow')
                        .css({
                            'width': '75%',
                            'font-weight': 'normal'
                        })
                        .attr('id', nazwyBlokow[i]);
                    $(fragMenu).append(button); // Zwiekszenie wydajnosci - chcemy jak najmniej operacji na DOM (append na zewnatrz petli for)
                }
                $(idDialog).append(fragMenu);
                $("button").button(); // Nadanie stylu jquery
                $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state); // Skierowanie nawigacji z klawiatury na nowo stworzone elementy submenu
                dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y
            } else { // dialog już otwarty -> czyli nastąpił powrót z okienka z sygnałami PLC
                clearInterval(intervalId);
                $(idDialog).find("." + varGlobal.ui_state).addClass("kopex-selected");
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                //clearInterval(intervalId);
                $(idDialog).remove();
                $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button wywołujący
            });
        },


        pobierzJson = function () { // pierwsze pobranie pliku i otworzenie menu
            var i,
                length,
                poprzedniaNazwaBloku;

            //            if (varGlobal.czyUstawieniaDomyslne) {
            //                strukturaJsonPelna = json.pobierz('jsonDefault/diagnostykaBlokow.json');
            //            } else {
            //                strukturaJsonPelna = json.pobierz('json/diagnostykaBlokow.json');
            //            }



            length = varGlobal.diagnostykaBlokow.DANE.length;
            for (i = 0; i < length; i += 1) {
                // sprawdzenie czy pasuje wersja wyposażenia
                if (parseInt(varGlobal.diagnostykaBlokow.DANE[i].WER, 10) === varGlobal.wersjaWyposazenia) {
                    tablicaJson.push(varGlobal.diagnostykaBlokow.DANE[i]);
                }
                // tablica z nazwami do stworzenia listy buttonów menu
                if ((varGlobal.diagnostykaBlokow.DANE[i].NBLK !== poprzedniaNazwaBloku) && (parseInt(varGlobal.diagnostykaBlokow.DANE[i].WER, 10) === varGlobal.wersjaWyposazenia)) {
                    nazwyBlokow.push(varGlobal.diagnostykaBlokow.DANE[i].NBLK);
                    poprzedniaNazwaBloku = varGlobal.diagnostykaBlokow.DANE[i].NBLK;
                }
            }
            otworz();
            //strukturaJsonPelna = []; // po selekcji sygnałów ta struktura już nie będzie używana, kasowanie ze względu na oszczędność RAMu
        },


        inicjacja = function (_idButtona) {
            idButtonPowrot = '#' + _idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                if (init) {
                    otworz(); // otwarcie okienka dialog
                } else {
                    pobierzJson();
                    init = true;
                }
            });
        };


    return {
        inicjacja: inicjacja,
        otworzDiagnostykeBloku: otworzDiagnostykeBloku,
        otworz: otworz
    };


});