/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */

define(['jquery',
        'obslugaJSON',
        'zmienneGlobalne',
        'kommTCP',
        'wspolne/odswiezajObiekt',
        'komunikaty/uaktualnijStatus'
       ], function (
    $,
    json,
    varGlobal,
    dane,
    odswiezajObiekt,
    uaktualnijStatus
) {
    "use strict";

    var daneDoOdswiezania = [],
        czyAlarm = false,
        czyOstrzezenie = false,


        dodajDaneDoOdswiezania = function (paczkaDanych) { // podczas ładowania poszczególnych tabów będą dodawane nowe zmienne do odświeżania -> ta funkcja jest wywolywana ze skryptu 'main'
            daneDoOdswiezania = daneDoOdswiezania.concat(paczkaDanych);
        },


        odswiezajZegar = function () {
            var dataMin = new Date(),
                tekstDaty,
                zeroWiodace = function (i) {
                    return (i < 10) ? '0' + i : i;
                };

            tekstDaty = dataMin.getUTCFullYear() + '/' + zeroWiodace(dataMin.getUTCMonth() + 1) + '/' + zeroWiodace(dataMin.getUTCDate()) + ' ' +
                zeroWiodace(dataMin.getUTCHours()) + ":" + zeroWiodace(dataMin.getUTCMinutes()) + ":" + zeroWiodace(dataMin.getUTCSeconds());
            //            tekstDaty = dataMin.getFullYear() + '/' + zeroWiodace(dataMin.getMonth() + 1) + '/' + zeroWiodace(dataMin.getDate()) + ' ' +
            //                zeroWiodace(dataMin.getHours()) + ":" + zeroWiodace(dataMin.getMinutes()) + ":" + zeroWiodace(dataMin.getSeconds());

            $('#idZegarMin').text(tekstDaty);
        },


        odswiezajDane = function () {
            var i,
                length;

            //console.log('odswiezaj');

            length = daneDoOdswiezania.length;
            for (i = 0; i < length; i += 1) {

                // ------------------------------
                // dane typu analog
                // ------------------------------
                if (daneDoOdswiezania[i].typ_danych === "Analog") {
                    odswiezajObiekt.typAnalog(daneDoOdswiezania[i]);
                }

                // ------------------------------
                // dane typu lista
                // ------------------------------
                if (daneDoOdswiezania[i].typ_danych === "Lista") {
                    odswiezajObiekt.typLista(daneDoOdswiezania[i]);
                }

                // ------------------------------
                // dane typu bit
                // ------------------------------
                if (daneDoOdswiezania[i].typ_danych === "Bit") {

                    switch (daneDoOdswiezania[i].id) {
                    case 'sprawnoscAntykolizji': // uszkodzenie antykolizji
                        varGlobal.uszkodzenieAntykolizji = odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'zadzialanieAntykolizji':
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'trwaPlukanieFiltra':
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'diagnostykaBlokad': // tymczasowe, brak obsługi tych bitów w status wordzie w plc na kwk borynia !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                        //odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'statusKombajnu':
                        czyAlarm = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                        break;

                    case 'statusOstrzezenie': // status ostrzeżenie
                        czyOstrzezenie = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                        uaktualnijStatus.zmienStatusAlarm(czyAlarm, czyOstrzezenie);
                        break;

                    default:
                        //odswiezajObiekt.typBit(daneDoOdswiezania[i], 'transparent', 'green');
                        if (daneDoOdswiezania[i].jednostka === "DO") {
                            odswiezajObiekt.typBit(daneDoOdswiezania[i], 'transparent', 'darkOrange');
                        } else if (daneDoOdswiezania[i].jednostka === "error") {
                            odswiezajObiekt.typBit(daneDoOdswiezania[i], 'transparent', 'darkred');
                        } else {
                            odswiezajObiekt.typBit(daneDoOdswiezania[i], 'transparent', 'green');
                        }
                    }

                }
            }
        },


        inicjacja = function () { // wywołanie z tab1/main.dodajStatusy()

            // extra sygnał do zmiany statusu kombajnu: ok/ostrzeżenie/alarm
            daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("statusOstrzezenie", varGlobal.sygnaly));
            setInterval(function () {
                uaktualnijStatus.zmienStatus_Alarmy_OLD();
                uaktualnijStatus.zmienStatus_Blokady_OLD(); // do wywalenia jak Robert doda obsługę statusów w status Wordzie !!!!!!!!!!!!!!!!!!!!!!!!!!!!!1

                odswiezajZegar();
                odswiezajDane();
            }, varGlobal.czasOdswiezania);
        };

    return {
        inicjacja: inicjacja,
        dodajDaneDoOdswiezania: dodajDaneDoOdswiezania
    };
});