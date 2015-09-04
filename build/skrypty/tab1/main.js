/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

// Dodanie elementu na TAB 1 z ostatnim komunikatem / godzina
define(['jquery', 'zmienneGlobalne', 'dodajPojedynczaTabele', 'obslugaJSON', 'komunikaty/uaktualnijStatus'], function ($, varGlobal, dodajPojedynczaTabele, json, uaktualnijStatus) {
    "use strict";

    var zegarCzionka,


        stworzZegar = function () {
            var p,
                pasujaceObiekty = [],
                span;

            // ui-state-default    ui-state-highlight
            $('#tab1_komunikat')
                .removeClass('ui-state-error')
                .removeClass('ui-state-highlight')
                .addClass('ui-state-default')
                .empty();

            p = document.createElement('p');
            $(p)
                .attr('id', 'p_dataCzas')
                .text(varGlobal.data)
                .css({
                    'text-align': 'center',
                    'font-weight': 'bold',
                    'font-size': '3.7em', //4.0em
                    'margin': '0.1em'
                })
                .appendTo('#tab1_komunikat');
        },


        stworzOstatniKomunikat = function () {
            var p,
                klasaKomunikatu, // alarm czy ostrzezenie
                span;

            if (varGlobal.komunikaty.alarmy > 0) {
                klasaKomunikatu = 'ui-state-error';
            } else if (varGlobal.komunikaty.alarmy === 0 && varGlobal.komunikaty.ostrz > 0) {
                klasaKomunikatu = 'ui-state-highlight';
            } else {
                klasaKomunikatu = 'ui-state-highlight';
                //stworzZegar();
            }

            $('#tab1_komunikat')
                .removeClass('ui-state-default')
                .addClass(klasaKomunikatu)
                .empty();

            p = document.createElement('p'); // Tekst ostatniego komunikatu
            $(p)
                .attr('id', 'p_tekstAlarmu')
                .text('')
                .css({
                    'padding': '0.4em',
                    'margin': '1px',
                    'height': "50%",

                    'font-size': '1.1em',
                    'font-weight': 'bold'
                })
                .appendTo('#tab1_komunikat');

            p = document.createElement('p'); // liczba alarmow i ostrzezen
            $(p)
                .attr('id', 'p_liczbaAlarmow')
                .css({
                    'margin': '1px',
                    'padding': '1px',
                    'font-weight': 'normal'
                })
                .appendTo('#tab1_komunikat');

            p = document.createElement('p'); // Kontener na ikonki + opis z nawigacja
            $(p)
                .css({
                    'margin-top': '0.2em',
                    'font-weight': 'normal'
                })
                .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.tab1Nawi);
            span = document.createElement('span'); // Ikonka --> strzalka do gory
            $(span)
                .addClass('ui-icon')
                .addClass('ui-icon-circle-arrow-n')
                .css({
                    'float': 'left'
                })
                .appendTo(p);
            span = document.createElement('span'); // Ikonka --> strzalka na dol
            $(span)
                .addClass('ui-icon')
                .addClass('ui-icon-circle-arrow-s')
                .css({
                    'float': 'left'
                })
                .appendTo(p);
            $(p).appendTo('#tab1_komunikat');
        },


        inicjacja = function (_typKomb) {
            var d = new $.Deferred(), // wywolanie asynchroniczne
                fragmentHtml = document.createDocumentFragment(),
                divMain,
                p,
                span,
                wysokoscDivaGrafiki,
                div,
                ustawDivNaGrafike = function () {
                    wysokoscDivaGrafiki = ($('#tab1').height() - $('#tab1_info1').outerHeight() - $('#tab1_info2').outerHeight()) * 0.95;
                    divMain = document.createElement('div'); // Trzeci glowny element - z grafika
                    $(divMain)
                        .attr('id', 'grafika')
                        .css({
                            'height': wysokoscDivaGrafiki
                        })
                        .addClass('ui-corner-all');
                    $('#tab1').append(divMain);

                    stworzZegar();
                    if ($("#grafika").length > 0) {
                        d.resolve(true); // wywolanie asynchroniczne - jesli ostatni element zostal zaladowany -> zwroc true
                    }
                };

            // stworzenie szkieletu tabu 1
            divMain = document.createElement('div'); // Pierwszy z trzech glownych
            $(divMain)
                .attr('id', 'tab1_info1')
                .css({})
                .addClass('ui-corner-all');
            div = document.createElement('div'); // ostatni aktywny komunikat / data i godzina
            $(div)
                .attr('id', 'tab1_komunikat')
                .css({})
                .addClass('ui-corner-all')
                .appendTo(divMain);


            div = document.createElement('div'); // statusy glowne (alarmy, typ obudowy LP, miejsce sterowania itp
            $(div)
                .attr('id', 'tab1_statusy')
                .css({})
                .addClass('ui-corner-all')
                .appendTo(divMain);
            $(fragmentHtml).append(divMain);

            divMain = document.createElement('div'); // Drugi z trzzech glownych
            $(divMain)
                .attr('id', 'tab1_info2')
                .css({
                    'height': 'auto'
                })
                .addClass('ui-corner-all');
            div = document.createElement('div'); // dwa statusy z lewej strony (plukanie filtra)
            $(div)
                .attr('id', 'tab1_dol1')
                .addClass('ui-corner-all')
                .appendTo(divMain);
            div = document.createElement('div'); // srodkowy status (wyswietlanie kierunku posuwu, predkosci itp)
            $(div)
                .attr('id', 'tab1_dol2')
                .addClass('ui-corner-all')
                .appendTo(divMain);
            div = document.createElement('div'); // dwa statusy z lewej strony (rezystancja izolacji)
            $(div)
                .attr('id', 'tab1_dol3')
                .addClass('ui-corner-all')
                .appendTo(divMain);
            $(fragmentHtml).append(divMain);
            $('#tab1').append(fragmentHtml);

            switch (_typKomb) {
            case varGlobal.identyfikatorKombajnu.ktw:
                require(['tab1/statusyKTW'], function (statusyKTW) {
                    statusyKTW.inicjacja(); // dodanie wszystkich elementow zeby pomierzyc pozostala czesc na grafike
                    ustawDivNaGrafike();
                });
                break;
            case varGlobal.identyfikatorKombajnu.gul:
                require(['tab1/statusyGUL'], function (statusyGUL) {
                    statusyGUL.inicjacja();
                    ustawDivNaGrafike();
                });
                break;
            case varGlobal.identyfikatorKombajnu.wow:
                require(['tab1/statusyWOW'], function (statusyWOW) {
                    statusyWOW.inicjacja();
                    ustawDivNaGrafike();
                });
                break;
            }

            return d.promise();
        };

    return {
        inicjacja: inicjacja,
        stworzZegar: stworzZegar,
        stworzOstatniKomunikat: stworzOstatniKomunikat
    };

});