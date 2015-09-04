/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

// test zabezpieczen na duzym wyswietlaczu 10"
define(['jquery',
        'zmienneGlobalne',
        'obslugaJSON',
        'wspolne/odswiezajObiekt',
        'dodajPojedynczaTabele',
        'testZabezpieczen/testNowy'
       ], function (
    $,
    varGlobal,
    json,
    odswiezajObiekt,
    dodajPojedynczaTabele,
    testNowy
) {
    "use strict";


    var init = false,
        obiektTrwaTestZabezpieczen,
        idDialog = "#dialogTestZabezpieczen", // tak będzie nazwane okienko popup
        daneDoWyswietlenia = [],
        daneStatusowe = [],
        daneWyjatki = [],
        pelneDaneTestuZabezpieczen = [],
        //fragmentHtml = document.createDocumentFragment(),


        otworzDialog = function (_tytul) {
            var div,
                top,
                iloscButtonow,
                wysokoscButtona,
                tymczasTablicaDanych = [],
                szer;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                if (varGlobal.hardware.czyMinimumViz) { // wielkość ramki w zależności od typu wyświetlacza
                    szer = '90%';
                } else {
                    szer = '60%';
                }

                $(idDialog).dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: false,
                    height: 'auto',
                    width: szer,
                    title: _tytul,
                    show: {
                        delay: 200,
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    hide: {
                        delay: 200,
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    close: function () {
                        $(this).parent().promise().done(function () {
                            $(idDialog).remove();
                            testNowy.koniec(); // wyczyszczenie pamięci w procedurze testu
                        });
                    }
                });

                dodajPojedynczaTabele.dodaj({
                    objects: daneDoWyswietlenia,
                    id: idDialog,
                    cssDescription: 'tdOpis',
                    cssValue: 'tdWartosc'
                });

                $(idDialog).dialog("open");

                testNowy.inicjacja({
                    statusData: daneStatusowe,
                    displayData: daneDoWyswietlenia,
                    exceptions: daneWyjatki
                });

            }
        },


        inicjacja = function () {
            var czyWyswietlicTest,
                danaDoOdswiezania;

            pelneDaneTestuZabezpieczen = json.szukajWartosci('testZabezpieczen', varGlobal.sygnaly); // pobranie pełnej paczki danych potrzebnych do testu
            daneDoWyswietlenia = json.szukajWartosci('zabezpieczenie', pelneDaneTestuZabezpieczen); // sygnały, które mają być wyświetlane
            daneStatusowe = json.szukajWartosci('zabezpieczenieStatus', pelneDaneTestuZabezpieczen); // sygnały, które mają dane statusowe
            daneWyjatki = json.szukajWartosci('zabezpieczenieWylacz', pelneDaneTestuZabezpieczen); // sygnały, które mają nie być uwzględniane w odświeżaniu
            obiektTrwaTestZabezpieczen = json.szukajWartosci('trwaTestZabezpieczen', pelneDaneTestuZabezpieczen); //zmienna informujaca o rozpoczeciu i zakonczeniu testu 

            // jeśli nie znaleziono obiektu odpowiadającego za start testu -> wyjście z procedury (np. w WOW nie ma testu)
            if (obiektTrwaTestZabezpieczen[0] === undefined) {
                return;
            }

            pelneDaneTestuZabezpieczen = [];
            setInterval(function () {
                czyWyswietlicTest = odswiezajObiekt.typBitStan(obiektTrwaTestZabezpieczen[0]);
                if (czyWyswietlicTest) { // rozpoczecie testu zabezpieczen
                    otworzDialog(obiektTrwaTestZabezpieczen[0].opis_pelny);
                } else { // koniec testu zabezpieczen
                    if ($(idDialog).length !== 0) { // przyszło polecenie z PLC zakończenia testu - zamknij okienko
                        $(idDialog).dialog("close");
                    }
                }
            }, varGlobal.czasOdswiezania);
        };


    return {
        inicjacja: inicjacja
    };

});