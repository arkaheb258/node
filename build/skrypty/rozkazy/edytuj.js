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


    var init = false,
        znalezionyRozkaz,
        idDialog = "#DialogEdycjaRozkazu",
        idSplit = [],

        zamknij = function () {
            var vKeyboard;

            vKeyboard = $('#keyboard').keyboard().getkeyboard();
            if (vKeyboard !== undefined) { // null
                if (vKeyboard.isVisible()) {
                    vKeyboard.close();
                    vKeyboard.destroy();
                }
            }

            $(idDialog).empty();
            $(idDialog).remove();
            $('#menuRozkazy').addClass("kopex-selected");
        },


        wyslijpBrak = function () {

            setTimeout(function () {
                zamknij();
            }, 500);

            if (znalezionyRozkaz.rozkaz.ioEmit !== undefined) {
                require(['kommTCP'], function (kommTCP) {
                    kommTCP.rozkazSIO(znalezionyRozkaz.rozkaz);
                });
            } else {
                require(['progresBar'], function (progresBar) {
                    progresBar.inicjacja({
                        show: true,
                        status: 'sending'
                    });
                });
                json.wyslij(znalezionyRozkaz.rozkaz);
                console.log(znalezionyRozkaz.rozkaz);
            }
        },

        
        wyslijpLiczba = function (wprowadzonaLiczba) {
            var vKeyboard,
                zezwolenieDoWyslania = false;

            console.log(wprowadzonaLiczba);
            vKeyboard = $('#keyboard').keyboard().getkeyboard();
            if (isNaN(wprowadzonaLiczba)) { //wprowadzona wartosc nie jest cyfra... (ktos moze wpisac przypadkowo dwa przecinki itp)
                zezwolenieDoWyslania = false;
            } else { // Jesli wprowadzona wartosc jest cyfra
                wprowadzonaLiczba = Number(wprowadzonaLiczba).toFixed(znalezionyRozkaz.PREC); // Jesli uzytkownik wpisal wiecej cyfr po przecinku niz dozwolona precyzja -> zaokraglenie
                wprowadzonaLiczba = Number(wprowadzonaLiczba); // toFixed zwraca zmienna typu string...
                if ((wprowadzonaLiczba < znalezionyRozkaz.MIN) || (wprowadzonaLiczba > znalezionyRozkaz.MAX)) { // liczba nie jest w odpowiednim zakresie
                    zezwolenieDoWyslania = false;
                } else {
                    zezwolenieDoWyslania = true;
                }
            }

            if (zezwolenieDoWyslania) {
                if (znalezionyRozkaz.rozkaz.pozycja !== undefined) { // wyslanie pozycji do kalibracji
                    znalezionyRozkaz.rozkaz.pozycja = wprowadzonaLiczba; // przepisanie wpsanej wartosci w pole do wyslania do plc1
                }
                if (znalezionyRozkaz.rozkaz.wWartosc !== undefined) { // wyslanie nowej wartosci licznika
                    znalezionyRozkaz.rozkaz.wWartosc = wprowadzonaLiczba; // przepisanie wpsanej wartosci w pole do wyslania do plc1
                }

                vKeyboard.close();
                vKeyboard.destroy();
                require(['progresBar'], function (progresBar) {
                    progresBar.inicjacja({
                        show: true,
                        status: 'sending'
                    });
                });
                setTimeout(function () {
                    zamknij();
                }, 500);
                json.wyslij(znalezionyRozkaz.rozkaz);
            } else {
                //console.log('zla wartosc');
                setTimeout(function () {
                    vKeyboard.$el.val(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramZlaWartosc); // Informacja o zlej wartosci
                    setTimeout(function () {
                        vKeyboard.$el.val(''); // Wyczyszczenie poprzedniej wpisanej wartosci
                    }, 1500);
                }, 200);
            }
            console.log(znalezionyRozkaz.rozkaz);
        },


        przechwycZdarzenia = function () { // Po wscisnieciu klawisza ACCEPT na klawiaturze - pobranie wpisanej wartosci
            $('#keyboard').bind('canceled.keyboard', function (e, keyboard, el) {

                setTimeout(function () {
                    zamknij();
                }, 500);
                //zamknij();
            });

            $('#keyboard').bind('accepted.keyboard', function (e, keyboard, el) {
                wyslijpLiczba(el.value);
            });
        },


        otworzDialog = function () { // otwarcie okienka z edycja
            var div,
                tekst,
                p;

            div = document.createElement("div");
            $(div)
                .addClass('OknaDialog')
                .attr('id', 'DialogEdycjaRozkazu');
            $('body').append(div);

            $("#DialogEdycjaRozkazu").dialog({
                autoOpen: false,
                modal: true,
                closeOnEscape: false,
                width: '55%',
                height: ($(document).height() / 1.75),
                title: znalezionyRozkaz.OPIS,
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


            $('#menuRozkazy').removeClass("kopex-selected");

            if (znalezionyRozkaz.MIN === undefined) { // dla wprowadzania liczb stworz klawiature
                $("#DialogEdycjaRozkazu").addClass("kopex-selected");
                $("#DialogEdycjaRozkazu").dialog("option", "height", 'auto');

                //                if (znalezionyRozkaz.OPIS2 !== undefined) {
                //                    tekst = znalezionyRozkaz.OPIS2.replace(/\n/g, "<br>");
                //                } else {
                //                    tekst = varGlobal.danePlikuKonfiguracyjnego.ROZKAZY[idSplit[0]].OPIS + ' - ' + znalezionyRozkaz.OPIS;
                //                }

                if (znalezionyRozkaz.id === 'ustawAntykolizje1') {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.ustawAntykolizje1;
                } else if (znalezionyRozkaz.id === 'ustawAntykolizje2') {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.ustawAntykolizje2;
                } else {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.ROZKAZY[idSplit[0]].OPIS + ' - ' + znalezionyRozkaz.OPIS;
                }

                p = document.createElement('p');
                $(p)
                    .attr('id', 'pParametrOpis')
                    .html(tekst)
                    .css({
                        'padding': '0.4em',
                        'border': '0.1em solid',
                        'border-color': 'grey',
                        'font-style': 'italic',
                        'font-size': '1.2em',
                        'text-align': 'center',
                        'border-radius': '0.5em',
                        'width': '95%'
                    });
                $("#DialogEdycjaRozkazu").append(p);
            } else {
                require(['wspolne/dodajKlawiature'], function (dodajKlawiature) {
                    znalezionyRozkaz.TYP = 'pLiczba'; // dodanie pola TYP potrzebne do wygenerowania odpowiedniej klawiatury (w pliku excela konfiguracja.xlsm nie chce dodawac calej nowej kolumny tylko dla rozkazow)
                    dodajKlawiature.inicjacja(znalezionyRozkaz, 'DialogEdycjaRozkazu');
                    przechwycZdarzenia();
                });
            }
            $("#DialogEdycjaRozkazu").dialog("open");
        },


        inicjacja = function () {
            $("#menuRozkazy").one("menuselect", function (event, ui) { // menuselect    menufocus
                var idParametru = ui.item.attr('id');

                idSplit = idParametru.split('__'); // id ma postac "2__1" -> czyli bedzie to obiekt z tablicy o indexie 2 i podtablicy "zawartoc" o indexie 1
                event.preventDefault();
                if (ui.item.hasClass('ui-state-disabled')) {
                    $('#menuRozkazy').menu("next"); // Jesli ktos wcisnal Enter na elemencie nieaktywnym to przejscie do nastepnego
                    return;
                }

                znalezionyRozkaz = varGlobal.danePlikuKonfiguracyjnego.ROZKAZY[idSplit[0]].zawartosc[idSplit[1]];
                otworzDialog();
            });
        };

    return {
        inicjacja: inicjacja,
        zamknij: zamknij,
        wyslijpBrak: wyslijpBrak
    };

});