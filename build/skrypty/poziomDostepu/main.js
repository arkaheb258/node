/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage */
/*jslint nomen: true*/
/*global  define */


define(['jquery', 'zmienneGlobalne', 'wspolne/dodajMenu2', 'poziomDostepu/odswiezaj'], function ($, varGlobal, dodajMenu2, odswiezPoziomDostepu) {
    'use strict';

    var selectedMemoryID,
        wpisanyKod,
        chcianyPoziomDostepu,
        poprawnyWynikUser,
        poprawnyWynikUser2,
        poprawnyWynikSrvc,
        poprawnyWynikAdv,
        idDialog = "#DialogPoziomDostepu",

        zamkniecieOkienka = function () {
            var vKeyboard;

            vKeyboard = $('#keyboard').keyboard().getkeyboard();
            //if (vKeyboard !== null) {
            if (vKeyboard !== undefined) {
                vKeyboard.close();
                vKeyboard.destroy();
            }
            $(idDialog).empty();
            $(idDialog).dialog('close');

            if (selectedMemoryID === 'accordion') {
                $('#' + selectedMemoryID).addClass("kopex-selected");
            } else if (selectedMemoryID === 'PelnaListaKomm') {
                $('#' + selectedMemoryID).addClass("kopex-selected");
            } else {
                //console.log(selectedMemoryID);
                $('#' + selectedMemoryID).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button parametrow
            }
        },

        generujLosowaLiczbe = function () {
            var dziesiatki,
                modulo,
                suma,
                rand1,
                rand2,
                rand3,
                rand4,
                cyfry,
                getRandomInt = function (min, max) {
                    return Math.floor(Math.random() * (max - min)) + min;
                };

            rand1 = getRandomInt(0, 9);
            rand2 = getRandomInt(0, 9);
            rand3 = getRandomInt(0, 9);
            rand4 = getRandomInt(0, 9);
            cyfry = rand1.toString() + rand2.toString() + rand3.toString() + rand4.toString();

            suma = rand1 + rand2 + rand3 + rand4;
            dziesiatki = Math.floor(suma / 10);
            modulo = (suma % 10);

            // Stworzenie poprawnych odpowiedzi do porownania
            poprawnyWynikUser = 1234;
            poprawnyWynikUser2 = suma * 2;
            poprawnyWynikSrvc = suma * 2 + 1;
            poprawnyWynikAdv = dziesiatki * 16 + modulo;
            console.log('2resu' + poprawnyWynikUser2 + 'cvrs' + poprawnyWynikSrvc + 'vda' + poprawnyWynikAdv);

            return cyfry;
        },


        ustawTimer = function () { // Ustawienie timera na 10 minut aby podtrzymywal ustawiony poziom dostepu
            var timeout = (varGlobal.czasPodtrzymania * 60 * 1000); // minuty

            if (varGlobal.czasPodtrzymania !== 'Brak') {
                setTimeout(function () {
                    odswiezPoziomDostepu.inicjacja('User');
                    console.log('Zdejmuje poziom dostepu: ' + varGlobal.poziomDostepu);
                }, timeout);
            }
        },


        wpisanoNiepoprawnyKod = function () {
            var nowyZestawCyfr,
                vKeyboard;

            vKeyboard = $('#keyboard').keyboard().getkeyboard();
            $('#pLiczbaLosowa')
                .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDostKodNOK)
                .css({
                    'backgroundColor': 'red',
                    'opacity': '0.8',
                    'letter-spacing': '0'
                });

            //$('#keyboard').focus();
            setTimeout(function () {
                nowyZestawCyfr = generujLosowaLiczbe();
                $('#pLiczbaLosowa')
                    .text(nowyZestawCyfr)
                    .css({
                        'backgroundColor': '',
                        'letter-spacing': '0.5em'
                    });
                vKeyboard.$el.val(''); // Wyczyszczenie poprzedniej wpisanej wartosci

                $('#keyboard').focus();
            }, 1500);
        },

        wpisanoPoprawnyKod = function () {
            var tekst;

            if (varGlobal.czasPodtrzymania === 'Brak') {
                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.OK;
            }
            //else { // wartosc liczbowa
            //tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.OK + ' - ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDostKodCzasPodtrz + ' ' + varGlobal.czasPodtrzymania.toString() + ' ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDostMinuty;
            //}

            $('#pLiczbaLosowa')
                .text(tekst)
                .css({
                    'backgroundColor': 'green',
                    'opacity': '0.8',
                    'letter-spacing': '0'
                });
            setTimeout(function () {
                zamkniecieOkienka();
            }, 1500);
        },


        przechwycZdarzenia = function () {
            $('#keyboard').bind('canceled.keyboard', function (e, keyboard, el) {
                //console.log('zdarzenie cancelled');
                zamkniecieOkienka();
            });
            $('#keyboard').bind('accepted.keyboard', function (e, keyboard, el) { // Sprawdzenie poprawnosci wpisanego kodu
                wpisanyKod = el.value;

                switch (chcianyPoziomDostepu) {
                case 'User':
                    if (poprawnyWynikUser === parseInt(wpisanyKod, 10)) { // 10 to parametr radix - system liczb dziesietnych
                        odswiezPoziomDostepu.inicjacja('User');
                        wpisanoPoprawnyKod();
                        ustawTimer(); // Podtrzymanie ustawionego poziomu dostepu przez okreslony czas
                    } else {
                        wpisanoNiepoprawnyKod();
                    }
                    break;

                case 'User2':
                    if (poprawnyWynikUser2 === parseInt(wpisanyKod, 10)) { // 10 to parametr radix - system liczb dziesietnych
                        odswiezPoziomDostepu.inicjacja('User2');
                        wpisanoPoprawnyKod();
                        ustawTimer(); // Podtrzymanie ustawionego poziomu dostepu przez okreslony czas
                    } else {
                        wpisanoNiepoprawnyKod();
                    }
                    break;


                case 'Srvc':
                    if (poprawnyWynikSrvc === parseInt(wpisanyKod, 10)) {
                        odswiezPoziomDostepu.inicjacja('Srvc');
                        wpisanoPoprawnyKod();
                        ustawTimer();
                    } else {
                        wpisanoNiepoprawnyKod();
                    }
                    break;

                case 'Adv':
                    if (poprawnyWynikAdv === parseInt(wpisanyKod, 10)) {
                        odswiezPoziomDostepu.inicjacja('Adv');
                        wpisanoPoprawnyKod();
                        ustawTimer();
                    } else {
                        wpisanoNiepoprawnyKod();
                    }
                    break;
                }
            });
        },

        //        poziomDostepuAktywny = function () {
        //            $('#pLiczbaLosowa')
        //                .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDostKodAktywny)
        //                .css({
        //                    'position': 'relative',
        //                    'top': '25%',
        //                    'letter-spacing': '0'
        //                });
        //            setTimeout(function () {
        //                zamkniecieOkienka();
        //            }, 1500);
        //        },

        otworzKlawiature = function (poziom) {
            var input,
                tytul,
                p,
                losowaLiczba,
                layoutKlawiatury,
                tekstPoziomdost,
                layoutCustArray = [],
                tytulButtona;

            if (poziom === 'wyloguj') { // wylogowanie uzytkownika
                tytulButtona = $('#wyloguj').text();
                $('#wyloguj').addClass('ui-state-error');
                $('#wyloguj').button("option", "label", varGlobal.danePlikuKonfiguracyjnego.TEKSTY.wylogowano);
                setTimeout(function () {
                    $('#wyloguj').removeClass('ui-state-error');
                    $('#wyloguj').button("option", "label", tytulButtona);
                    $('#wyloguj').addClass("kopex-selected").addClass(varGlobal.ui_state);
                }, 1000);
                odswiezPoziomDostepu.inicjacja('User');
                
                tekstPoziomdost = odswiezPoziomDostepu.inicjacja(varGlobal.poziomDostepu);
                tytul = varGlobal.danePlikuKonfiguracyjnego.MENU_POZ_DOST[0].OPIS + '. ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.wartAktualna + ': ' + tekstPoziomdost;
                $(idDialog).dialog("option", "title", tytul);
                return; // wyjscie z procedury
            }

            chcianyPoziomDostepu = poziom; // Przepisanie do zmiennej globalnej (w tym module) zadanego przez uzytkownika poziomu dostepu

            tytul = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDostTytul; // + ': ' + poziom;
            $(idDialog).empty();
            $(idDialog).dialog("option", "title", tytul); // varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDostTytul
            $(idDialog).dialog("open");

            losowaLiczba = generujLosowaLiczbe();

            p = document.createElement('p');
            $(p)
                .attr('id', 'pLiczbaLosowa')
                .addClass('ui-corner-all')
                .text(losowaLiczba)
                .css({
                    'font-size': '1.2em',
                    'text-align': 'center',
                    'letter-spacing': '0.5em',
                    'width': '100%'
                });
            $("#DialogPoziomDostepu").append(p);

            //            if (varGlobal.poziomDostepu === poziom) { // Sprawdzenie czy zadany poziom dostepu nie jest juz aktywny
            //                poziomDostepuAktywny(); // Poinformowanie o aktywnym poziomie i wyjscie z funkcji (nie tworzenie klawiatury)
            //                return;
            //            }

            input = document.createElement('input'); // Dynamiczne dodanie elementow skladajacych sie na klawiature            // text
            $(input)
                .attr('id', 'keyboard')
                .attr('type', 'password')
                .addClass('keyboardNaviPozDost')
                .css({
                    'font-size': '1.5em',
                    'text-align': 'center',
                    'width': '15em'
                });
            $(idDialog).append(input);

            $('#keyboard')
                .keyboard({
                    alwaysOpen: true, // if true, the keyboard will always be visible
                    stayOpen: true, // if true, keyboard will remain open even if the input loses focus.
                    layout: 'custom',
                    usePreview: false, // preview added above keyboard if true, original input/textarea used if false
                    initialFocus: false, // give the preview initial focus when the keyboard becomes visible
                    customLayout: {
                        //'default': [' 5 6 7 8 9', '0 1 2 3 4', '{bksp} {accept} {cancel}']
                        'default': ['6 7 8 9', '2 3 4 5', '0 1 {bksp} ', '{accept} {cancel}']
                    }
                })
                .addNavigation({
                    position: [0, 0], // set start position [row-number, key-index]
                    toggleMode: true, // true = navigate the virtual keyboard, false = navigate in input/textarea
                    focusClass: 'hasFocus' // css class added when toggle mode is on
                });
            $('#keyboard').addClass("kopex-selected").focus();
            przechwycZdarzenia();
        },


        otworzMenu = function () {
            var div,
                selected,
                tekstPoziomdost,
                tytul,
                fragMenu2;


            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje

                //console.log('otwieram dialog');

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);
                
                tekstPoziomdost = odswiezPoziomDostepu.inicjacja(varGlobal.poziomDostepu);
                tytul = varGlobal.danePlikuKonfiguracyjnego.MENU_POZ_DOST[0].OPIS + '. ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.wartAktualna + ': ' + tekstPoziomdost;
                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() / 2),
                    width: '60%',
                    title: tytul,
                    show: {
                        delay: 200,
                        effect: varGlobal.efektShowHide, // shake  bounce  pulsate
                        duration: 350
                    },
                    hide: {
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    }
                });

                selectedMemoryID = $('.kopex-selected').attr('id'); // Zapamietanie skad nastapilo zapytanie o poziom dostepu
                $('#' + selectedMemoryID).removeClass("kopex-selected").removeClass(varGlobal.ui_state); // Usuniecie znacznika nawigacji z klawiatury

                $(idDialog).dialog("open");
                fragMenu2 = dodajMenu2.dodajElementyHtml(varGlobal.danePlikuKonfiguracyjnego.MENU_POZ_DOST[0].zawartosc, 'przyciskMenuPoziomDost');
                $(idDialog).append(fragMenu2);
                $("button").button(); // Nadanie stylu jquery
                $(idDialog).children().first().addClass("kopex-selected").addClass(varGlobal.ui_state); // Skierowanie nawigacji z klawiatury na nowo stworzone elementy submenu
                dodajMenu2.allignVertical(idDialog); // wyrównanie buttonów w osi Y

            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                setTimeout(function () {
                    $(idDialog).remove();
                }, 500);
            });
        },

        inicjacja = function () {
            $(".pozDost").on("click", function (event, ui) {
                //console.log('otworzMenu');
                otworzMenu(); // otwarcie okienka dialog
            });

            odswiezPoziomDostepu.inicjacja(varGlobal.poziomDostepu); // początkowe ustawienie poziomu dostępu z danych globalnych
        };

    return {
        inicjacja: inicjacja,
        otworzMenu: otworzMenu,
        otworzKlawiature: otworzKlawiature,
        zamkniecieOkienka: zamkniecieOkienka
    };



});