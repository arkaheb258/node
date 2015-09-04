/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON'], function ($, varGlobal, json) {
    "use strict";

    var ccc,


        dodaj = function (key, obiekt, czyOstatniPoziom) {
            var li,
                //a,
                //span,
                ul,
                zbytNiskiPoziomDostepu,
                wartoscParametru = '',
                tekst,
                znak1,
                znak2,
                jednostka;

            li = document.createElement("li");
            //a = document.createElement("a");

            if (czyOstatniPoziom === true) { // Jesli zakonczony poziom to elementu menu nie beda mialy strzalek rozwijania '>'

                //$(a).attr('href', "#");
                //$(li).append(a);
                $(li).attr('id', key);



                //                znak1 = obiekt.OPIS.indexOf("["); // wyciecie jednostek z opisow parametrow -> zawsze sa zawarte w nawiasach kwadratowych []
                //                znak2 = obiekt.OPIS.indexOf("]");
                //                jednostka = obiekt.OPIS.substring(znak1, znak2 + 1);
                //                if (jednostka !== '') {
                //                    obiekt.OPIS = obiekt.OPIS.replace(jednostka, " ");
                //                    //console.log(obiekt);
                //                }

                //&& (obiekt.WART !== undefined)
                if ((obiekt.WART !== "") && (obiekt.WART !== undefined)) { // dopisanie wartosci parametru do opisu (zamiast wczesniej wycietej jednostki)
                    if (obiekt.TYP === 'pLista') {
                        wartoscParametru = ' = ' + obiekt.LISTA[obiekt.WART]; // wczytanie wartosci z listy
                        //wartoscParametru = ' = ' + obiekt.WART + ':' + obiekt.LISTA[obiekt.WART]; // wczytanie wartosci z listy
                    } else {
                        wartoscParametru = ' = ' + obiekt.WART;
                    }
                }

                zbytNiskiPoziomDostepu = false;
                switch (varGlobal.poziomDostepu) { // Sprawdzenie jaki aktualnie jest ustawiony poziom dostepu
                case 'Brak':
                    $(li).addClass('ui-state-disabled');
                    break;
                case 'User':
                case 'User2':
                    if (
                        (obiekt.DOST === 'Srvc') || (obiekt.DOST === 'Adv') || (obiekt.dostep === 'Srvc') || (obiekt.dostep === 'Adv')
                    ) { // to pole  "obiekt.dostep" maja rozkazy
                        $(li).addClass('ui-state-disabled');
                        zbytNiskiPoziomDostepu = true;
                    }
                    break;
                case 'Srvc':
                    if ((obiekt.DOST === 'Adv') || (obiekt.dostep === 'Adv')) {
                        $(li).addClass('ui-state-disabled');
                        zbytNiskiPoziomDostepu = true;
                    }
                    break;
                case "Adv":
                    break;
                default:
                    console.log('Blad ustawienia poziomu dostepu - wartosc poza dopuszczalnym zakresem');
                }

                if (obiekt.ID !== undefined) { // dla rozkazow do plc nie ma id: 1.2.6
                    tekst = obiekt.ID + ' ' + obiekt.OPIS + wartoscParametru;
                } else {
                    tekst = obiekt.OPIS + wartoscParametru;
                }
                if (zbytNiskiPoziomDostepu) {
                    tekst += ' (' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakDostepu + ')';
                }
                //$(a).text(tekst);
                $(li).text(tekst);

            } else {
                if ((typeof obiekt === 'object')) {
                    //                    $(a)
                    //                        .text(obiekt.OPIS);
                    //                        //.attr('href', "#");
                    //                    $(li).append(a);
                    //                    ul = document.createElement("ul");
                    //                    $(li).attr('id', key);
                    //                    $(li).append(ul);


                    //$(a)
                    //.text(obiekt.OPIS);
                    //.attr('href', "#");
                    //$(li).append(a);
                    ul = document.createElement("ul");
                    $(li)
                        .text(obiekt.OPIS)
                        .attr('id', key);
                    $(li).append(ul);

                }
                return li;
            }
            return li;
        };

    return {
        dodaj: dodaj
    };

});