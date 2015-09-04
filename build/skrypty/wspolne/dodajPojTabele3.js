/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define */


define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var config = {},


        nowaKomorka_opis = function (_obiekt) {
            var td = document.createElement("td"),
                plc_id,
                opis;

            if (config.advDiagn) {
                plc_id = _obiekt.PLCID || '';
                opis = _obiekt.OPIS[varGlobal.wersjaJezykowa] || '';
            } else {
                plc_id = _obiekt.plc_id || ''; // jeśli brak opisu - wstaw pusty string (inaczej wyświetli sie tekst UNDEFINED)
                opis = _obiekt.opis_pelny || '';
            }

            $(td)
                .text(plc_id + " " + opis)
                .addClass(config.cssDescription)
                .addClass(config.background)
                .addClass('ui-corner-all')
                .css({
                    'text-align': 'left',
                    'letter-spacing': '0',
                    'font-weight': 'normal'
                });
            return td;
        },


        nowaKomorka_wartosc = function (_obiekt) {
            var tekst,
                td = document.createElement("td");

            if (config.advDiagn) {
                if ((_obiekt.TYPWEWY === 'AN') || (_obiekt.TYPWEWY === 'NAM')) {
                    tekst = '---';
                } else {
                    tekst = _obiekt.TYPWEWY;
                }
            } else {
                tekst = _obiekt.jednostka || '';
            }

            $(td)
                .text(tekst)
                .addClass(config.cssValue)
                .addClass(config.background)
                .addClass('ui-corner-all')
                .attr('id', _obiekt.id)
                .css({
                    'text-align': 'center',
                    'letter-spacing': '0',
                    'font-weight': 'normal'
                });
            return td;
        },


        dodaj = function (_config) { // Dodanie pojedynczej tabeli do wskazanego diva
            var i,
                table,
                tr;

            // KONFIGURACJA
            config = {
                objects: _config.objects, // tablica z obiektami, które mają być wstawione do tabeli               
                id: _config.id,  // id elementu html do którego ma być wstawiona tablica
                background: _config.background || "",  // typ tla jaki ma miec dana komórka, tak naprawdę odpowiednia klasa jquery
                cssDescription: _config.cssDescription || 'tdOpisTabPoj', // podanie nazwy klasy css jaka ma być nadana komórce z opisem zmiennej                
                cssValue: _config.cssValue || 'tdWartoscTabPoj', // podanie nazwy klasy css jaka ma być nadana komórce z wartością
                advDiagn: _config.advDiagn || false // czy to tabela z sygnałami diagnostyki zaawansowanej, obiekty jsona mają inne pola niż moje
            };
            //console.log(config);

            table = document.createElement('table');
            $(table)
                .addClass('tabelaPojedyn')
                .css({
                    'margin': '0',
                    'padding': '0'
                });

            $.each(config.objects, function (key, val) { // pasujaceObiekty     daneWejKolejne
                if (val !== undefined) {
                    tr = document.createElement('tr');
                    $(tr).append(nowaKomorka_opis(val)); // Dodanie komorki z opisem zmiennej
                    $(tr).append(nowaKomorka_wartosc(val)); // Dodanie komorki z wartoscia zmiennej zmiennej
                    $(table).append(tr);
                }
            });

            $(config.id).append(table);
            config = null; // wyczyszczenie pamięci;
        };

    return { // Metody publiczne
        dodaj: dodaj
    };
});