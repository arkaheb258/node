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
        'grafikaKTW/rysujZezwolenia',
        'grafikaKTW/rysujOrgan',
        'wspolne/odswiezajObiekt',
        'paper'
       ], function (
    $,
    json,
    varGlobal,
    dane,
    rysujZezwolenia,
    rysujOrgan,
    odswiezajObiekt,
    paper
) {
    "use strict";

    var init = false,
        daneDoOdswiezania = [],


        dodajDaneDoOdswiezania = function () {
            if (init === false) {
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("pozycjaOrgan", varGlobal.sygnaly));
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("pozycjonowanieKomb", varGlobal.sygnaly));
                daneDoOdswiezania = daneDoOdswiezania.concat(json.szukajWartosci("zezwolenia", varGlobal.sygnaly));
                init = true;
            }
        },


        odswiezaj = function () {
            var i,
                maska,
                pozOrganX,
                ccc,
                pozOrganY,
                length;

            paper.view.onFrame = function (event) { //  it is called up to 60 times a second
                if ($('#tabs').tabs("option", "active") !== 0) { // animacje tylko na tab 1
                    return;
                }
                
                if (event.count % 20 === 0) { // zmniejszenie ilosci klatek
                    //console.log('odswiezanie grafiki');

                    rysujZezwolenia.odswiezAntykolizje(varGlobal.uszkodzenieAntykolizji); // wywietlanie na tab1 dodatkowej informacji o uszkodzeniu antykolizji

                    length = daneDoOdswiezania.length;
                    for (i = 0; i < length; i += 1) {
                        if (daneDoOdswiezania[i].typ_danych === "Bit") {
                            if (daneDoOdswiezania[i].grupa === "zezwolenia") {
                                maska = 1;
                                maska = maska << daneDoOdswiezania[i].poz_bit; // Ustawienie maski na odpowiedniej pozycji
                                if (dane.daneTCP.bit[daneDoOdswiezania[i].poz_ramka] & maska) {
                                    rysujZezwolenia.odswiezZezwolenia(daneDoOdswiezania[i], true);
                                } else {
                                    rysujZezwolenia.odswiezZezwolenia(daneDoOdswiezania[i], false);
                                }
                            }
                        }

                        if ((daneDoOdswiezania[i].typ_danych === "Analog") && dane.daneTCP.analog[daneDoOdswiezania[i].poz_ramka] !== undefined) {
                            switch (daneDoOdswiezania[i].id) {
                            case 'pozycjaOrganX':
                                pozOrganX = odswiezajObiekt.typAnalog(daneDoOdswiezania[i]);
                                break;
                            case 'pozycjaOrganY':
                                pozOrganY = odswiezajObiekt.typAnalog(daneDoOdswiezania[i]);
                                break;
                            case 'nachyleniePodluzne':
                                rysujZezwolenia.odswiezPozycje('nachyleniePodluzne', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                break;
                            case 'nachyleniePoprzeczne':
                                //rysujPozycjonowanie.odswiez('nachyleniePoprzeczne', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                rysujZezwolenia.odswiezPozycje('nachyleniePoprzeczne', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                break;
                            case 'katKombajnuWwurobisku':
                                if (varGlobal.czyPozycjonowanieGIG) {
                                    //rysujPozycjonowanie.odswiez('nachyleniePoprzeczne', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                    rysujZezwolenia.odswiezPozycje('katKombajnuWwurobisku', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                }
                                break;
                            case 'iBL1_LaserPrzod':
                                if (varGlobal.czyPozycjonowanieGIG) {
                                    //rysujPozycjonowanie.odswiez('iBL1_LaserPrzod', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                    rysujZezwolenia.odswiezPozycje('iBL1_LaserPrzod', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                }
                                break;
                            case 'iBL2_LaserTyl':
                                if (varGlobal.czyPozycjonowanieGIG) {
                                    //rysujPozycjonowanie.odswiez('iBL2_LaserTyl', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                    rysujZezwolenia.odswiezPozycje('iBL2_LaserTyl', odswiezajObiekt.typAnalog(daneDoOdswiezania[i]));
                                }
                                break;
                            }
                        }



                    }
                    if ((pozOrganX !== undefined) && (pozOrganY !== undefined)) {
                        //console.log(pozOrganX + ' ' + pozOrganY);
                        rysujOrgan.przesun(pozOrganX, pozOrganY);
                        //rysujZezwolenia.odswiezTekstyPozycjiOrganu(pozOrganX, 'X');
                        //rysujZezwolenia.odswiezTekstyPozycjiOrganu(pozOrganY, 'Y');
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
