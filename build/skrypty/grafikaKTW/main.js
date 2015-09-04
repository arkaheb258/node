/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery',
        'zmienneGlobalne',
        'paper',
        'grafikaKTW/rysujObudoweLP',
        'grafikaKTW/rysujOrgan',
        'grafikaKTW/rysujZezwolenia',
        'grafikaKTW/odswiezaj'
       ], function (
    $,
    varGlobal,
    paper,
    rysujObudoweLP,
    rysujOrgan,
    rysujZezwolenia,
    odswiezaj
) {
    "use strict";

    var cc,

        inicjacja = function (typObudowy, typOrganu) {
            var canvas,
                wymiary = { // deklaracja truktury z wszystkimi wymiarami potrzebnymi do rysowania
                    norma: { // wymiary wziete z normy
                        S: 0,
                        W: 0,
                        Z: 0,
                        R1: 0,
                        R2: 0,
                        L1: 0,
                        L2: 0,
                        C: 0
                    },
                    LP: { // wymiary wzgledne (wzgledem szerokosci lub wysokosci kontrolki svg)
                        S: 0,
                        W: 0,
                        Z: 0,
                        R1: 0,
                        R2: 0,
                        katL1: 0,
                        katL2: 0
                    },
                    org: { // wymiary organu
                        L1: 0, // szerokosc calego organu (dwue glowice + lacznik) w mm
                        L: 0, // szerokosc pojedynczehj glowicy w mm
                        d: 0, // wysokosc glowicy / organu w mm
                        szerokoscOrgan: 0,
                        wysokoscOrgan: 0,
                        czulosc: 15 // w milimetrach. Ograniczenie animacji organu, chcemy przerysowac organ jesli przesunie sie nie mniej niz o np. 10cm. Poprawa wydajnosci wizualizacji
                    },
                    wsp: { // wymiary wspolne
                        szerokoscEkranu: 0,
                        wysokoscEkranu: 0,
                        podciecieSpagu: 0,
                        marginesY: 10,
                        poczatekX: 0, // poczatek ukladu wspolrzednych na osi X, od tego punktu rysuje sie obudowe LP.
                        poczatekY: 0
                    },
                    par: { // parametry rysowania (grubosci lilii itp)
                        stroke: 'white',
                        strokeWidth: 8,
                        color: 'white',
                        width: 5
                    }
                };

            $('#grafika').empty();
            canvas = document.createElement('canvas');
            $(canvas)
                .attr('id', 'canvas')
                .width('100%')
                .height('100%')
                .appendTo('#grafika');

            paper.setup(canvas); // Get a reference to the canvas object

            wymiary.wsp.szerokoscEkranu = $('#grafika').width();
            wymiary.wsp.wysokoscEkranu = $('#grafika').height();
            wymiary.LP.W = (wymiary.wsp.wysokoscEkranu * 0.95);

            switch (typOrganu) {
            case 'ktw150typ1':
                wymiary.org.L1 = 1480; // mm
                wymiary.org.L = 538;
                wymiary.org.d = 782;
                break;
            case 'ktw150typ2':
                wymiary.org.L1 = 1620;
                wymiary.org.L = 620;
                wymiary.org.d = 850;
                break;
            case 'ktw200typ1':
                wymiary.org.L1 = 1828;
                wymiary.org.L = 686;
                wymiary.org.d = 1050;
                break;
            case 'ktw200typ2':
                wymiary.org.L1 = 1828;
                wymiary.org.L = 686;
                wymiary.org.d = 1050;
                break;
            default:
                // nie wprowadzono wartosci
                break;
            }
            
            if (typObudowy === undefined) { // serwis zgłasza, że czasami nie rysuje się obrys wyrobiska - jest podejrzenie, że parametry się nie wczytują odpowiednio
                typObudowy = 'ŁP 9';
            }
            switch (typObudowy) {
            case 'ŁP 9': /// 'LP9/V25/A
                wymiary.norma.W = 3500; // mm
                wymiary.norma.S = 5000;
                wymiary.norma.Z = 820;
                wymiary.norma.R1 = 2750;
                wymiary.norma.R2 = 2400;
                wymiary.norma.C = 550;
                wymiary.norma.L1 = 3490;
                wymiary.norma.L2 = 4070;
                break;
            case 'ŁP 10': // 'LP10/V25/A
                wymiary.norma.W = 3800; // mm
                wymiary.norma.S = 5500;
                wymiary.norma.Z = 830;
                wymiary.norma.R1 = 3075;
                wymiary.norma.R2 = 2650;
                wymiary.norma.C = 550;
                wymiary.norma.L1 = 3540;
                wymiary.norma.L2 = 4854;
                break;
            case 'ŁP 11': // 'LP11/V25/A
                wymiary.norma.W = 4025; // mm
                wymiary.norma.S = 5800;
                wymiary.norma.Z = 930;
                wymiary.norma.R1 = 3250;
                wymiary.norma.R2 = 2850;
                wymiary.norma.C = 600;
                wymiary.norma.L1 = 3320;
                wymiary.norma.L2 = 3320;
                wymiary.norma.L2 = wymiary.norma.L2 * 2 - wymiary.norma.C;
                break;
            case 'ŁP 12': // 'LP12/V25/A
                wymiary.norma.W = 4225; // mm
                wymiary.norma.S = 6100;
                wymiary.norma.Z = 960;
                wymiary.norma.R1 = 3450;
                wymiary.norma.R2 = 3000;
                wymiary.norma.C = 600;
                wymiary.norma.L1 = 3460;
                wymiary.norma.L2 = 3460;
                wymiary.norma.L2 = wymiary.norma.L2 * 2 - wymiary.norma.C;
                break;
            default:
                return;
            }

            // Obliczenie wymiarow wzglednych z proporcji
            wymiary.LP.S = wymiary.LP.W * (wymiary.norma.S / wymiary.norma.W);
            wymiary.LP.Z = wymiary.LP.W * (wymiary.norma.Z / wymiary.norma.W);
            wymiary.LP.R1 = wymiary.LP.S * (wymiary.norma.R1 / wymiary.norma.S);
            wymiary.LP.R2 = wymiary.LP.W * (wymiary.norma.R2 / wymiary.norma.W);
            wymiary.LP.katL1 = ((wymiary.norma.L1 - wymiary.norma.Z) * 360) / (2 * Math.PI * wymiary.norma.R1); // przeksztalcenie wzoru na odcinek luku
            wymiary.LP.katL2 = (wymiary.norma.L2 * 360) / (2 * Math.PI * wymiary.norma.R2);

            //wymiary.wsp.poczatekX = (wymiary.wsp.szerokoscEkranu / 2) - (wymiary.LP.S / 2); // Ustawienie obudowy zawsze wycentrowanej wzgledem srodka bitmapy
            wymiary.wsp.poczatekX = 10;
            wymiary.wsp.poczatekY = wymiary.wsp.wysokoscEkranu - wymiary.wsp.marginesY - wymiary.wsp.podciecieSpagu; // okreslenie poczatku ukladu wspolrzednych -> od tego punktu beda podawane dane z PLC o polozeniu organu
            wymiary.org.szerokoscOrgan = wymiary.LP.S * (wymiary.org.L1 / wymiary.norma.S); // obliczenie szerokosci i wysokosci organu wzgledem wymiarow obudowy LP
            wymiary.org.wysokoscOrgan = wymiary.LP.W * (wymiary.org.d / wymiary.norma.W); // j.w.

            //console.log('grafika ktw - inicjacja');
            rysujObudoweLP.inicjacja(wymiary);
            rysujOrgan.inicjacja(wymiary);
            rysujZezwolenia.inicjacja(wymiary);

            odswiezaj.inicjacja();
        };


    return {
        inicjacja: inicjacja
    };
});
