/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'paper'], function ($, varGlobal, paper) {
    'use strict';

    var styl = {
            strokeColor: 'pink',
            strokeWidth: 1
        },

        rysujLukiOciosowe = function (_wymiary) {
            var cx,
                cy,
                rad = Math.PI / 180,
                rysujLuk = function (cx, cy, r, startAngle, endAngle, punktPomiedzy) { // Funkcja do rysowania luku cx, cy - wspolrzedne srodka okregu, r - promien, sweep - parametr okreslajacy wyglad luku (w ktora strone jest wygiecie)
                    var x1 = cx + r * Math.cos(-startAngle * rad), // punkt początkowy
                        y1 = cy + r * Math.sin(-startAngle * rad),
                        x2 = cx + r * Math.cos(-endAngle * rad), // punkt końcowy
                        y2 = cy + r * Math.sin(-endAngle * rad),
                        x3 = cx + r * Math.cos((-startAngle + punktPomiedzy) * rad), // punkt pomiędzy początkowym o końcowym
                        y3 = cy + r * Math.sin((-startAngle + punktPomiedzy) * rad),
                        p1 = new paper.Point(x1, y1),
                        p2 = new paper.Point(x2, y2),
                        pMiddle = new paper.Point(x3, y3),
                        arc;

                    arc = new paper.Path.Arc(p1, pMiddle, p2);
                    arc.style = styl;
                };

            cx = _wymiary.wsp.poczatekX + (0.5 * _wymiary.LP.S) + (_wymiary.LP.R1 - (0.5 * _wymiary.LP.S));
            cy = _wymiary.wsp.wysokoscEkranu - _wymiary.LP.Z - _wymiary.wsp.marginesY - _wymiary.wsp.podciecieSpagu;
            rysujLuk(cx, cy, _wymiary.LP.R1, 180, 180 - _wymiary.LP.katL1, 25);

            cx = _wymiary.wsp.poczatekX + (0.5 * _wymiary.LP.S - (_wymiary.LP.R1 - (0.5 * _wymiary.LP.S)));
            cy = _wymiary.wsp.wysokoscEkranu - _wymiary.LP.Z - _wymiary.wsp.marginesY - _wymiary.wsp.podciecieSpagu;
            rysujLuk(cx, cy, _wymiary.LP.R1, 0, _wymiary.LP.katL1, -25);

            cx = _wymiary.wsp.poczatekX + 0.5 * _wymiary.LP.S;
            cy = _wymiary.wsp.wysokoscEkranu - _wymiary.LP.Z - _wymiary.wsp.marginesY - _wymiary.wsp.podciecieSpagu - (_wymiary.LP.W - _wymiary.LP.Z - _wymiary.LP.R2);
            rysujLuk(cx, cy, _wymiary.LP.R2, 90 - _wymiary.LP.katL2 / 2, 90 + _wymiary.LP.katL2 / 2, -25);
        },


        rysujSlupki = function (_wymiary) {
            var punktZ_LD, // lewy dolny punkt slupka
                punktZ_LG, // lewy gorny punkt slupka
                punktZ_PD,
                punktZ_PG,
                rysujSlupek = function (_punkt1, _punkt2) {
                    var path = new paper.Path();
                    path.add(_punkt1);
                    path.add(_punkt2);
                    path.style = styl;
                };

            punktZ_LD = new paper.Point(_wymiary.wsp.poczatekX, _wymiary.wsp.poczatekY);
            punktZ_LG = new paper.Point(_wymiary.wsp.poczatekX, _wymiary.wsp.wysokoscEkranu - _wymiary.LP.Z - _wymiary.wsp.marginesY - _wymiary.wsp.podciecieSpagu);
            rysujSlupek(punktZ_LD, punktZ_LG);

            punktZ_PD = new paper.Point(_wymiary.LP.S + _wymiary.wsp.poczatekX, (_wymiary.wsp.wysokoscEkranu - _wymiary.wsp.marginesY - _wymiary.wsp.podciecieSpagu));
            punktZ_PG = new paper.Point(_wymiary.LP.S + _wymiary.wsp.poczatekX, _wymiary.wsp.wysokoscEkranu - _wymiary.LP.Z - _wymiary.wsp.marginesY - _wymiary.wsp.podciecieSpagu);
            rysujSlupek(punktZ_PD, punktZ_PG);
        },


        inicjacja = function (_wymiary) {
            styl.strokeColor = _wymiary.par.stroke;
            styl.strokeWidth = _wymiary.par.strokeWidth;

            rysujSlupki(_wymiary);
            rysujLukiOciosowe(_wymiary);
        };

    return {
        inicjacja: inicjacja
    };
});
