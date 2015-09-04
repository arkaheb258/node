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
        'antykolizja/popUpAntykolizja',
        'komunikaty/uaktualnijStatus',
        'alert'
       ], function (
    $,
    json,
    varGlobal,
    dane,
    odswiezajObiekt,
    popUpAntykolizja,
    uaktualnijStatus,
    alert
) {
    "use strict";


    var daneDoOdswiezania = [],
        czyAlarm = false,
        czyOstrzezenie = false,
        czyBrakPolaczeniaPulpit = false,
        notAusWOW = false,
        init = false,



        dodajDaneDoOdswiezania = function (paczkaDanych) {
            daneDoOdswiezania = daneDoOdswiezania.concat(paczkaDanych);
        },


        odswiezajDane = function () {
            var i,
                length;

            // ten warunek nie może występować gdyż potem jest problem z wyświetlaniem okienek o braku połączenia z pulpitem itp
            //            if ($('#tabs').tabs("option", "active") !== 0) { // odświeżanie tylko na tab 1
            //                return;
            //            }

            //console.log(daneDoOdswiezania);
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
                        if (varGlobal.uszkodzenieAntykolizji) {
                            popUpAntykolizja.inicjacja(); // wyświetlenia okienka pop up, które trzeba zatwierdzić enterem
                        } else {
                            if ($("#DialogPopUpAntykolizja").length > 0) { // zniszczenie okienka popoup jeśli otwarte
                                $("#DialogPopUpAntykolizja").remove();
                            }
                        }
                        break;

                    case 'idBrakPolaczeniaPulpit':
                        czyBrakPolaczeniaPulpit = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                        if (czyBrakPolaczeniaPulpit) {
                            if (!init) {
                                console.log('brak polaczenia z pulpitem');
                                init = true;
                                alert.inicjacja({
                                    texts: [varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolPulpit],
                                    position: 'bottom'
                                });
                            }
                        } else {
                            if (init) {
                                alert.zamknij();
                                init = false;
                            }
                        }
                        break;

                    case 'zadzialanieAntykolizji':
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'trwaPlukanieFiltra':
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'diagnostykaBlokad': // to jest robione po staremu!!!!
                        //odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'statusKombajnu': // status alarm
                        czyAlarm = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                        break;

                    case 'statusOstrzezenie': // status ostrzeżenie
                        czyOstrzezenie = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                        uaktualnijStatus.zmienStatusAlarm(czyAlarm, czyOstrzezenie);
                        break;

                    case 'idPolaczenieKES': // GUL
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'red');
                        break;

                    case 'idWOWPozSmaru': //WOW
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], 'darkred', 'green');
                        break;

                    case 'idNotAus': //WOW
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], 'darkred', 'green');

                        // wyświetlanie okienka pop up z informacją o wciśnietym not ausie    
                        notAusWOW = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]); // 1-OK ; 0-Zadziałany
                        if (!notAusWOW) {
                            if ($("#DialogBrakKomunikacjiTCP").length === 0) { // jeśłi nie ma braku połączenia 
                                alert.inicjacja({
                                    texts: ['Wciśnięto Not-Aus!'],
                                    position: 'bottom',
                                    timer: 5000, // popup widoczny będzie przez 5 sekund
                                    interval: 5 * 60 * 1000 // będzie się wyświetlał cyklicznie co kilka minut
                                });
                            } else {
                                alert.zamknij();
                            }
                        } else {
                            alert.zamknij();
                        }
                        break;

                    default:
                        //console.log(daneDoOdswiezania[i].id);
                        odswiezajObiekt.typBit(daneDoOdswiezania[i], '', 'green');
                        break;

                    }
                }
            }


        },


        inicjacja = function (paczkaDanych) { // wywołanie z tab1/main.dodajStatusy()
            daneDoOdswiezania = daneDoOdswiezania.concat(paczkaDanych);
            setInterval(function () {
                uaktualnijStatus.zmienStatus_Blokady_OLD(); // do wywalenia jak Robert doda obsługę statusów w status Wordzie !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                odswiezajDane();
            }, varGlobal.czasOdswiezania);
        };

    return {
        inicjacja: inicjacja,
        dodajDaneDoOdswiezania: dodajDaneDoOdswiezania
    };
});