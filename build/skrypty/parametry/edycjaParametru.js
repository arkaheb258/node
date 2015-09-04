/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'keyboard', 'keyboardNav', 'obslugaJSON'], function ($, varGlobal, keyboard, keyboardNav, json) {
    "use strict";

    var id,
        wartoscParametru,
        idDialog = "#DialogEdycjaParametru",
        obiekt2,

        zamknijKlawiature = function () {
            var vKeyboard;

            vKeyboard = $('#keyboard').keyboard().getkeyboard();
            if (vKeyboard !== undefined) {
                if (vKeyboard.isVisible()) {
                    vKeyboard.close();
                    vKeyboard.destroy();
                }
            }
            $("#DialogEdycjaParametru").empty();
            $("#DialogEdycjaParametru").dialog('close');
            $('#menu').addClass("kopex-selected");
        },


        wyslijReaDolPLC = function () {
            var vKeyboard,
                precyzja,
                zezwolenieDoWyslania = false,
                isInt = function (n) { // funkcja sprawdzająca czy liczba jest int czy float -> sprawdzenie czy po podzieleniu przez 1 pozostaje jakaś reszta
                    var czyInt;
                    if (n % 1 === 0) { // int
                        czyInt = true;
                    } else { // float
                        czyInt = false;
                    }
                    return czyInt;
                };

            vKeyboard = $('#keyboard').keyboard().getkeyboard();
            // czas jest zawsze podawany przez użytkownika w sekundach a wysyłany do sterownika (przez Arka) w milisekundach -> musi być ustawiona precyzja na 3 dla wszystkich parametrów czasu
            if ((obiekt2.TYP === 'pLiczba') || (obiekt2.TYP === 'pCzas')) { // Wstepne sprawdzenie poprawnosci wprowadzonych danych
                if (isNaN(wartoscParametru)) { //wprowadzona wartosc nie jest cyfra... (ktos moze wpisac przypadkowo dwa przecinki itp)
                    zezwolenieDoWyslania = false;
                } else { // Jesli wprowadzona wartosc jest cyfra
                    if (isInt(wartoscParametru)) { // sprawdzenie czy liczba jest intem czy float (jeśli ktoś wprowadzi np 5.0 to javascript przerobi to na zwykłe 5)
                        precyzja = obiekt2.PREC;
                    } else {
                        precyzja = wartoscParametru.toString().split('.')[1].length;
                    }

                    if (precyzja <= obiekt2.PREC) { // sprawdzenie precyzji wpisanego parametru
                        //wartoscParametru = Number(wartoscParametru); // toFixed zwraca zmienna typu string...
                        if ((wartoscParametru < obiekt2.MIN) || (wartoscParametru > obiekt2.MAX)) { // liczba nie jest w odpowiednim zakresie
                            zezwolenieDoWyslania = false;
                        } else {
                            zezwolenieDoWyslania = true;
                        }
                    } else { // zła precyzja
                        zezwolenieDoWyslania = false;
                    }
                }
            } else { // wpisywana jest wartosc typu string
                zezwolenieDoWyslania = true;
            }


            if (zezwolenieDoWyslania) {
                varGlobal.doWyslania.parametr.id = id;
                varGlobal.doWyslania.parametr.wartosc = wartoscParametru;

                vKeyboard.close();
                vKeyboard.destroy();
                zamknijKlawiature();

                require(['progresBar'], function (progresBar) {
                    progresBar.inicjacja({
                        show: true,
                        status: 'sending'
                    });
                });

                json.wyslij(varGlobal.doWyslania.parametr);
                console.log(varGlobal.doWyslania.parametr);
            } else {
                setTimeout(function () {
                    vKeyboard.$el.val(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramZlaWartosc); // Informacja o zlej wartosci
                    setTimeout(function () {
                        vKeyboard.$el.val('').focus(); // Wyczyszczenie poprzedniej wpisanej wartosci
                    }, 1500);
                }, 200);
            }
        },

        wyslijListeDoPLC = function (_wart) {
            var zezwolenie = true;

            varGlobal.doWyslania.parametr.id = id;
            varGlobal.doWyslania.parametr.wartosc = _wart;

            //            console.log(varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.LISTA[4]);
            //            if (varGlobal.zmienianyParametr.id === 'rKonfWersjaJezykowa') { // dodatkowe zabezpieczenie na parametr z wyborem języka
            //                if (varGlobal.aktywneJezyki[_wart] === false) { // nie ma plikow jsona z ta wersja jezykowa!
            //                    zezwolenie = false;
            //                    require(['alert'], function (alert) {
            //                        alert.inicjacja({
            //                            texts: [varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramZlaWartosc],
            //                            background: 'ui-state-default',
            //                            timer: 5000,
            //                            escConfirm: true
            //                        });
            //                    });
            //                }
            //            }

            //if (zezwolenie) {
            require(['progresBar'], function (progresBar) {
                progresBar.inicjacja({
                    show: true,
                    status: 'sending'
                });
            });
            zamknijKlawiature();
            json.wyslij(varGlobal.doWyslania.parametr);
            console.log(varGlobal.doWyslania.parametr);
            //}
        },


        przechwycZdarzenia = function () { // Po wscisnieciu klawisza ACCEPT na klawiaturze - pobranie wpisanej wartosci
            $('#keyboard').bind('canceled.keyboard', function (e, keyboard, el) {
                zamknijKlawiature();
            });

            $('#keyboard').bind('accepted.keyboard', function (e, keyboard, el) {

                if (obiekt2.TYP === 'pString') {
                    wartoscParametru = el.value;
                } else if ((obiekt2.TYP === 'pLiczba') || (obiekt2.TYP === 'pCzas')) {
                    wartoscParametru = Number(el.value);
                }

                wyslijReaDolPLC();
            });
        },


        dodajObslugeListy = function () { //obiekt
            var p,
                znalezionyObiekt,
                label,
                input,
                button;

            p = document.createElement('p');
            $(p)
                .css({
                    'position': 'relative',
                    'top': '25%'
                });
            label = document.createElement('label');
            input = document.createElement('input');
            $(label).attr('for', 'spinner');
            $(p).append(label);
            $(input)
                .attr('id', 'spinner')
                .attr('name', 'value')
                .css({
                    'font-size': '1.5em',
                    'text-align': 'center',
                    'width': '20em'
                });
            $(p).append(input);
            $("#DialogEdycjaParametru").append(p);

            $("#DialogEdycjaParametru").dialog({
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

            $("#spinner").formatSpinner({ // Przewijanie po tablicy z pozycju WART parametru
                values: obiekt2.LISTA,
                count: obiekt2.LISTA.length
            });
            $('#spinner').addClass("kopex-selected").addClass("kopex-selected").formatSpinner("stepUp"); // .focus()
        },

        stworzDialog = function () {
            var div,
                p,
                tytul,
                aktualnaWartosc,
                nazwaDialog;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", "")); //idDialog.replace("#", ""))            dialogWymianaPLC
                $('body').append(div);

                tytul = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.parametr + ' ' + obiekt2.ID;
                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() / 1.5),
                    width: '65%',
                    hide: {
                        delay: 200,
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    title: tytul
                });
                $(idDialog).dialog("open");

                p = document.createElement('p');
                $(p)
                    .attr('id', 'pParametrOpis')
                    .text(obiekt2.OPIS)
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
                $("#DialogEdycjaParametru").append(p);

                if (obiekt2.TYP === 'pLista') {
                    aktualnaWartosc = ' = ' + obiekt2.LISTA[obiekt2.WART]; // wczytanie wartosci z listy
                } else {
                    aktualnaWartosc = ' = ' + obiekt2.WART;
                }
                p = document.createElement('p'); // Wyswietlenie aktualnie ustawionej wartosci
                $(p)
                    .attr('id', 'pAktualnaWartosc')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.wartAktualna + ' ' + aktualnaWartosc)
                    .css({
                        'letter-spacing': '0.1em',
                        'text-align': 'left',
                        'border-radius': '0.5em',
                        'width': '100%'
                    });
                $("#DialogEdycjaParametru").append(p);
                $('#menu').removeClass("kopex-selected");

                varGlobal.doWyslania.parametr.typ = obiekt2.TYP; // ustawienie typu parametru w razie wyslania wiadomosci do serwera
                switch (obiekt2.TYP) {
                case 'pLista':
                    dodajObslugeListy();
                    break;

                case 'pString':
                case 'pCzas':
                case 'pLiczba':
                    require(['wspolne/dodajKlawiature'], function (dodajKlawiature) {
                        dodajKlawiature.inicjacja(obiekt2, 'DialogEdycjaParametru');
                        przechwycZdarzenia(); //obiekt
                    });
                    break;

                default:
                }

            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                setTimeout(function () {
                    $(idDialog).remove();
                }, 500);
                //$(idDialog).remove();
            });

        },


        inicjacja = function (buttonId) { // Przeszukanie struktury parametrow i znalezienie tego wybranego z menu
            $("#menu").one("menuselect", function (event, ui) { // menuselect    menufocus
                var idParametru = ui.item.attr('id'),
                    podgrupa = ui.item.parent().parent(),
                    znalezionyObiekt,
                    grupaGlowna = podgrupa.parent().parent();

                id = idParametru;
                if (ui.item.hasClass('ui-state-disabled')) {
                    $('#menu').menu("next"); // Jesli ktos wcisnal Enter na elemencie nieaktywnym to przejscie do nastepnego
                    return;
                }
                varGlobal.zmienianyParametr.id = idParametru; // potrzebne do przeladowania nowej wartosci na liscie menu po otrzymaniu informacji ze zapisano parametr (obslugaJSON)
                $.each(varGlobal.parametry.DANE, function (key, val) {
                    if (key === grupaGlowna.attr('id')) {
                        varGlobal.zmienianyParametr.grupa = key; // zapamietanie sciezki dostepu do pozniejszejpodmiany wartosci na rozwijanel liscie menu ui
                        $.each(val, function (ke, va) {
                            if (ke === podgrupa.attr('id')) {
                                varGlobal.zmienianyParametr.podgrupa = ke;
                                $.each(va, function (k, v) {
                                    if (k === idParametru) {
                                        znalezionyObiekt = v;
                                        varGlobal.zmienianyParametr.obiekt = znalezionyObiekt;
                                    }
                                });
                            }
                        });
                    }
                });
                if (znalezionyObiekt !== undefined) {
                    obiekt2 = znalezionyObiekt; // Przepisanie do zmiennej globalnej
                    stworzDialog(znalezionyObiekt); // Stworzenie okienka dialog z odpoeirdnim dla wybranego parametrem zestawieniem
                }
            });
        };

    return {
        inicjacja: inicjacja,
        zamknijKlawiature: zamknijKlawiature,
        wyslijReaDolPLC: wyslijReaDolPLC,
        wyslijListeDoPLC: wyslijListeDoPLC
    };
});