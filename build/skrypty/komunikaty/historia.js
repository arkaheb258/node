/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


define(['jquery', 'zmienneGlobalne', 'obslugaJSON'], function ($, varGlobal, json) {
    'use strict';

    var intervalId,
        alarmy_old = 0,
        ostrzezenia_old = 0,

        sprawdzZmianyKomunikatow = function () {
            var accordionIndex,
                odswiezHistorie = false;

            accordionIndex = $("#accordion").accordion("option", "active", accordionIndex);
            if (accordionIndex === 3) { // sprawdzenie czy jest aktywny accordion z historia -> jesli tak, wywolanie odpowiednich procedur
                if (alarmy_old !== varGlobal.komunikaty.alarmy) {
                    alarmy_old = varGlobal.komunikaty.alarmy;
                    odswiezHistorie = true;
                }
                if (ostrzezenia_old !== varGlobal.komunikaty.ostrz) {
                    odswiezHistorie = true;
                    ostrzezenia_old = varGlobal.komunikaty.ostrz;
                }

                if (odswiezHistorie === true) {
                    odswiezHistorie = false;
                    json.wyslij(varGlobal.doWyslania.historia);
                }
            } else {
                clearInterval(intervalId); // zakonczenie pracy timera
            }
        },


        inicjacja = function (_daneHistorii) { // dane pobrane po wykonaniu rozkazu ajax z zapytaniem o historie
            var li,
                fragmentHtml = document.createDocumentFragment(),
                zeroWiodace = function (i) {
                    return (i < 10) ? '0' + i : i;
                };

            console.log('odswiezam historie');
            console.log(_daneHistorii);
            $('#listaHistoria').empty();

            $.each(_daneHistorii, function (index, value) {
                var data = new Date(),
                    tekstDaty = '',
                    nrWord,
                    nrBit,
                    idKomunikatu = '',
                    tekst = '';

                data.setTime(value.czas);
                tekstDaty = data.getUTCFullYear() + '/' + zeroWiodace(data.getUTCMonth() + 1) + '/' + zeroWiodace(data.getUTCDate()) + ' ' +
                    zeroWiodace(data.getUTCHours()) + ":" + zeroWiodace(data.getUTCMinutes()) + ":" + zeroWiodace(data.getUTCSeconds());

                nrWord = Math.floor(value.nr / 16);
                nrBit = value.nr % 16;

                if (varGlobal.tekstyKomunikatow[nrWord] !== undefined) { //  brak tekstu komunikatu w pliku komunikaty.json
                    tekst = tekstDaty + ' - ' + value.typ + ' - ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.kod + ' ' + value.nr + ' - ' + varGlobal.tekstyKomunikatow[nrWord].bity[nrBit].opis; //  + ' - Nr:' + value.nr +
                } else { //Blad tekstu komunikatu
                    tekst = tekstDaty + ' - ' + value.typ + ' - ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.kod + ' ' + value.nr + ' - ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.BladTekstu + ' word:' + nrWord + ' bit:' + nrBit;
                }

                idKomunikatu = 'komunikatKod' + index; //musi byc 'index' a nie 'value.nr' bo ten drugi moze sie powtarzac i moga wystapic te same id (rozjezdza sie wyswietlanie tooltipow itp)
                li = document.createElement("li");
                $(li)
                    .text(tekst)
                    .attr('id', idKomunikatu)
                    .addClass('ui-widget-content');
                //$('#listaHistoria').append(li);
                $(fragmentHtml).append(li);
            });
            $('#listaHistoria').append(fragmentHtml);

            intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                sprawdzZmianyKomunikatow();
            }, varGlobal.czasOdswiezania);
        };


    return {
        inicjacja: inicjacja
    };
});
