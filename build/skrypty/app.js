/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global require, define */

define(['jquery',
        'kommTCP',
        'zmienneGlobalne',
        'obslugaJSON',
        'kontrolkiUI',
        'klawiatura',
        'ladowanieHtml'
       ],
    function (jquery,
        dane,
        varGlobal,
        json,
        jqui,
        klawiatura,
        ladowanieHtml) {
        'use strict';

        var ccc,


            domyslne = function () {
                var minuty = 2;

                console.log('przywracam domyslne');
                varGlobal.parametry = json.pobierz("jsonDefault/parametry.json");
                varGlobal.sygnaly = json.pobierz('jsonDefault/sygnaly.json');
                varGlobal.danePlikuKonfiguracyjnego = json.pobierz('jsonDefault/konfiguracja.json');
                varGlobal.tekstyKomunikatow = json.pobierz("jsonDefault/komunikaty.json");
                varGlobal.diagnostykaBlokow = json.pobierz('jsonDefault/diagnostykaBlokow.json');

                require(['kommTCP'], function (kommTCP) {
                    kommTCP.socket.emit('getDefPar');
                    kommTCP.socket.emit('getDefSyg');
                });

                varGlobal.wersjaWyposazenia = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaWyposazeniaElektr.WART;
                varGlobal.wersjaJezykowa = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.WART;
                varGlobal.typKombajnu = varGlobal.parametry.TYPM;

                jqui.inicjacja(); // Zaladowanie kontrolek jquery ui                                            
                dane.inicjacja(); // Inicjacja komunikacji tcp
                ladowanieHtml.inicjacja(); // Dynamiczne dodawanie elementow html wg pliku jsona 

                require(['alert'], function (alert) {
                    setInterval(function () {
                        alert.inicjacja({
                            texts: [
                                'Uwaga: Ustawienia domyślne - ograniczona funkcjonalność wizualizacji!'
                            ],
                            timer: 5000,
                            position: 'bottom'
                        });
                    }, minuty * 60 * 1000);
                });

            },


            inicjacja = function () {
                // pobieranie asynchroniczne plików jeden po drugim
                json.pobierzAsynchronicznie('hardware.json').done(function (_plikOK) {
                    if (_plikOK) {
                        switch (varGlobal.hardware.ip) {
                        case '192.168.3.31':
                            varGlobal.hardware.czyMinimumViz = false;
                            break;
                        case '192.168.3.51':
                            if (window.screen.width < 500) { // beagle ma rozdzielczość 480x277
                                varGlobal.hardware.czyMinimumViz = true;
                            } else {
                                varGlobal.hardware.czyMinimumViz = false;
                            }
                            break;
                        default:
                            // !!!!!!!!!!!!!!!!! DO TESTÓW NA LAPTOPIE !!!!!!!!!!!!!!!!!!!!!!!!1
                            if (window.screen.width < 500) { // beagle ma rozdzielczość 480x277
                                varGlobal.hardware.czyMinimumViz = true;
                            } else {
                                varGlobal.hardware.czyMinimumViz = false;
                            }
                        }

                        json.pobierzAsynchronicznie('parametry.json').done(function (_plikOK) {
                            if (_plikOK) { // odpowiedź asynchroniczna 
                                json.pobierzAsynchronicznie('sygnaly.json').done(function (_plikOK) {
                                    if (_plikOK) { // odpowiedź asynchroniczna 
                                        json.pobierzAsynchronicznie('komunikaty.json').done(function (_plikOK) {
                                            if (_plikOK) {
                                                json.pobierzAsynchronicznie('konfiguracja.json').done(function (_plikOK) { // pobranie konfiguracja.json
                                                    if (_plikOK) { // odpowiedź asynchroniczna 
                                                        json.pobierzAsynchronicznie('diagnostykaBlokow.json').done(function (_plikOK) {
                                                            if (_plikOK) {
                                                                varGlobal.wersjaWyposazenia = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaWyposazeniaElektr.WART;
                                                                varGlobal.wersjaJezykowa = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.WART;
                                                                varGlobal.typKombajnu = varGlobal.parametry.TYPM;
                                                                
                                                                console.log('Typ:' + varGlobal.typKombajnu + ', Wyposazenie:' + varGlobal.wersjaWyposazenia + ', Jezyk:' + varGlobal.wersjaJezykowa);
                                                                jqui.inicjacja(); // konfiguracja kontrolek jquery ui                                            
                                                                dane.inicjacja(); // inicjacja komunikacji tcp
                                                                ladowanieHtml.inicjacja(); // rozpoczęcie dynamicznego ładowania wizualizacji w zależności od typu kombajnu

                                                                require(['parametry/odswiez'], function (odswiez) {
                                                                    odswiez.inicjacja(); // odświeżenie listy parametrów
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });

                    }
                });



            };

        return {
            inicjacja: inicjacja,
            domyslne: domyslne
        };

    });