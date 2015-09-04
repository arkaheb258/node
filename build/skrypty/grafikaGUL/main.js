/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */
/*global  Raphael */


define(['jquery',
        'zmienneGlobalne',
        'paper'
       ], function (
    $,
    varGlobal,
    paper
) {
    "use strict";

    var zezwoleniePracyOrganow = false,
        grupaKombajn,
        imgKorpusGUL,
        imgOrganLewy,
        imgOrganPrawy,
        imgNapedLewy,
        imgNapedPrawy,
        imgRolka,
        imgSekcje,

        przesuniecieOrganLewy,
        przesuniecieOrganPrawy,

        imgPrzekladniaLewa,
        imgPrzekladniaPrawa,
        imgPrzekladniaRolka,

        tekstNapedLewyOpis,
        tekstNapedPrawyOpis,
        tekstRolkaOpis,
        tekstOrganPrad,

        pathJazda,
        tekstPredkosc,
        pathLewo,
        pathPrawo,
        pathOrganPrad,

        krancowkaNLzwolnij,
        krancowkaNLstop,
        krancowkaNPzwolnij,
        krancowkaNPstop,
        nrSekcjiGULtekst,
        pradGUL,
        nrSekcjiGUL,
        stylKrancowka = {
            fillColor: '#363636',
            strokeColor: 'silver',
            strokeWidth: 2
        },


        odswiezKrancowke = function (_obiekt, _stanKrancowki) {
            var ccc,
                ustawStan = function (_nazwaPath) {
                    if (_stanKrancowki === true) { // krańcówka najechana
                        _nazwaPath.fillColor = 'green';
                        _nazwaPath.strokeColor = 'lime';
                    } else { // krańcówka nie najechana
                        _nazwaPath.fillColor = '#363636';
                        _nazwaPath.strokeColor = 'silver';
                    }
                };
            
            switch (_obiekt.id) {
            case 'xNL_KrancowkaZwolnij':
                ustawStan(krancowkaNLzwolnij);
                break;
            case 'xNL_KrancowkaStop':
                ustawStan(krancowkaNLstop);
                break;
            case 'xNP_KrancowkaZwolnij':
                ustawStan(krancowkaNPzwolnij);
                break;
            case 'xNP_KrancowkaStop':
                ustawStan(krancowkaNPstop);
                break;
            }
        },


        odswiezPozycjeGUL = function (_nowaPozycja) {
            var liczbaSekcjiMin = 6, // rKonfSciany_NrSekcji_NL   rKonfSciany_NrSekcji_NP
                liczbaSekcjiMax = 66, // max liczba sekcji na trasie - to ma być pobrane z parametrów!!!!!!!!!!!!!!!!!!!!
                czyNumeracjaSekcjiOdNL,

                pozXkrancowkaStopNL,
                pozXkrancowkaStopNP,
                dlugoscTrasy, // w pixelach
                dlugoscSekcji, // w pixelach
                pozycjaKombajnu; // w pixelach


            if (varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_NrSekcji_NL.WART < varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_NrSekcji_NP.WART) {
                czyNumeracjaSekcjiOdNL = true; // numeracja sekcji zaczyna się od napędu lewego -> NL=1 / NP=np 120
            } else {
                czyNumeracjaSekcjiOdNL = false; // numeracja sekcji zaczyna się od napędu prawego -> NP=1 / NL=np 120
            }

            // znalezienie z parametrów wartości min i max sekcji w ścianie
            liczbaSekcjiMin = Math.min(varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_NrSekcji_NL.WART,
                varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_NrSekcji_NP.WART);
            liczbaSekcjiMax = Math.max(varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_NrSekcji_NL.WART,
                varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_NrSekcji_NP.WART);

            if (_nowaPozycja !== nrSekcjiGUL) { // przerysowanie tylko wtedy gdy nastąpiła zmiana pozycji
                nrSekcjiGUL = _nowaPozycja;

                pozXkrancowkaStopNL = krancowkaNLstop.bounds.x + imgKorpusGUL.bounds.width / 3;
                pozXkrancowkaStopNP = krancowkaNPstop.bounds.x - imgKorpusGUL.bounds.width / 3;
                dlugoscTrasy = pozXkrancowkaStopNP - pozXkrancowkaStopNL;
                dlugoscSekcji = dlugoscTrasy / liczbaSekcjiMax;

                if (czyNumeracjaSekcjiOdNL) {
                    pozycjaKombajnu = pozXkrancowkaStopNL + (_nowaPozycja * dlugoscSekcji); // przesunięcie kombajnu na trasie
                    if (_nowaPozycja < liczbaSekcjiMin) { // wartość poniżej zakresu
                        pozycjaKombajnu = pozXkrancowkaStopNL + (liczbaSekcjiMin * dlugoscSekcji);
                    }
                    if (_nowaPozycja > liczbaSekcjiMax) { // wartość powyżej zakresu
                        pozycjaKombajnu = pozXkrancowkaStopNL + (liczbaSekcjiMax * dlugoscSekcji);
                    }

                } else {
                    pozycjaKombajnu = pozXkrancowkaStopNP - (_nowaPozycja * dlugoscSekcji);
                    if (_nowaPozycja < liczbaSekcjiMin) { // wartość poniżej zakresu
                        pozycjaKombajnu = pozXkrancowkaStopNP - (liczbaSekcjiMin * dlugoscSekcji);
                    }
                    if (_nowaPozycja > liczbaSekcjiMax) { // wartość powyżej zakresu
                        pozycjaKombajnu = pozXkrancowkaStopNP - (liczbaSekcjiMax * dlugoscSekcji);
                    }
                }

                // przesunięcie
                grupaKombajn.position.x = pozycjaKombajnu;
            }
        },


        odswiezAnalog = function (_obiekt, _wartosc) {
            var ccc,
                animacja = function (_nazwaObrazka, _nazwaTekstu) {
                    if (_wartosc > 0) {
                        _nazwaObrazka.rotate(9);
                        _nazwaTekstu.fillColor = 'white'; // orange
                    } else {
                        _nazwaTekstu.fillColor = 'grey';
                    }
                };

            switch (_obiekt.id) {
            case 'uiISilnikOrganu':
                tekstOrganPrad.content = 'M1: ' + _wartosc + ' A';
                if (_wartosc > 0) {
                    tekstOrganPrad.fillColor = 'white';
                    imgOrganLewy.rotate(-9);
                    imgOrganPrawy.rotate(9);

                    pathOrganPrad.rotate(-19);
                    if (_wartosc < _obiekt.ana_warn_h) {
                        pathOrganPrad.fillColor = 'green';
                        pathOrganPrad.strokeColor = 'lime';
                    }
                    if ((_wartosc > _obiekt.ana_warn_h) && (_wartosc < _obiekt.ana_alarm_h)) {
                        pathOrganPrad.fillColor = 'darkOrange';
                        pathOrganPrad.strokeColor = 'yellow';
                    }
                    if (_wartosc > _obiekt.ana_alarm_h) {
                        pathOrganPrad.fillColor = 'darkred';
                        pathOrganPrad.strokeColor = 'red';
                    }
                } else {
                    tekstOrganPrad.fillColor = 'grey';
                    pathOrganPrad.style = stylKrancowka;
                }
                break;
            case 'idPradNP':
                //console.log(_wartosc);
                tekstNapedPrawyOpis.content = 'NP: ' + _wartosc + ' A';
                animacja(imgPrzekladniaPrawa, tekstNapedPrawyOpis);
                break;
            case 'idPradNL':
                tekstNapedLewyOpis.content = 'NL: ' + _wartosc + ' A';
                animacja(imgPrzekladniaLewa, tekstNapedLewyOpis);
                break;
            case 'idPradRolka':
                tekstRolkaOpis.content = 'NR: ' + _wartosc + ' A';
                animacja(imgPrzekladniaRolka, tekstRolkaOpis);
                break;
            case 'idPozycjaGUL':
                nrSekcjiGULtekst.content = nrSekcjiGUL + '/' + varGlobal.parametry.DANE.grupa11.podgrupa1.rKonfSciany_LiczbaSekcji.WART; // wyświetlenie aktualnej pozycji     rKonfSciany_LiczbaSekcji
                odswiezPozycjeGUL(_wartosc); // przesunięcie obrazka z GUL
                break;
            case 'idPrędkoscGUL':
                tekstPredkosc.content = _wartosc;
                tekstPredkosc.position = new paper.Point(pathJazda.bounds.center);
                tekstPredkosc.position.x -= tekstPredkosc.bounds.width;
                tekstPredkosc.position.y += tekstPredkosc.bounds.height * 2;
                break;
            default:
            }
        },


        odswiezJazde = function (_wartosc) { // 0:stop, 1:lewo, 2:prawo
            switch (_wartosc) {
            case 0:
                tekstPredkosc.fillColor = 'grey';
                pathLewo.fillColor = 'grey';
                pathPrawo.fillColor = 'grey';
                break;
            case 1:
                tekstPredkosc.fillColor = 'orange';
                pathLewo.fillColor = 'orange';
                break;
            case 2:
                tekstPredkosc.fillColor = 'orange';
                pathPrawo.fillColor = 'orange';
                break;
            }
        },


        inicjacja = function (_kierunekRolki) { // _kierunekRolki  0:prawo, 1:lewo
            var canvas,
                d = new $.Deferred(), // wywolanie asynchroniczne
                skala = 0.25, // zmniejszenie obrazka z korpusem gula
                punkt,
                styl = {
                    fontFamily: 'Arial',
                    fontWeight: 'normal', // bold , normal
                    fontSize: '1.4em',
                    fillColor: 'white',
                    justification: 'middle'
                },
                i;

            $('#grafika').empty();
            canvas = document.createElement('canvas');
            $(canvas)
                .attr('id', 'canvas')
                .width('100%')
                .height('100%')
                .appendTo('#grafika');
            paper.setup(canvas); // Get a reference to the canvas object

            //imgKorpusGUL = new paper.Raster('obrazki/gul_calyBezOrganow1.png');
            imgKorpusGUL = new paper.Raster('obrazki/gul_caly_odZawalu01.png');
            imgKorpusGUL.position = paper.view.center;
            imgKorpusGUL.position.y += paper.view.size.height / 5;
            imgKorpusGUL.scale(skala);
            imgKorpusGUL.onLoad = function () {
                // Numer sekcji na której znajduje się GUL
                punkt = new paper.Point(imgKorpusGUL.bounds.bottomCenter);
                nrSekcjiGULtekst = new paper.PointText(punkt);
                nrSekcjiGULtekst.content = '66/124';
                nrSekcjiGULtekst.style = styl;
                nrSekcjiGULtekst.position.x -= nrSekcjiGULtekst.bounds.width / 2;
                nrSekcjiGULtekst.position.y += nrSekcjiGULtekst.bounds.height * 0.5;

                //                console.log(imgKorpusGUL.bounds);
                //                punkt = new paper.Point(paper.view.bounds.bottomCenter);
                //                pradGUL = new paper.PointText(punkt);
                //                pradGUL.content = '0,0 A';
                //                pradGUL.style = styl;
                //                //pradGUL.fillColor = 'black';
                //                pradGUL.fontWeight = 'bold';
                //                pradGUL.position.x -= pradGUL.bounds.width / 2;
                //                pradGUL.position.y -= pradGUL.bounds.height;

                imgOrganLewy = new paper.Raster('obrazki/gul_organLewy2.png');
                imgOrganLewy.position = imgKorpusGUL.bounds.leftCenter;
                imgOrganLewy.position.x += imgKorpusGUL.bounds.width / 8; //  6.75
                imgOrganLewy.scale(skala * 2);
                imgOrganLewy.sendToBack();

                imgOrganPrawy = new paper.Raster('obrazki/gul_organPrawy2.png');
                imgOrganPrawy.position = imgKorpusGUL.bounds.rightCenter;
                imgOrganPrawy.position.x -= imgKorpusGUL.bounds.width / 9;
                imgOrganPrawy.scale(skala * 2);
                imgOrganPrawy.sendToBack();

                // stworzenie grupy do póżniejszego przesuwania kombajnu po trasie
                grupaKombajn = new paper.Group([imgOrganLewy, imgOrganPrawy, imgKorpusGUL, nrSekcjiGULtekst]);

                imgNapedLewy = new paper.Raster('obrazki/zwrotnyLewo01.png');
                punkt = new paper.Point(paper.view.bounds.left + 150, imgKorpusGUL.bounds.y + imgKorpusGUL.bounds.height);
                imgNapedLewy.position = punkt;
                imgNapedLewy.scale(skala * 1.6);
                imgNapedLewy.position.x += imgKorpusGUL.bounds.width / 4;
                imgNapedLewy.sendToBack();
                imgNapedLewy.onLoad = function () {
                    imgPrzekladniaLewa = new paper.Raster('obrazki/gear02.png');
                    imgPrzekladniaLewa.scale(skala * 1.6);
                    imgPrzekladniaLewa.position = imgNapedLewy.bounds.topLeft;
                    imgPrzekladniaLewa.position.x += 20;
                    imgPrzekladniaLewa.position.y -= 20;
                    imgPrzekladniaLewa.onLoad = function () {
                        punkt = new paper.Point(imgPrzekladniaLewa.bounds.rightCenter); // rightCenter   bottomRight
                        tekstNapedLewyOpis = new paper.PointText(punkt);
                        tekstNapedLewyOpis.content = 'NL: 66,6 A';
                        tekstNapedLewyOpis.style = styl;
                        tekstNapedLewyOpis.position.y += tekstNapedLewyOpis.bounds.height / 3;

                        // KRAŃCÓWKI
                        punkt = new paper.Point(imgNapedLewy.bounds.bottomCenter);
                        krancowkaNLzwolnij = new paper.Path.Circle(punkt, 10);
                        krancowkaNLzwolnij.style = stylKrancowka;

                        punkt = new paper.Point(imgNapedLewy.bounds.bottomCenter);
                        krancowkaNLstop = new paper.Path.Circle(punkt, 10);
                        krancowkaNLstop.style = stylKrancowka;
                        krancowkaNLstop.position.x -= krancowkaNLstop.bounds.width * 2;

                        // ROLKA  W LEWO
                        if (_kierunekRolki === 1) {
                            imgPrzekladniaRolka = new paper.Raster('obrazki/gear02.png');
                            imgPrzekladniaRolka.scale(skala * 1.6);
                            imgPrzekladniaRolka.position = imgPrzekladniaLewa.bounds.topCenter;
                            imgPrzekladniaRolka.position.y -= imgPrzekladniaLewa.bounds.height;
                            imgPrzekladniaRolka.onLoad = function () {
                                punkt = new paper.Point(imgPrzekladniaRolka.bounds.rightCenter);
                                tekstRolkaOpis = new paper.PointText(punkt);
                                tekstRolkaOpis.content = 'NR: 66,6 A';
                                tekstRolkaOpis.style = styl;
                                tekstRolkaOpis.position.y += tekstRolkaOpis.bounds.height / 3;

                                imgRolka = new paper.Raster('obrazki/rolkaLewo01.png');
                                imgRolka.position = tekstRolkaOpis.bounds.rightCenter;
                                imgRolka.scale(skala / 2);
                                imgRolka.onLoad = function () {
                                    imgRolka.position.x += imgRolka.bounds.width * 1.1;
                                    //zezwoleniePracyOrganow = true; // start animacji dopiero po zaladowaniu obrazkow

                                    d.resolve(true);
                                };
                            };
                        }
                    };
                };

                imgNapedPrawy = new paper.Raster('obrazki/wysypPrawo01.png');
                punkt = new paper.Point(paper.view.bounds.right - 150, imgKorpusGUL.bounds.y + imgKorpusGUL.bounds.height);
                imgNapedPrawy.position = punkt;
                imgNapedPrawy.scale(skala * 1.6);
                imgNapedPrawy.position.x -= imgKorpusGUL.bounds.width / 4;
                imgNapedPrawy.sendToBack();
                imgNapedPrawy.onLoad = function () {
                    imgPrzekladniaPrawa = new paper.Raster('obrazki/gear02.png');
                    imgPrzekladniaPrawa.scale(skala * 1.6);
                    imgPrzekladniaPrawa.position = imgNapedPrawy.bounds.topRight;
                    imgPrzekladniaPrawa.position.x -= 20;
                    imgPrzekladniaPrawa.position.y -= 20;
                    imgPrzekladniaPrawa.onLoad = function () {
                        punkt = new paper.Point(imgPrzekladniaPrawa.bounds.leftCenter);
                        tekstNapedPrawyOpis = new paper.PointText(punkt);
                        tekstNapedPrawyOpis.content = 'NP: 66,6 A';
                        tekstNapedPrawyOpis.style = styl;
                        tekstNapedPrawyOpis.position.y += tekstNapedPrawyOpis.bounds.height / 3;
                        tekstNapedPrawyOpis.position.x -= tekstNapedPrawyOpis.bounds.width;

                        // KRAŃCÓWKI
                        punkt = new paper.Point(imgNapedPrawy.bounds.bottomCenter);
                        krancowkaNPzwolnij = new paper.Path.Circle(punkt, 10);
                        krancowkaNPzwolnij.style = stylKrancowka;

                        punkt = new paper.Point(imgNapedPrawy.bounds.bottomCenter);
                        krancowkaNPstop = new paper.Path.Circle(punkt, 10);
                        krancowkaNPstop.style = stylKrancowka;
                        krancowkaNPstop.position.x += krancowkaNPstop.bounds.width * 2;

                        // ROLKA  W PRAWO
                        if (_kierunekRolki === 0) {
                            imgPrzekladniaRolka = new paper.Raster('obrazki/gear02.png');
                            imgPrzekladniaRolka.scale(skala * 1.6);
                            imgPrzekladniaRolka.position = imgPrzekladniaPrawa.bounds.topCenter;
                            imgPrzekladniaRolka.position.y -= imgPrzekladniaPrawa.bounds.height;
                            imgPrzekladniaRolka.onLoad = function () {
                                punkt = new paper.Point(imgPrzekladniaRolka.bounds.leftCenter);
                                tekstRolkaOpis = new paper.PointText(punkt);
                                tekstRolkaOpis.content = 'NR: 66,6 A';
                                tekstRolkaOpis.style = styl;
                                tekstRolkaOpis.position.y += tekstRolkaOpis.bounds.height / 3;
                                tekstRolkaOpis.position.x -= tekstRolkaOpis.bounds.width;

                                imgRolka = new paper.Raster('obrazki/rolkaPrawo01.png');
                                imgRolka.position = tekstRolkaOpis.bounds.leftCenter;
                                imgRolka.scale(skala / 2);
                                //zezwoleniePracyOrganow = true; // start animacji dopiero po zaladowaniu obrazkow

                                imgRolka.onLoad = function () {
                                    d.resolve(true);
                                };


                            };
                        }
                    };
                };

                imgSekcje = new paper.Raster('obrazki/sekcje01.png');
                punkt = new paper.Point(paper.view.center.x, imgKorpusGUL.bounds.y + imgKorpusGUL.bounds.height);
                imgSekcje.position = punkt;
                imgSekcje.scale(skala * 1.6);
                imgSekcje.sendToBack();

                // PRĘDKOŚĆ I KIERUNEK JAZDY
                var rectJazda,
                    skala2,
                    tekstJednostka,
                    pathLewo1 = 'M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z',
                    pathPrawo1 = 'M10.129,22.186 16.316,15.999 10.129,9.812 13.665,6.276 23.389,15.999 13.665,25.725z',
                    pathOrganSVG = "M240 521 c0 -24 -33 -36 -60 -21 -26 14 -46 4 -30 -15 14 -17 -15 -35 -54 -35 -27 0 -43 -15 -26 -25 19 -12 10 -35 -17 -48 -38 -16 -46 -30 -23 -39 22 -8 17 -38 -11 -64 -24 -22 -24 -34 0 -34 24 0 36 -33 21 -60 -13 -25 -5 -41 16 -33 19 7 34 -13 34 -48 0 -34 8 -40 32 -26 20 13 21 12 55 -40 11 -17 13 -17 23 -1 12 19 42 14 66 -13 22 -24 34 -24 34 0 0 24 23 33 56 21 31 -12 45 -5 37 16 -7 20 13 34 49 34 29 0 45 15 28 25 -19 12 -10 35 18 48 37 16 45 30 22 39 -22 8 -17 38 11 64 24 22 24 34 0 34 -24 0 -33 23 -21 56 12 31 5 45 -16 37 -19 -7 -34 13 -34 48 0 34 -8 40 -32 26 -17 -10 -22 -9 -32 6 -30 50 -35 53 -46 35 -12 -19 -42 -14 -66 13 -22 24 -34 24 -34 0z",
                    tempPath;

                // stworzenie prostokąta głównego w którym będą umieszczone strzałki w wskaźnik prędkości
                rectJazda = new paper.Rectangle(new paper.Point(paper.view.bounds.topCenter), new paper.Size(paper.view.bounds.width / 3, paper.view.bounds.height / 3.5));
                pathJazda = new paper.Path.RoundRectangle(rectJazda, new paper.Size(10, 10));
                pathJazda.strokeColor = 'grey';
                pathJazda.position.x -= pathJazda.bounds.width / 2;

                // napis z aktualną prędkością
                punkt = new paper.Point(pathJazda.bounds.center); // paper.view.center
                tekstPredkosc = new paper.PointText(punkt);
                tekstPredkosc.style = styl;
                tekstPredkosc.fontWeight = 'bold';
                tekstPredkosc.fillColor = 'grey';
                tekstPredkosc.fontSize = '5.5em';
                tekstPredkosc.content = '0,0';
                tekstPredkosc.position = new paper.Point(pathJazda.bounds.center);
                tekstPredkosc.position.x -= tekstPredkosc.bounds.width;
                tekstPredkosc.position.y -= tekstPredkosc.bounds.height * 2; // wstępne wycentrowanie, potem jest dalsze centrowanie przy odświeżaniu

                // napis z jednąstką prędkości (m/min)
                punkt = new paper.Point(pathJazda.bounds.bottomCenter); // paper.view.center
                tekstJednostka = new paper.PointText(punkt);
                tekstJednostka.content = 'm/min';
                tekstJednostka.style = styl;
                tekstJednostka.fillColor = 'grey';
                tekstJednostka.position.y -= tekstJednostka.bounds.height * 2;
                tekstJednostka.position.x -= tekstJednostka.handleBounds.width / 2;

                // strzałka w lewo
                pathLewo = new paper.CompoundPath(pathLewo1);
                pathLewo.fillColor = 'grey';
                pathLewo.scale(pathJazda.bounds.height / pathLewo.bounds.height - 0.5);
                pathLewo.position = pathJazda.bounds.leftCenter;
                pathLewo.position.x += pathLewo.bounds.width / 1.5;

                // strzałka w prawo
                pathPrawo = new paper.CompoundPath(pathPrawo1);
                pathPrawo.fillColor = 'grey';
                pathPrawo.scale(pathJazda.bounds.height / pathPrawo.bounds.height - 0.5);
                pathPrawo.position = pathJazda.bounds.rightCenter;
                pathPrawo.position.x -= pathPrawo.bounds.width / 1.5;

                // rysunek organu z informacją o prądzie organu
                pathOrganPrad = new paper.CompoundPath(pathOrganSVG);
                pathOrganPrad.style = stylKrancowka;
                skala2 = pathJazda.bounds.height / pathOrganPrad.bounds.height;
                pathOrganPrad.scale(skala2 - (skala2 * 0.5));
                pathOrganPrad.position = pathJazda.bounds.leftCenter;
                pathOrganPrad.position.x = paper.view.bounds.x + pathOrganPrad.bounds.width;

                //tekstOrganPrad
                punkt = new paper.Point(pathOrganPrad.bounds.rightCenter);
                tekstOrganPrad = new paper.PointText(punkt);
                tekstOrganPrad.content = 'M1: 66,6 A';
                tekstOrganPrad.style = styl;
                tekstOrganPrad.position.x += 5;
                tekstOrganPrad.position.y += tekstOrganPrad.bounds.height;


                // odpalenie odświeżania zmiennych
                d.done(function (czyDOMready) { // Wywolanie asynchroniczne - po załądowaniu wszystkich obrazków
                    if (czyDOMready) {
                        require(['grafikaGUL/odswiezaj'], function (odswiezaj) { // inicjacja odświeżania danych
                            odswiezaj.inicjacja();

                            tekstPredkosc.position = new paper.Point(pathJazda.bounds.center); // zanim się włączy odświeżanie - ustawieni napisu z prędkością 0,0 na środku prostokąta
                            tekstPredkosc.position.x -= tekstPredkosc.bounds.width;
                            tekstPredkosc.position.y += tekstPredkosc.bounds.height * 2;
                        });
                    }
                });

                //odswiezaj(); // TEMP - do skasowania!!
                //                require(['grafikaGUL/odswiezaj'], function (odswiezaj) { // inicjacja odświeżania danych
                //                    console.log('fast');
                //                    //odswiezaj.inicjacja();
                //                });



            };
        };


    return {
        inicjacja: inicjacja,
        odswiezKrancowke: odswiezKrancowke,
        odswiezAnalog: odswiezAnalog,
        odswiezJazde: odswiezJazde
    };
});

//console.log(event.count); // the number of times the frame event was fired:
//console.log(event.time);  // The total amount of time passed since the first frame event in seconds
//console.log(event.delta);  // The time passed in seconds since the last frame event: