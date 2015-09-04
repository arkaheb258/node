/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'kommTCP'], function ($, varGlobal, json, dane) {
    'use strict';

    var aktywneKlawiszeOld, // Zapamietany poprzedni stan klawiszy
        aktywneKlawisze,
        odswiezInit = false,
        pasujaceObiekty = [],
        timeoutId,
        init = false,

        klawiszeRamkaPLC = function () { // Przechwycenie zadania sterowania z ramki tcp od sterownika plc
            var i,
                maska = 1,
                length,
                //e = jQuery.Event("keydown"),
                e = jQuery.Event("keyup"),
                tymczasKlawisz,
                wykonajRozkazKlawisza = function (wcisnietyKlawisz) {
                    switch (wcisnietyKlawisz) {
                    case 'LEWO':
                        e.which = varGlobal.kodyKlawiszy.lewo;
                        break;

                    case 'PRAWO':
                        e.which = varGlobal.kodyKlawiszy.prawo;
                        break;

                    case 'GORA':
                        e.which = varGlobal.kodyKlawiszy.gora;
                        break;

                    case 'DOL':
                        e.which = varGlobal.kodyKlawiszy.dol;
                        break;

                    case 'ENTER':
                        e.which = varGlobal.kodyKlawiszy.enter;
                        break;

                    case 'ESCAPE':
                        e.which = varGlobal.kodyKlawiszy.escape;
                        break;

                    default:
                    }
                    // Wyzwolenie zdarzenia wciesniecia klawisza
                    $(document).trigger(e); // To zdarzenie bedzie zlapane w module zdarzenia w funkcji przechwycZdarzenieKlawiatury(
                };

            if (init === false) {
                //console.log('nawigacja z ramki');
                pasujaceObiekty = pasujaceObiekty.concat(json.szukajWartosci("klawiszeLCD", varGlobal.sygnaly));
                init = true;
            }

            aktywneKlawisze = 0;
            length = pasujaceObiekty.length;
            for (i = 0; i < length; i += 1) { // Sprawdzenie ktory klawisz zostal wcisniety
                maska = 1;
                maska = maska << pasujaceObiekty[i].poz_bit; // Ustawienie maski na odpowiedniej pozycji
                if (dane.daneTCP.bit[pasujaceObiekty[i].poz_ramka] & maska) { // Jest jedynka na odpowiedniej pozycji
                    aktywneKlawisze += maska; // Zapamietanie wszystkich jedynek (ktore klawisze zostaly wcisniete)
                    tymczasKlawisz = pasujaceObiekty[i].id.toUpperCase(); // konwersja na duze litery zeby pozbyc sie ewentualnych bledow z json'a
                }
            }

            // Kombinacja klawiszy - odswiezenie okna przegladarki
            if (aktywneKlawisze === 5) { // LEWO + GORA
                if (odswiezInit === false) { // wlaczenie odswiezenia po kilku sekundach (potrzebne po wprowadzeniu sterowania na joystick)
                    odswiezInit = true;
                    setTimeout(function () {
                        if (aktywneKlawisze === 5) { // jesli klawisze sa dalej wcisniete - odswiez
                            if ($('#DialogGULtrybSerwisowy').length === 0) { // GUL - tryb serwisowy
                                location.reload();
                            }
                        }
                        console.log('timer');
                        odswiezInit = false;
                    }, 6000);
                }
            }

            // normalna nawigacja z ramki tcp + szybkie przewijanie
            if (aktywneKlawisze !== aktywneKlawiszeOld) {
                if (aktywneKlawisze !== 0) { // To tylko do najbardziej uperdliwych kontrolek(np selectmeny na planszy z trybem serwisowym dla GULa)
                    varGlobal.typNawigacjiPoEkranach = 1; // 0 - komendy z klawiatury usb,  1 - komendy z ramki tcp
                }
                //console.log('normalna nawigacja ' + aktywneKlawisze);
                aktywneKlawiszeOld = aktywneKlawisze;
                wykonajRozkazKlawisza(tymczasKlawisz);
                clearTimeout(timeoutId);
            } else if ((aktywneKlawisze === aktywneKlawiszeOld) && (aktywneKlawisze !== 0)) { // jest wcisniety dluzej jeden klawisz (nie zero)
                timeoutId = setTimeout(function () { // aktywuj szybkie przewijanie dopiero po dluzszym przytrzymaniu klawisza
                    clearTimeout(timeoutId);
                    if (aktywneKlawisze !== 16) { // szybkie przewijanie na wszystkich klawiszach oprocz enter
                        varGlobal.typNawigacjiPoEkranach = 1; // 0 - komendy z klawiatury usb,  1 - komendy z ramki tcp
                        wykonajRozkazKlawisza(tymczasKlawisz);
                        //console.log('szybkie przewijanie ' + tymczasKlawisz);
                    }
                }, 500);
            } else if ((aktywneKlawisze === aktywneKlawiszeOld) && (aktywneKlawisze !== 0)) { // przychodza zera (brak wysterowanych klawiszy)
                clearTimeout(timeoutId);
            }

        },


        inicjacja = function () {
            // Ustawienie cyklicznego odswiezania stanu klawiszy przychodzacych z ramki
            if (!varGlobal.hardware.czyMinimumViz) { // sterowanie z ramki tylko na dużym wyświetlaczu
                //console.log('nawigacja ramka tcp');
                setInterval(function () {
                    klawiszeRamkaPLC();
                }, varGlobal.czasOdswiezania);
            }
            require(['klawiatura/zdarzenia'], function (zdarzenia) {
                zdarzenia.przechwycZdarzenieKlawiatury();
            });
        };


    return {
        inicjacja: inicjacja
    };
});
