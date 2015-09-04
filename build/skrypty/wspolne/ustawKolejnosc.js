/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define */

// Zadania funkcji:
// ustawia kolejność elementów w tablicu względem pola "kolejnosc" w pliku sygnaly.json
// sprawdza poprawnosc danych (brak pustych indexow)
// pozbywa się czujników, które w pliku sygnaly.json w polu "czyAktywny" wartosc 0
define(['jquery', 'zmienneGlobalne', 'scrollTo'], function ($, varGlobal, scroll) {
    'use strict';

    var ccc,


        inicjacja = function (_config) {
            var i,
                pokazRaport = false,
                filtrujTablice = false,
                raportZdublowaneIndeksy = 'RAPORT - zdublowane indeksy: ',
                raportBrakKolejknosci = 'RAPORT - brak pola .kolejnosc: ',
                raportWersjaWyposazenia = 'RAPORT - zla wersja wyposażenia: ',
                raportCzyAktywny = 'RAPORT - czujnik nie aktywny: ',
                daneWersjaWyposazeniaOK = [],
                daneWejKolejne = [];

            // Konfiguracja wstępna
            this.config = {
                inputData: _config.inputData,
                sortData: _config.sortData || false // czy posortować dane
            };
            
            //console.log(this.config.inputData);

            // Ustawienie kolejności zgodnie z polami json "kolejnosc"
            if (this.config.sortData) {
                for (i = 0; i < this.config.inputData.length; i += 1) { // istnieją pola z kolejnością -> stworzenie nowej tablicy odpowiednio posegregowanej
                    if (this.config.inputData[i].kolejnosc !== undefined) {
                        // sprawdzenie, czy nie powtarzają się indeksy ustawione w polu .kolejnosc
                        if (daneWejKolejne[this.config.inputData[i].kolejnosc] === undefined) {
                            daneWejKolejne[this.config.inputData[i].kolejnosc] = this.config.inputData[i];
                        } else {
                            raportZdublowaneIndeksy += this.config.inputData[i].id + ', ';
                            daneWejKolejne[i + 100] = this.config.inputData[i];

                        }
                        //daneWejKolejne[this.config.inputData[i].kolejnosc] = this.config.inputData[i];
                    } else { // jesli dane nie maja numeracji
                        daneWejKolejne[i + 100] = this.config.inputData[i];
                        raportBrakKolejknosci += this.config.inputData[i].id + ', ';
                    }
                }
            } else {
                raportBrakKolejknosci += 'Wyłączone sortowanie';
                raportZdublowaneIndeksy += 'Wyłączone sortowanie';
                daneWejKolejne = _config.inputData;
            }
            
            

            // Sprawdzenie poprawności tablicy (czy nie brakuje niektórych indeksów - zdarza się czasami pominąć w pliku excela)
            for (i = 0; i < daneWejKolejne.length; i += 1) { // stworzenie nowej tablicy z zadana kolejnoscią
                if (daneWejKolejne[i] === undefined) {
                    filtrujTablice = true;
                }
            }
            if (filtrujTablice) { // Wywalenie pustych indeksów
                filtrujTablice = false;
                daneWejKolejne = daneWejKolejne.filter(function () {
                    return true;
                });
            }
            
            //console.log(daneWejKolejne);

            // sprawdzenie sygnałów pod kątem parametru wersji wyposażenia -> pole sygnaly.json .wersja
            for (i = 0; i < daneWejKolejne.length; i += 1) {
                if (daneWejKolejne[i].wersja !== undefined) {
                    if (varGlobal.wersjaWyposazenia === parseFloat(daneWejKolejne[i].wersja)) {
                        daneWersjaWyposazeniaOK.push(daneWejKolejne[i]);
                    } else {
                        raportWersjaWyposazenia += daneWejKolejne[i].id + ', ';
                    }
                } else { // wersja wyposażenia nie jest podana -> dane będą wyświetlane dla każdego przypadku
                    daneWersjaWyposazeniaOK.push(daneWejKolejne[i]);
                }
            }

            //wyrzucenie zmiennych, które nie mają być wyświetlane (ustawiane parametrem w pliku sygnaly.json - pole "czyAktywny")
            for (i = 0; i < daneWersjaWyposazeniaOK.length; i += 1) {
                if (daneWersjaWyposazeniaOK[i].czyAktywny !== undefined) {
                    if (parseFloat(daneWersjaWyposazeniaOK[i].czyAktywny) === 0) {
                        raportCzyAktywny += daneWersjaWyposazeniaOK[i].id + ', ';
                        delete daneWersjaWyposazeniaOK[i];
                        filtrujTablice = true;
                    }
                }
            }
            if (filtrujTablice) { // Wywalenie pustych indeksów
                daneWersjaWyposazeniaOK = daneWersjaWyposazeniaOK.filter(function () {
                    return true;
                });
            }

            // koncowy raport po sortowaniu
            if (pokazRaport) {
                console.log(raportZdublowaneIndeksy);
                console.log(raportBrakKolejknosci);
                console.log(raportWersjaWyposazenia);
                console.log(raportCzyAktywny);
            }

            // czyszczenie pamięci
            raportZdublowaneIndeksy = '';
            raportBrakKolejknosci = '';
            raportWersjaWyposazenia = '';
            raportCzyAktywny = '';
            daneWejKolejne = undefined;

            return daneWersjaWyposazeniaOK;
        };


    return {
        inicjacja: inicjacja
    };

});