/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'komunikaty/liczbaDostepnych'], function ($, varGlobal, json, liczbaDostepnych) {
    "use strict";

    var zaznaczonyKomunikat, // Komunikat na ktory ma byc zalozona/zdjeta blokada
        zaznaczenie = [], // tablica po rozdzieleniu stringa z id zaznaczonego elemntu,
        idDialog = '#DialogBlokady',

        zamknij = function () {
            $("#DialogBlokady").empty();
            $('#DialogBlokady').dialog('close');
            $("#DialogBlokady").removeClass("kopex-selected");

            if ($("#PelnaListaKomm").dialog("isOpen")) {
                $("#PelnaListaKomm").addClass("kopex-selected");
            }
        },

        
        wyslij = function () {
            var blokady = liczbaDostepnych.inicjacja();

            // Sprawdzenie czy są dostpne wolne blokady w przypadku próby założenia nowej
            if ((blokady.dostepne <= 0) && (varGlobal.doWyslania.blokady.wartosc === 1)) {
                require(['komunikaty/popUpAlarm'], function (popUpAlarm) {
                    popUpAlarm.inicjacja(': ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakWolnychBlokad);
                });
                return;
            }

            json.wyslij(varGlobal.doWyslania.blokady);
            console.log(varGlobal.doWyslania.blokady);
            require(['progresBar'], function (progresBar) {
                progresBar.inicjacja({
                    show: true,
                    status: 'sending'
                });
            });

            zamknij();
            if ($("#PelnaListaKomm").length > 0) { // w przypadku operacji na pełnej liście komunikatów -> odświeżenie aktualnie wyświetlanego widoku
                require(['komunikatyPelnaLista/main'], function (pelnaLista) {
                    pelnaLista.odswiez();
                });
            }
        },
        stworzWiadomosc = function (komunikat, zal_wyl, _poziom) {
            if (_poziom === 'User2') {
                _poziom = 'User';
            }
            zaznaczenie = komunikat.attr('id').split("_"); //rozbicie id zaznaczonego elementu li: mesg_nr_bit_nr  --> np. mesg_0_bit_12 --> powstaje tablica [mesg, 0, bit, 12
            varGlobal.doWyslania.blokady.typ = "ustawBlokade";
            varGlobal.doWyslania.blokady.dostep = _poziom; // "Usr"; varGlobal.poziomDostepu
            varGlobal.doWyslania.blokady.slowo = zaznaczenie[1];
            varGlobal.doWyslania.blokady.bit = zaznaczenie[3];
            varGlobal.doWyslania.blokady.wartosc = zal_wyl;
            //console.log('stworzWiadomosc');
        },

        zalozBlokade = function () {
            $('#tekstZapytanie').text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.blokZaloz);
            stworzWiadomosc(zaznaczonyKomunikat, 1, varGlobal.poziomDostepu);
        },

        zdejmijBlokade = function (poziomZalozonejBlokady) {
            $('#tekstZapytanie').text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.blokZdejmij);
            stworzWiadomosc(zaznaczonyKomunikat, 0, poziomZalozonejBlokady);
        },

        otworzDialog = function (aktywnyAccordion) {
            var tytul,
                blokady,
                komenda,
                poziomBlokady,
                div,
                p;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", "")); //idDialog.replace("#", ""))            dialogWymianaPLC
                $('body').append(div);

                blokady = liczbaDostepnych.inicjacja();
                tytul = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDost + ': ' + varGlobal.poziomDostepu + ', ' +
                    varGlobal.danePlikuKonfiguracyjnego.TEKSTY.blokLiczbDost + ' ' + blokady.dostepne + '/' + blokady.max;
                zaznaczonyKomunikat = $('.ui-selected'); // Na ktory komunikat ma byc zalozona blokada

                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() / 2),
                    width: '50%',
                    title: tytul,
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
                $(idDialog).addClass("kopex-selected");

                p = document.createElement('p');
                $(p)
                    .attr('id', 'tekstZapytanie')
                    .css({
                        'position': 'relative',
                        'text-align': 'left',
                        'border-radius': '0.5em',
                        'letter-spacing': '0.0em',
                        'width': '100%'
                    });
                $("#DialogBlokady").append(p);

                p = document.createElement('p');
                $(p)
                    .attr('id', 'tekstKomunikatu')
                    .text(zaznaczonyKomunikat.text())
                    .css({
                        'position': 'relative',
                        'top': '15%',
                        'font-size': '1.5em',
                        'text-align': 'center',
                        'border-radius': '0.5em',
                        'letter-spacing': '0.0em',
                        'width': '100%'
                    });
                $("#DialogBlokady").append(p);

                if ($(zaznaczonyKomunikat).hasClass('User')) {
                    poziomBlokady = 'User';
                    komenda = 'zdejmij'; // specjalnie dla ekranu pelnej listy komunikatow
                } else if ($(zaznaczonyKomunikat).hasClass('Srvc')) {
                    poziomBlokady = 'Srvc';
                    komenda = 'zdejmij';
                } else if ($(zaznaczonyKomunikat).hasClass('Adv')) {
                    poziomBlokady = 'Adv';
                    komenda = 'zdejmij';
                } else {
                    komenda = 'zaloz';
                }

                if (aktywnyAccordion === "listaAlarmy") { // Zalozenie blokady
                    zalozBlokade();
                }
                if (aktywnyAccordion === "listaBlokady") { // Zdjecie blokady
                    zdejmijBlokade(poziomBlokady);
                }
                if (aktywnyAccordion === 'listaPelnaOLselectable') {
                    switch (komenda) {
                    case 'zaloz':
                        zalozBlokade();
                        break;

                    case 'zdejmij':
                        zdejmijBlokade(poziomBlokady);
                        break;
                    }
                }
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });



        };

    return {
        otworzDialog: otworzDialog,
        wyslij: wyslij,
        zamknij: zamknij
    };

});