/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define, Raphael */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'paper'], function ($, varGlobal, json, paper) { // , 'grafika/helvetica'    , zbiorZnakow
    'use strict';

    var init = false,
        pozXtekst,
        pozYtekst,
        zezwolenia2 = [],

        kombajnBok,
        kombajnBokTekst,
        kombajnTyl,
        kombajnTylTekst,
        kombajnGora,
        kombajnGoraTekst,
        laserPrzodTekst,
        laserTylTekst,
        katPodluznyOld = 0,
        katPoprzecznyOld = 0,
        katDoOsiWyrobiskaOld = 0,
        uszkodzenieAntykolizji,


        odswiezZezwolenia = function (obiekt, czyJestZezwolenie) {
            var obiektId,
                i,
                zmienStatus = function (_tekstZezwolenia) {
                    if (czyJestZezwolenie) {
                        _tekstZezwolenia.fillColor = 'green';
                    } else {
                        _tekstZezwolenia.fillColor = '#999999';
                    }
                };
            obiektId = obiekt.id.toUpperCase().trim(); // to upper case żeby wychwycić jakieś małe błędy w wielkoścu liter
            for (i = 0; i < zezwolenia2.length; i += 1) {
                if (obiektId === zezwolenia2[i].content.toUpperCase().trim()) {
                    zmienStatus(zezwolenia2[i]);
                }
            }
        },


        odswiezTekstyPozycjiOrganu = function (wartosc, typ) {
            switch (typ) {
            case 'X':
                pozXtekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozycjaOrgX + ': ' + wartosc + 'mm';
                break;
            case 'Y':
                pozYtekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozycjaOrgY + ': ' + wartosc + 'mm';
                break;
            }
        },


        odswiezPozycje = function (id, wartosc) {
            var czulosc = 1,
                katPodluzny,
                katPoprzeczny,
                katDoOsiWyrobiska,
                koniecAnimacji = false;

            if (kombajnBokTekst === undefined) {
                return;
            }

            switch (id) {
            case 'nachyleniePodluzne':
                if (kombajnBokTekst !== undefined) {
                    kombajnBokTekst.content = wartosc + '°';
                    katPodluzny = -wartosc;
                }
                break;
            case 'nachyleniePoprzeczne':
                if (kombajnTylTekst !== undefined) {
                    kombajnTylTekst.content = wartosc + '°';
                    katPoprzeczny = wartosc;
                }
                break;
            case 'katKombajnuWwurobisku':
                break;
            case 'iBL1_LaserPrzod':
                laserPrzodTekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.laserPrzod + ': ' + wartosc + 'mm';
                break;
            case 'iBL2_LaserTyl':
                laserTylTekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.laserTyl + ': ' + wartosc + 'mm';
                break;
            }

            if (Math.abs(katPodluzny - katPodluznyOld) > czulosc) { // wykonaniu rysowania po odpowiednio duzym skoku organu (wydajnosc DC1)
                katPodluznyOld = katPodluzny;
                kombajnBok.rotate(-kombajnBok.rotation + katPodluzny); // skasowanie poprzedniej rotacji i zrobienie nowej
            }
            if (Math.abs(katPoprzeczny - katPoprzecznyOld) > czulosc) { // wykonaniu rysowania po odpowiednio duzym skoku organu (wydajnosc DC1)
                katPoprzecznyOld = katPoprzeczny;
                kombajnTyl.rotate(-kombajnTyl.rotation + katPoprzeczny);
            }
            
            if (varGlobal.czyPozycjonowanieGIG) {
                kombajnGoraTekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.katDoOsiWyrob + ': ' + wartosc + '°';
                katDoOsiWyrobiska = -wartosc;
                if (Math.abs(katDoOsiWyrobiska - katDoOsiWyrobiskaOld) > czulosc) { // wykonaniu rysowania po odpowiednio duzym skoku organu (wydajnosc DC1)
                    katDoOsiWyrobiskaOld = katDoOsiWyrobiska;
                    kombajnGora.rotate(-kombajnGora.rotation + katDoOsiWyrobiska);
                }
            }
        },


        odswiezAntykolizje = function (_czyUszkodzenie) {
            if (_czyUszkodzenie) {
                uszkodzenieAntykolizji.visible = true;
            } else {
                uszkodzenieAntykolizji.visible = false;
            }
        },


        rysujUszkodzenieAntykolizji = function (_wymiary) {
            var start_y,
                start_x,
                styl = {
                    fontFamily: 'Arial',
                    fontWeight: 'bold', // normal
                    fontSize: 12,
                    fillColor: 'red',
                    justification: 'middle'
                };

            start_y = $('#grafika').height() - 10;
            start_x = (_wymiary.wsp.poczatekX + (_wymiary.LP.S / 2));
            uszkodzenieAntykolizji = new paper.PointText(new paper.Point(start_x, start_y));
            uszkodzenieAntykolizji.style = styl;
            uszkodzenieAntykolizji.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.antykolizja2;
            uszkodzenieAntykolizji.position.x -= uszkodzenieAntykolizji.bounds.width / 2;
            uszkodzenieAntykolizji.visible = false;
        },


        rysujPozycje = function (_wymiary) {
            var start_x = 0,
                start_y = 0,
                styl = {
                    fontFamily: 'Arial',
                    fontWeight: 'normal', // bold
                    fontSize: 14,
                    fillColor: '#999999',
                    justification: 'middle'
                },
                rect,
                rectPath,
                szerokoscKombWzgledna,
                img,
                proporcjaEkranu,
                skalowanie = 1.1; //  0.5 czarno białe obrazki;  to pod GIG!!
                //skalowanie = 0.3; //  

            proporcjaEkranu = $(document).width() / $(document).height();
            if (proporcjaEkranu > 1.7) { // monitor panoramiczny 16:9
                proporcjaEkranu = 0.5; // pomniejsz obrazki kombajnow
                //console.log('proporcje 16:9');
            } else { // monitor 4:3
                proporcjaEkranu = 1; // pozostaw bez zmian
                //console.log('proporcje 4:3');
            }

            kombajnBok = new paper.Raster('obrazki/kombajnBok01.png'); // pierwszy będzie załadowany obrazek w prawym górnym rogu, reszta względem niego
            kombajnBok.onLoad = function () {
                kombajnBok.position = new paper.Point(-10, 10);
                kombajnBok.scale(skalowanie);
                kombajnBok.position.x += $('#grafika').width() - (kombajnBok.bounds.width / 2);
                kombajnBok.position.y += kombajnBok.bounds.height / 1.5;
                start_x = kombajnBok.position.x; // dodanie tekstu z wartością
                start_y = kombajnBok.position.y + kombajnBok.bounds.height / 1.5;
                kombajnBokTekst = new paper.PointText(new paper.Point(start_x, start_y));
                kombajnBokTekst.style = styl;
                kombajnBokTekst.content = '';

                kombajnTyl = new paper.Raster('obrazki/kombajnTyl01.png'); // pierwszy będzie załadowany obrazek w prawym górnym rogu, reszta względem niego
                kombajnTyl.position = new paper.Point(kombajnBok.bounds.bottomCenter);
                kombajnTyl.onLoad = function () {
                    kombajnTyl.scale(skalowanie * 0.7);
                    //kombajnTyl.scale(skalowanie * 0.5);
                    //kombajnTyl.position.x += $('#grafika').width() - (kombajnBok.bounds.width / 2);
                    kombajnTyl.position.y += kombajnTyl.bounds.height / 1.3;
                    start_x = kombajnTyl.position.x; // dodanie tekstu z wartością
                    start_y = kombajnTyl.position.y + kombajnTyl.bounds.height / 1.5;
                    kombajnTylTekst = new paper.PointText(new paper.Point(start_x, start_y));
                    kombajnTylTekst.style = styl;
                    kombajnTylTekst.content = '';
                };


                //      TO DLA PRZYPADKU POZYCJONOWANIA GIG - RYSUNMKI BOCZNY I TYLNE SA ZMNIEJSZONE I UMIESZCZONE NA GORZE!!
                //            kombajnTyl.onLoad = function () {
                //                kombajnTyl.scale(skalowanie);
                //                kombajnTyl.position.x += $('#grafika').width() - (kombajnTyl.bounds.width / 2);
                //                kombajnTyl.position.y += kombajnTyl.bounds.height / 2;
                //                start_x = kombajnTyl.position.x; // dodanie tekstu z wartością
                //                start_y = kombajnTyl.position.y + kombajnTyl.bounds.height / 1.5;
                //                kombajnTylTekst = new paper.PointText(new paper.Point(start_x, start_y));
                //                kombajnTylTekst.style = styl;
                //                kombajnTylTekst.content = '';
                //
                //                kombajnBok = new paper.Raster('obrazki/kombajnBok01.png'); // pierwszy będzie załadowany obrazek w prawym górnym rogu, reszta względem niego
                //                kombajnBok.position = new paper.Point(-10, 10);
                //                kombajnBok.onLoad = function () {
                //                    kombajnBok.scale(skalowanie + 0.3);
                //                    kombajnBok.position.x += $('#grafika').width() - kombajnTyl.bounds.width * 2;
                //                    kombajnBok.position.y += kombajnTyl.bounds.height / 2;
                //                    start_x = kombajnBok.position.x; // dodanie tekstu z wartością
                //                    start_y = kombajnBok.position.y + kombajnBok.bounds.height / 1.5;
                //                    kombajnBokTekst = new paper.PointText(new paper.Point(start_x, start_y));
                //                    kombajnBokTekst.style = styl;
                //                    kombajnBokTekst.content = '';
                //                };

                if (varGlobal.czyPozycjonowanieGIG) {
                    rect = new paper.Rectangle({
                        point: [kombajnTyl.position.x - kombajnTyl.bounds.width / 2, kombajnTyl.position.y + kombajnTyl.bounds.height],
                        size: [kombajnTyl.bounds.width, 600]
                    });
                    rectPath = new paper.Path.Rectangle(rect, 6);
                    rectPath.strokeColor = '#999999';
                    rectPath.strokeWidth = 1;

                    // ustalenie proporcji dla wstawianego rysunku względem prostokąta (szerokości obudowy LP)
                    szerokoscKombWzgledna = rect.width * (3876 / _wymiary.norma.S); // 3876 - rzeczywista szerokosc kombajnu wzieta z dokumentacji (ze złożonymi poszerzeniami stołu, 4734 z rozłożonymi)
                    kombajnGora = new paper.Raster('obrazki/kombajnGora.png');
                    kombajnGora.onLoad = function () {
                        kombajnGora.scale(szerokoscKombWzgledna / kombajnGora.bounds.width);
                        kombajnGora.position.x = rect.x + rect.width / 2;
                        kombajnGora.position.y = rect.y + kombajnGora.bounds.height / 1.8;

                        start_x = _wymiary.LP.S + _wymiary.wsp.poczatekX + 10; // dodanie tekstu z wartością
                        start_y = rect.y + kombajnBokTekst.bounds.height;
                        kombajnGoraTekst = new paper.PointText(new paper.Point(start_x, start_y));
                        kombajnGoraTekst.style = styl;
                        kombajnGoraTekst.style.justification = 'left';
                        kombajnGoraTekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.katDoOsiWyrob;

                        start_y = start_y + kombajnGoraTekst.bounds.height * 0.9;
                        laserPrzodTekst = new paper.PointText(new paper.Point(start_x, start_y));
                        laserPrzodTekst.style = styl;
                        laserPrzodTekst.style.justification = 'left';
                        laserPrzodTekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.laserPrzod;

                        start_y = start_y + laserPrzodTekst.bounds.height * 0.9;
                        laserTylTekst = new paper.PointText(new paper.Point(start_x, start_y));
                        laserTylTekst.style = styl;
                        laserTylTekst.style.justification = 'left';
                        laserTylTekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.laserTyl;
                    };
                }
            };
        },


        inicjacja = function (_wymiary) {
            var i,
                length,
                start_x,
                start_y,
                styl = {
                    fontFamily: 'Arial',
                    fontWeight: 'normal', // bold
                    fontSize: 14,
                    fillColor: '#999999',
                    justification: 'left'
                },
                tekst;

            init = true;
            //console.log(init);
            start_x = _wymiary.LP.S + _wymiary.wsp.poczatekX + 10;
            start_y = $('#grafika').height() / 1.3;
            length = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zezwoleniaNapedow.length;
            for (i = 0; i < length; i += 1) {
                if (i === 0) {
                    tekst = new paper.PointText(new paper.Point(start_x, start_y));
                    tekst.style = styl;
                    tekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zezwoleniaNapedow[i];
                    start_x = start_x + 10; // tabulacja dla pozostałych pozycji
                } else {
                    //zezwolenia2.push(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zezwoleniaNapedow[i]);
                    tekst = new paper.PointText(new paper.Point(start_x, start_y));
                    tekst.style = styl;
                    tekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zezwoleniaNapedow[i];
                    zezwolenia2.push(tekst);
                }
                start_y = start_y + tekst.bounds.height * 0.9;
            }

            // zainicjowanie tekstów z pozycją organu
            //            start_x = start_x - 10;
            //            start_y = start_y + 15;
            //            pozXtekst = new paper.PointText(new paper.Point(start_x, start_y));
            //            pozXtekst.style = styl;
            //            pozXtekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozycjaOrgX;
            //            start_y = start_y + pozXtekst.bounds.height * 0.9;
            //            pozYtekst = new paper.PointText(new paper.Point(start_x, start_y));
            //            pozYtekst.style = styl;
            //            pozYtekst.content = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozycjaOrgY;

            rysujPozycje(_wymiary);
            rysujUszkodzenieAntykolizji(_wymiary);
        };

    return {
        inicjacja: inicjacja,
        odswiezZezwolenia: odswiezZezwolenia,
        odswiezTekstyPozycjiOrganu: odswiezTekstyPozycjiOrganu,
        odswiezPozycje: odswiezPozycje,
        odswiezAntykolizje: odswiezAntykolizje
    };
});