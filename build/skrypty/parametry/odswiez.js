/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'obslugaJSON', 'zmienneGlobalne'], function ($, json, varGlobal) {
    "use strict";

    var obudowaLP_old,
        kierunekrolki_old,
        init = false,


        sprawdzTypObudowyLP = function () { // (nowyPoziom) przeładowanie odbywa się na wykrycie zdarzenia 'beforeActivate' w wspolne/lontrolkiUI -> tylko gdy tab1 jest aktywny, inaczej jest bug w raphaelu i wszystko źle się skaluje
            var przeladujGrafikeTab1 = false,
                tekst,
                nowaObudowa;

            nowaObudowa = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfObudowaTyp.WART;
            if (nowaObudowa !== obudowaLP_old) {
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.typObudowyLP[nowaObudowa];
                $("#typObudowyLP").text(tekst);
                obudowaLP_old = nowaObudowa;
                if (document.getElementById("grafika") !== null) {
                    require(['grafikaKTW/main'], function (grafika) { // Rysowanie grafiki na tab1
                        grafika.inicjacja(tekst, 'ktw150typ1'); // typ obudowy LP oraz organu
                    });
                }
            }
        },


        sprawdzKierunekRolki = function () { // (nowyPoziom) przeładowanie odbywa się na wykrycie zdarzenia 'beforeActivate' w wspolne/lontrolkiUI -> tylko gdy tab1 jest aktywny, inaczej jest bug w raphaelu i wszystko źle się skaluje
            var przeladujGrafikeTab1 = false,
                nowyKierunekRolki;

            nowyKierunekRolki = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfRolkaZabudowanaPoLewej.WART;
            if (nowyKierunekRolki !== kierunekrolki_old) {
                kierunekrolki_old = nowyKierunekRolki;
                if (document.getElementById("grafika") !== null) {
                    require(['grafikaGUL/main'], function (_grafikaGUL) { // Rysowanie grafiki na tab1
                        _grafikaGUL.inicjacja(nowyKierunekRolki); // kierunek rolki 0:prawo, 1:lewo
                    });
                }
            }
        },


        sprawdzWersjeJezykowa = function (_nowyJezyk, _nowyJezykString) {
            if (_nowyJezyk !== varGlobal.wersjaJezykowa) { // jest nowa wersja
                varGlobal.wersjaJezykowa = _nowyJezyk;
                console.log('nowa wersja jezykowa: ' + varGlobal.wersjaJezykowa);
                require(['alert'], function (alert) {
                    alert.inicjacja({
                        texts: [
                            varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zmianaKonfiguracji,
                            ' -- ' + _nowyJezykString + ' -- ',
                            varGlobal.danePlikuKonfiguracyjnego.TEKSTY.restart
                        ],
                        timer: 5000,
                        restart: true
                    });
                });
            }
        },


//        sprawdzWersjeWyposazenia = function (_nowaWersja, _nowaWersjaString) { // _nowaWersja to numer indexu z listy parametrow
//            console.log(varGlobal.wersjaWyposazenia + ' - ' + _nowaWersja);
//            if (_nowaWersja !== varGlobal.wersjaWyposazenia) { // jest nowa wersja
//                varGlobal.wersjaWyposazenia = _nowaWersja;
//                console.log('nowa wersja wyposazenia: ' + varGlobal.wersjaWyposazenia);
//                require(['alert'], function (alert) {
//                    alert.inicjacja({
//                        texts: [
//                            varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zmianaKonfiguracji,
//                            ' -- ' + _nowaWersjaString + ' -- ',
//                            varGlobal.danePlikuKonfiguracyjnego.TEKSTY.restart
//                        ],
//                        timer: 5000,
//                        restart: true
//                    });
//                });
//            }
//        },


        przeladuj = function (_gparObj) { // przeladowanie wywolane ze skryptu wspolne/obslugaJSON.js      nowyPoziom
            var nowyParametr,
                tekst = '';

            setTimeout(function () { // opóźnienie 2 sekundy bo sterownik nie wyrabia się z obsługą stringów i nie podstawia na czas prawidłowych wartości                
                // podmiana nowej wartosci parametru na liscie menu ui
                if (varGlobal.zmienianyParametr.obiekt !== undefined) {
                    nowyParametr = varGlobal.parametry.DANE[varGlobal.zmienianyParametr.grupa][varGlobal.zmienianyParametr.podgrupa][varGlobal.zmienianyParametr.id];
                    if (nowyParametr.TYP === 'pLista') {
                        tekst = nowyParametr.LISTA[nowyParametr.WART]; // wczytanie wartosci z listy
                    } else {
                        tekst = nowyParametr.WART;
                    }

                    $('#menu').find('#' + varGlobal.zmienianyParametr.id)
                        .text(varGlobal.zmienianyParametr.obiekt.ID + ' ' + varGlobal.zmienianyParametr.obiekt.OPIS + ' = ' + tekst);

                    console.log(varGlobal.zmienianyParametr.obiekt.ID + ' ' + varGlobal.zmienianyParametr.obiekt.OPIS + ' = ' + tekst);
                }
                
                varGlobal.wersjaWyposazenia = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaWyposazeniaElektr.WART;
                //sprawdzWersjeJezykowa(_gparObj.rKonfWersjaJezykowa, tekst);
                //sprawdzWersjeWyposazenia(_gparObj.rKonfWersjaWyposazeniaElektr, tekst);

            }, 2000);
        },


        inicjacja = function () {
            varGlobal.wersjaWyposazenia = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaWyposazeniaElektr.WART;
            //sprawdzWersjeWyposazenia(varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaWyposazeniaElektr.WART);
            sprawdzWersjeJezykowa(varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.WART);

            //console.log('inicjacja');
            switch (varGlobal.typKombajnu) {
            case 'KTW':
                sprawdzTypObudowyLP();
                break;
            case 'GUL':
                sprawdzKierunekRolki();
                break;
            default:
            }

        };


    return {
        inicjacja: inicjacja,
        przeladuj: przeladuj,
        sprawdzTypObudowyLP: sprawdzTypObudowyLP, // wykorzystywane przy kazdym wejsciu na tab1 (wspolne/kontrolkiUI.js)
        sprawdzKierunekRolki: sprawdzKierunekRolki // j.w.
    };

});