/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define, Raphael */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'paper'], function ($, varGlobal, json, paper) { // , 'raphael'   , Raphael
    'use strict';

    var init = false,
        skalowanieImg, // skala organu wzgledem obudowy LP
        wymiary, // przepisanie zmiennych z wymiarami -> nie trzeba bedzie ich przekazywac wywolujac funkcje przesunOrgan
        img,
        pozXmmOld = 0, // zmienne potrzebne do ustalenia czy przesuniecie organu przekroczylo prog czulosci (jesli nie to przesuniecie nie bedzie rysowane)
        pozYmmOld = 0,
        zezwolemieRysowania = false,


        przesun = function (pozXmm, pozYmm) { // pozycja w ramce przychodzi w mm
            var pozXimg,
                pozYimg;

            if (wymiary === undefined) { // nie zostały jeszcze załadowane wymiary...
                return;
            }

            //console.log(zezwolemieRysowania);
            if (zezwolemieRysowania) { // obrazek organu został załadowany
                if ((Math.abs(pozXmm - pozXmmOld) > wymiary.org.czulosc) || (Math.abs(pozYmm - pozYmmOld) > wymiary.org.czulosc)) { // wykonaniu rysowania po odpowiednio duzym skoku organu (wydajnosc DC1)
                    pozXmmOld = pozXmm;
                    pozYmmOld = pozYmm;
                } else {
                    return;
                }

                pozXimg = wymiary.LP.S * (pozXmm / wymiary.norma.S); // przeskalowanie na jednostki wzgledne
                pozYimg = wymiary.LP.W * (pozYmm / wymiary.norma.W);
                pozYimg = -pozYimg; // odwrocenie orientacji ukladu wspolrzednych na osi Y, normalnie w raphaelu punkt (0,0) jest w lewym gornym rogu
                pozXimg = (wymiary.wsp.poczatekX + (wymiary.LP.S / 2) + pozXimg); // rysowanie wzgledem poczatku ukladu wspolrzednych, ktorym jest poczetek rysowania obudowy LP (lewy dolny slupek) -> zmiana, poczatek X jest na srodku pbudowy LP!!!!!
                pozYimg = wymiary.wsp.poczatekY + pozYimg;
                if ((pozXimg !== 0) || (pozYimg !== 0)) {
                    img.position.x = pozXimg;
                    img.position.y = pozYimg;
                }
            }
            //console.log(init);
        },


        rysujOrgan = function () {
            img = new paper.Raster('obrazki/organ_cr_03.png');
            img.position = paper.view.center;
            img.onLoad = function () {
                skalowanieImg = wymiary.org.szerokoscOrgan / img.bounds.width;
                img.scale(skalowanieImg);
                zezwolemieRysowania = true;
            };
        },


        inicjacja = function (_wymiary) {
            wymiary = _wymiary;
            rysujOrgan();
            init = true;
        };


    return {
        inicjacja: inicjacja,
        przesun: przesun
    };
});
