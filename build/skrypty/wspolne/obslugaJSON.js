/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var danePlikuKonfiguracyjnego,
        init = false,
        czyBladPobraniaPliku = false,
        czyUstawieniaDomyslne = false,


        bladPobraniaPliku = function (zwroconyBlad) {
            var tekstBledu,
                czasDoOdswiezenia = 10000;

            tekstBledu = zwroconyBlad;
            require(['wspolne/brakPolTCP'], function (brakPolTCP) {
                brakPolTCP.inicjacja('Błąd pobrania pliku json', tekstBledu, true);
                $("#DialogBrakKomunikacjiTCP").addClass('bladFtp'); // dodanie klasy zeby przypadkiem skrypt mowiacy o polaczeniu tcp nie wygasil okienka
            });

            setTimeout(function () {
                require(['alert'], function (alert) {
                    alert.inicjacja({
                        texts: [
                            'Restart...'
                        ],
                        timer: 5000,
                        restart: true,
                        position: 'bottom'
                    });
                });
            }, 5000);


            //            setTimeout(function () { // po zwloce czasowej odswiezenie calej strony
            //                location.reload();
            //            }, czasDoOdswiezenia);


            //            if (!czyUstawieniaDomyslne) {
            //                czyUstawieniaDomyslne = true;
            //                setTimeout(function () {
            //                    //location.reload();
            //                    if ($("#DialogBrakKomunikacjiTCP").length > 0) { // zamkniecie  okienka o braku komunikajci - tez z mala zwloka czasowa
            //                        $("#DialogBrakKomunikacjiTCP").dialog("close");
            //                    }
            //                    require(['alert'], function (alert) {
            //                        alert.inicjacja({
            //                            texts: [
            //                                'Przyjmuję ustawienia domyslne'
            //                            ],
            //                            timer: czasDoOdswiezenia - 1000
            //                        });
            //                        setTimeout(function () {
            //                            require(['app'], function (app) { // wywołanie pobrania plików domyslnych jsona
            //                                app.domyslne();
            //                            });
            //                        }, czasDoOdswiezenia);
            //                    });
            //                }, czasDoOdswiezenia);
            //            }
        },


        pobierz = function (_nazwaPliku) {
            var pobraneDane;

            $.ajax({
                dataType: "json",
                async: false,
                url: _nazwaPliku,
                error: function (xhr, status) {
                    czyBladPobraniaPliku = true;
                    bladPobraniaPliku(xhr.responseText);
                    console.log("Blad pobrania danych z pliku JSON, xhr:" + xhr.responseText);
                },
                success: function (json) {
                    if ((typeof json) === "string") { // nie przyszla struktura jsona -> blad pobrania pliku po ftp ze sterownika przez serwer www
                        czyBladPobraniaPliku = true;
                        bladPobraniaPliku(json);
                    } else { // plik ze zterownika ok
                        pobraneDane = json;
                    }
                }
            });
            return pobraneDane;
        },


        wyslij = function (dane) {
            var nowyParametr,
                czyBladWyslaniaJSON = false,
                tekst;

            $.ajax({
                dataType: "jsonp",
                timeout: 15000, // informacja od Tomka Gorskiego ze ma byc taki dlugi timeout
                data: dane,
                url: varGlobal.adresSerweraRozkazy,
                error: function (xhr, status) {
                    require(['progresBar'], function (progresBar) {
                        progresBar.inicjacja({
                            status: 'OK',
                            error: "xhr_status:" + xhr.status + ", status:" + status
                        });
                    });
                },
                complete: function (xhr, status) {
                    //console.log('status: ' + status);
                    if ((status !== 'success') && (status !== 'error')) {
                        require(['progresBar'], function (progresBar) {
                            progresBar.inicjacja({
                                status: 'error',
                                error: "status:" + status
                            });
                        });
                    }
                },
                success: function (odpowiedz) {
                    //console.log(odpowiedz);
                    if (odpowiedz === 'OK') { // przyszla poprawna odpowiedz dla wiekszosci rozkazow
                        console.log(odpowiedz);
                    } else if (Object.prototype.toString.call(odpowiedz) === "[object Array]") { // przyszla tablica z historia
                        require(['komunikaty/historia'], function (historia) {
                            historia.inicjacja(odpowiedz); // przekaz pobrane dane historii do wyswietlenia
                        });
                    } else if (odpowiedz === 'PAR_OK') { // parametry zostaly zaktualizowane -> mozna przeladowac pliki
                        console.log('PAR_OK');
                        //                        if (!init) {
                        //                            init = true;
                        //                            require(['parametry/odswiez'], function (odswiez) {
                        //                                odswiez.przeladuj(); // odświeżenie listy parametrów
                        //                            });
                        //                        }
                    } else if (odpowiedz === 'BLOK_OK') { // blokada zalozona
                        setTimeout(function () {
                            if ($("#PelnaListaKomm").length > 0) { // w przypadku operacji na pełnej liście komunikatów -> odświeżenie aktualnie wyświetlanego widoku
                                require(['komunikatyPelnaLista/main'], function (pelnaLista) {
                                    pelnaLista.odswiez();
                                });
                            }
                        }, 2000);
                    } else if (odpowiedz === 'EKS_OK') { // blokada zalozona
                        require(['ksiazkaSerwisowa/potwierdzenie'], function (potwierdzenieEKS) {
                            potwierdzenieEKS.odswiezWygladButtona(); // przekaz pobrane dane historii do wyswietlenia
                        });
                    } else { // blad
                        console.log('odpowiedz - blad: ' + odpowiedz);
                        czyBladWyslaniaJSON = true;
                    }

                    // zamknięcie okienek progress bar z informacją o sukcesie lub błędzie
                    require(['progresBar'], function (progresBar) {
                        if (czyBladWyslaniaJSON) {
                            progresBar.inicjacja({
                                //show: true,
                                status: 'error',
                                error: odpowiedz
                            });
                        } else {
                            progresBar.inicjacja({
                                status: 'OK'
                            });
                        }
                    });

                }
            });
        },


        szukajWartosci = function (_wartoscSzukana, _dane) { //struktura pliku JSON to nazwa:wartosc
            var pasujace = [],
                tempDane = [];

            if (_dane === undefined) {
                tempDane = JSON.parse(JSON.stringify(varGlobal.sygnaly));
            } else {
                tempDane = _dane;
            }

            $.each(tempDane, function (key, val) {
                var aktualnyObiekt = this;
                $.each(aktualnyObiekt, function (k, v) {
                    if ((k === 'grupa') || (k === 'grupa_2') || (k === 'plc_nr') || (k === 'id')) {
                        if (v === _wartoscSzukana) {
                            pasujace.push(aktualnyObiekt);
                        }
                    }
                });
            });
            return pasujace;
        },


        szukajWykresow = function (wartoscSzukana, dane) { //struktura pliku JSON to nazwa:wartosc
            var pasujace = []; // Tymczasowa tabela pasujacych obiektow

            $.each(dane, function (key, val) {
                var aktualnyObiekt = this;
                $.each(aktualnyObiekt, function (k, v) {
                    if (k === 'wykresy') {
                        if (v === wartoscSzukana) {
                            if (aktualnyObiekt.id !== undefined) { // W oknie danych diagnostycznych nie chcemy pustych danych    if (aktualnyObiekt.id !== "") {
                                pasujace.push(aktualnyObiekt);
                            }
                        }
                    }
                });
            });
            return pasujace;
        },


        pobierzAsynchronicznie = function (_nazwaPliku) {
            var defer = new $.Deferred();

            switch (_nazwaPliku) {
            case "parametry.json":
                varGlobal.parametry = pobierz('json/' + _nazwaPliku);
                break;
            case 'sygnaly.json':
                varGlobal.sygnaly = pobierz('json/' + _nazwaPliku);
                break;
            case 'konfiguracja.json':
                varGlobal.danePlikuKonfiguracyjnego = pobierz('json/' + _nazwaPliku);
                break;
            case 'konfiguracjaMinViz.json':
                varGlobal.danePlikuKonfiguracyjnego = pobierz('json/' + 'ktw/' + _nazwaPliku);
                break;
            case 'hardware.json':
                varGlobal.hardware = pobierz('json/' + _nazwaPliku);
                break;
            case 'komunikaty.json':
                varGlobal.tekstyKomunikatow = pobierz('json/' + _nazwaPliku);
                break;
            case 'diagnostykaBlokow.json':
                varGlobal.diagnostykaBlokow = pobierz('json/' + _nazwaPliku);
                break;
            default:
            }

            if (!czyBladPobraniaPliku) {
                defer.resolve(true);
            } else {
                defer.resolve(false);
            }
            return defer;
        };


    return {
        pobierz: pobierz,
        wyslij: wyslij,
        szukajWartosci: szukajWartosci,
        szukajWykresow: szukajWykresow,
        pobierzAsynchronicznie: pobierzAsynchronicznie
    };

});








//        szukajWartosciWerWypos = function (wartoscSzukana) { // opcja wyszukiwania z uwzglednieniem wersji wyposazenia maszyny (rozne konfiguracje wysp wago itp)
//            var i,
//                j,
//                wersjaSplit = [],
//                plc_nrSplit = [],
//                length,
//                tymczasDane = [],
//                pasujaceObiekty = []; // Tymczasowa tabela pasujacych obiektow
//
//            tymczasDane = JSON.parse(JSON.stringify(varGlobal.sygnaly)); //Easiest way to deep clone Array or Object
//            length = tymczasDane.length;
//
//            for (i = 0; i < length; i += 1) {
//                if (tymczasDane[i].wersja !== undefined) {
//                    wersjaSplit = [];
//                    plc_nrSplit = [];
//                    //console.log(tymczasDane[i].id);
//                    wersjaSplit = tymczasDane[i].wersja.split("__"); // moze byc kilka wersji wyposazenia dla jednego sygnalu np "0__1"
//                    plc_nrSplit = tymczasDane[i].plc_nr.split("__"); // jeden
//                    for (j = 0; j < wersjaSplit.length; j += 1) {
//                        //if (varGlobal.wersjaWyposazenia === parseInt(wersjaSplit[j], 10)) { // konwersja na int (generowane struktury z excela moga miec liczbe jako wartosc tekstowa)
//                        if ((varGlobal.wersjaWyposazenia === parseInt(wersjaSplit[j], 10) && (varGlobal.wersjaWyposazenia))) {
//                            if (plc_nrSplit[j] === wartoscSzukana) { // sprawdzenie czy dany obiekt ma posiadana wartosc numeru PLC w danej wersji wyposazenia
//                                tymczasDane[i].plc_nr = plc_nrSplit[j]; // zamiana pola plc_nr z wersji pierwotnej "PLCS3__PLCS4" na docelowa wg wersji wyposazenia, np "PLCS4" - potrzebne prz pozniejszej obrobce w dodawaniu elementow do tabel
//                                pasujaceObiekty.push(tymczasDane[i]);
//                            }
//                        }
//                    }
//                } else { // przypadek gdy nie chcemy brać pod uwagę wersji wyposażenia
//                    if (tymczasDane[i].plc_nr === wartoscSzukana) { // sprawdzenie czy dany obiekt ma posiadana wartosc numeru PLC w danej wersji wyposazenia
//                        pasujaceObiekty.push(tymczasDane[i]);
//                    }
//                }
//            }
//            plc_nrSplit = null; // czyszczenie pamięci
//            wersjaSplit = null;
//            tymczasDane = null;
//            return pasujaceObiekty;
//        },