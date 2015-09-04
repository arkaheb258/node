/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'progresBar'], function ($, varGlobal, json, progresBar) {
    "use strict";

    var idButtonPowrot,
        idDialog = '#DialogDataCzas',


        zamknij = function () {
            $("#DialogDataCzas").empty();
            $("#DialogDataCzas").dialog('close');
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button parametrow
        },


        wyslijDoPLC = function () {
            var wartoscTekstowa,
                nowaDataPLC,
                nowaData = new Date(); // epoch

            console.log('wysylam czas - funkcja wyslijDoPLC  ');

            wartoscTekstowa = $('#altDateEntry').val();
            nowaData = Date.parse(wartoscTekstowa); // data epoch - ja wysylam Arkowi taka jaka wpisal uzytkownik -> serwer www przerabia przesuniecia za pomoca dwoch parametrow

            varGlobal.trwaZmianaCzasu = false;
            zamknij();
            progresBar.inicjacja({
                show: true,
                status: 'sending'
            });

            varGlobal.doWyslania.czas.wartosc = nowaData;
            json.wyslij(varGlobal.doWyslania.czas);
            console.log(varGlobal.doWyslania.czas);
        },


        otworz = function () {
            var p,
                kolor,
                kolor2,
                div,
                e = jQuery.Event("keydown"),
                input;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", "")); //idDialog.replace("#", ""))            dialogWymianaPLC
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() / 3),
                    width: '55%',
                    title: $(idButtonPowrot).text(),
                    show: {
                        delay: 200,
                        effect: varGlobal.efektShowHide, // shake  bounce  pulsate
                        duration: 350
                    },
                    hide: {
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    buttons: [
                        {
                            disabled: true,
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zatwierdz
                        },
                        {
                            disabled: true,
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
                        }
                    ]
                });

                $(idDialog).dialog("open");

                p = document.createElement('p');
                $(p)
                    .css({
                        'position': 'relative',
                        'top': '15%'
                    });
                input = document.createElement('input');
                //kolor = $('.ui-widget-content').css('background');
                kolor = 'DimGray';
                $(input)
                    .attr('id', 'dateEntry')
                    .attr('name', 'value')
                    .css({
                        'font-size': '1.2em',
                        'text-align': 'center',
                        'border': '0.0em',
                        'background': kolor,
                        'color': 'inherit',
                        'width': '25em'
                    });

                $(p).append(input);
                $("#DialogDataCzas").append(p);

                input = document.createElement('input'); // Stworzenie ukrytej kontrolki ze sformatowana data (lepsza dla sterownika, bez wyrazow itp)
                $(input)
                    .attr('id', 'altDateEntry')
                    .attr('disabled', 'disabled');
                $("#DialogDataCzas").append(input);
                $('#altDateEntry').hide();

                $("#dateEntry").datetimeEntry({
                    datetimeFormat: 'D/O/Y H:M', //'D/O/Y H:M'    'W N Y H:M'
                    initialField: 0,
                    spinnerSize: [0, 0, 0], // Pozbycie sie defaultowego obrazka z ikonkami nawigacyjnymi
                    altField: '#altDateEntry',
                    altFormat: 'Y-O-DTH:M:S', //D/O/Y H:M'
                    //altFormat: 'Y,O,D,H,M,S', //D/O/Y H:M'
                    spinnerImage: 'obrazki/spinnerDefault.png' //
                });

                require(['kommTCP'], function (kommTCP) { // ustawieni aktualnej daty ze sterownika jako startowej
                    //console.log(kommTCP.daneTCP.timeStamp_js);
                    var data = new Date(); //"October 13, 1975 11:13:00"
                    //data.setTime(kommTCP.daneTCP.timeStamp_js);
                    data.setTime(kommTCP.daneTCP.timeStamp_js - 24 * 60 * 60 * 1000); // kontrolka dodaje nie wiadomo dlaczego 
                    console.log(data);
                    $("#dateEntry").datetimeEntry('setDatetime', data);
                });

                $("#dateEntry").addClass("kopex-selected");
                setTimeout(function () { // Wyswietlenie daty zaraz po otwarciu kontrolki (normalnie jest puste pole)
                    e.keyCode = $.ui.keyCode.UP;
                    $("#dateEntry").trigger(e);
                }, 400);
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });
        },


        inicjacja = function (idButtona) {
            idButtonPowrot = '#' + idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });

            require(['dataCzas/odswiezaj'], function (odswiezaj) { // inicjacja odświeżania danych
                odswiezaj.inicjacja();
            });
        };


    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        wyslijDoPLC: wyslijDoPLC
    };

});