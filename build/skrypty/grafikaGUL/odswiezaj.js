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
        'grafikaGUL/main',
        'paper'
       ], function (
    $,
    json,
    varGlobal,
    dane,
    odswiezajObiekt,
    grafikaGULmain,
    paper
) {
    "use strict";

    var init = false,
        daneDoOdswiezania = [],


        dodajDaneDoOdswiezania = function () {
            if (init === false) {
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("grafikaTab1Analog", varGlobal.sygnaly));
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("grafikaTab1Krancowki", varGlobal.sygnaly));
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("grafikaTab1Jazda", varGlobal.sygnaly));
                init = true;
                //console.log(daneDoOdswiezania);
            }
        },


        odswiezaj = function () {
            var i,
                stanKrancowki,
                stanJazda,
                length;
            

            paper.view.onFrame = function (event) { //  it is called up to 60 times a second
                if ($('#tabs').tabs("option", "active") !== 0) { // animacje tylko na tab 1
                    return;
                }
                if (event.count % 12 === 0) { // zmniejszenie ilosci klatek
                    //console.log('odswiezanie grafiki');
                    length = daneDoOdswiezania.length;
                    for (i = 0; i < length; i += 1) {
                        if (daneDoOdswiezania[i].typ_danych === "Bit") {
                            if ((daneDoOdswiezania[i].grupa === "grafikaTab1Krancowki") || (daneDoOdswiezania[i].grupa_2 === "grafikaTab1Krancowki")) {
                                stanKrancowki = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                                grafikaGULmain.odswiezKrancowke(daneDoOdswiezania[i], stanKrancowki);
                            }
//                            if (daneDoOdswiezania[i].grupa === "grafikaTab1Jazda") {
//                                stanJazda = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
//                                grafikaGULmain.odswiezJazde(daneDoOdswiezania[i], stanJazda);
//                            }
                        }

                        if (daneDoOdswiezania[i].typ_danych === "Lista") {
                            if (daneDoOdswiezania[i].id === "idKierunekJazdy") {
                                //stanJazda = odswiezajObiekt.typBitStan(daneDoOdswiezania[i]);
                                grafikaGULmain.odswiezJazde(odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));

                            }
                        }

                        if ((daneDoOdswiezania[i].typ_danych === "Analog") && dane.daneTCP.analog[daneDoOdswiezania[i].poz_ramka] !== undefined) {
                            if ((daneDoOdswiezania[i].grupa === "grafikaTab1Analog") || (daneDoOdswiezania[i].grupa_2 === "grafikaTab1Analog")) {
                                grafikaGULmain.odswiezAnalog(daneDoOdswiezania[i], odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                            }

                        }
                    }
                }
            };
        },


        inicjacja = function () {
            dodajDaneDoOdswiezania();
            odswiezaj();
        };


    return {
        inicjacja: inicjacja
    };
});
