/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


// wersja minimum - na male wyswietlacze. Bedzie wyswietlana tylko tabelka z najwazniejszymi danymi, przewijanie tylko lewo/prawo
define(['jquery', 'zmienneGlobalne', 'dodajPojedynczaTabele', 'obslugaJSON', 'ustawKolejnosc'], function ($, varGlobal, dodajPojedynczaTabele, json, ustawKolejnosc) {
    "use strict";

    var init = false,

        inicjacja = function (_nrTab, _ZAWARTOSC) {
            var i,
                komorkaZegar = {
                    id: 'idZegarMin',
                    opis_pelny: 'Data i czas UTC',
                    jednostka: '_czas'
                },
                //szukanyZnacznik,
                //rozbiteID = [],
                daneDoOdswiezania = [],
                pasujaceObiektyNaTab = [],
                fragmentHtml = document.createDocumentFragment();

            if (!init) { // dodanie wyświetlania czasu na tab1 (pierwsze przejście przez procedurę)
                init = true;
                pasujaceObiektyNaTab.push(komorkaZegar);
            }

//            rozbiteID = varGlobal.danePlikuKonfiguracyjnego.MENU_TAB[_nrTab].zawartosc.split('_');
//            for (i = 0; i < rozbiteID.length; i += 1) {
//                szukanyZnacznik = rozbiteID[i];
//                pasujaceObiektyNaTab = pasujaceObiektyNaTab.concat(json.szukajWartosci(szukanyZnacznik, varGlobal.sygnaly)); // to do wyrysowania odpowiedniej paczki na odpowiedni tab
//                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci(szukanyZnacznik, varGlobal.sygnaly)); // to do odswiezania calej paczki
//            }

            
            
            pasujaceObiektyNaTab = pasujaceObiektyNaTab.concat(json.szukajWartosci(_ZAWARTOSC, varGlobal.sygnaly)); // to do wyrysowania odpowiedniej paczki na odpowiedni tab
            daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci(_ZAWARTOSC, varGlobal.sygnaly)); // to do odswiezania calej paczki            
            
            for (i = 0; i < pasujaceObiektyNaTab.length; i += 1) {
                pasujaceObiektyNaTab[i].plc_id = ''; // pozbycie się pól "plc_id"
                pasujaceObiektyNaTab[i].kolejnosc = undefined; // wyczyszczenie pol "kolejnosc", będą zastąpione wartościami z "kolejnosc_malyMonitor"

                if (pasujaceObiektyNaTab[i].kolejnosc_malyMonitor !== undefined) {
                    pasujaceObiektyNaTab[i].kolejnosc = pasujaceObiektyNaTab[i].kolejnosc_malyMonitor;
                }
            }

            pasujaceObiektyNaTab = ustawKolejnosc.inicjacja({
                inputData: pasujaceObiektyNaTab,
                sortData: true
            });

            dodajPojedynczaTabele.dodaj({
                objects: pasujaceObiektyNaTab,
                id: "#tab" + (_nrTab + 1)
            });

            pasujaceObiektyNaTab = [];

            $("#tabs").tabs("option", "disabled", [5]);
            require(['minimumViz/odswiezaj'], function (odswiezaj) { // dodanie do odświeżania paczki zmiennych odpowiedzialnych za dany tab
                odswiezaj.dodajDaneDoOdswiezania(daneDoOdswiezania);
            });
        };

    return {
        inicjacja: inicjacja
    };
});