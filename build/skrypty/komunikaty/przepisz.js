/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'komunikaty/uaktualnijStatus', 'tab1/main'], function ($, varGlobal, aktualizujStatus, zmienKomm_Zegar) {
    "use strict";

    var ccc,

        dodajKomunikat = function (ol_id, li_id, _tekst, _czyJestMozliwoscBlokowania, _poziomDost) {
            var li;

            // tekst  -> dodanie odpowiedniej klasy dla poziomu zalozenia blokady
            li = document.createElement("li");
            if (_czyJestMozliwoscBlokowania === 1) { // 0-mozna blokowac, 1-brak mozliwosci blokowania komunikatu
                $(li).addClass('nieBlokowalny');
                _tekst += ' (' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.nieBlokowalny + ')';
            }

            if ((_poziomDost !== undefined) && (_poziomDost !== '')) {
                $(li).addClass(_poziomDost);
            } else {
                $(li).addClass('dostepUser');
            }

            $(li)
                .text(_tekst)
                .addClass('ui-widget-content')
                .addClass(_tekst)
                .attr('id', li_id);

            $(ol_id).prepend(li); // wczytanie nowych komunikatow na gore listy
        },


        sprawdzCzyIstnieje = function (ol_id, li_id, tekstKomunikatu, akcja, _czyMoznaBlokowac, _poziomDostepu) { // sprawdzenie czy dany komunikat jest juz wyswietlany

            switch (akcja) {
            case 'dodaj':
                if ($(ol_id).children('#' + li_id).length === 0) { // nie ma <li> z id komunikatu, dodaj...
                    dodajKomunikat(ol_id, li_id, tekstKomunikatu, _czyMoznaBlokowac, _poziomDostepu);
                }
                break;

            case 'usun':
                $(ol_id).children('#' + li_id).remove();
                break;
            }
        },


        zmienListe = function (daneTCP, teksty, typ) {
            var liczbaBlokad,
                idBlokady,
                przepisz = function (inx, val, uzytkownik) {
                    var i,
                        nrKomunikatu,
                        maska,
                        li_id, // string z nazwa id dla kazdego aktywnego komunikatu np mesg_nr_bit_nr  -->  mesg_0_bit_12
                        tymczasTekst = '',
                        poziomDostepu,
                        czyMoznaBlokowac; // 0-mozna blokowac, 1-brak mozliwosci blokowania komunikatu

                    maska = 1;
                    for (i = 0; i < 16; i += 1) { // sprawdzenie wszystkich bitow w wordzie
                        nrKomunikatu = inx * 16 + i; // obliczenie kodu (numeru) komunikatu z numeru worda oraz numeru bitu w wordzie
                        li_id = '';
                        li_id = "mesg_" + inx + "_bit_" + i;
                        if (val & maska) {
                            if ((teksty[inx] !== undefined) && (teksty[inx].bity[i] !== undefined)) { //  sprawdzenie czy w ogole istnieje tekst komunikatu w pliku "komunikaty.json"
                                tymczasTekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.kod + ' ' + nrKomunikatu + ' - ' + teksty[inx].bity[i].opis;
                                czyMoznaBlokowac = teksty[inx].bity[i].nb;
                                poziomDostepu = teksty[inx].bity[i].dostep;
                            } else { //Blad tekstu komunikatu
                                tymczasTekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.BladTekstu + ' ' + li_id; // poinformawanie dla ktorego worda i bitu nie ma tekstu w tablicy
                            }

                            if (typ === 'komunikaty') { // obsluga zapytania o komunikaty
                                if (daneTCP.mesgType[inx] & maska) { // sprawdzenia czy mamy do czynienia z alarmem czy ostrzezeniem MESG_TYPE: 0-alarm, 1-ostrzezenie
                                    sprawdzCzyIstnieje('#listaOstrzezenia', li_id, tymczasTekst, 'dodaj');
                                    sprawdzCzyIstnieje('#listaAlarmy', li_id, tymczasTekst, 'usun');
                                } else {
                                    sprawdzCzyIstnieje('#listaAlarmy', li_id, tymczasTekst, 'dodaj', czyMoznaBlokowac, poziomDostepu);
                                    sprawdzCzyIstnieje('#listaOstrzezenia', li_id, tymczasTekst, 'usun');
                                }
                            } else { // obsluga zapytania o blokady
                                // moga wystapic takie same wordy i bity dla roznych uzytkownikow, slatego trzeba rozszerzyc id o poziom uzytkownika
                                li_id += '_' + uzytkownik;
                                tymczasTekst = uzytkownik + ' - ' + tymczasTekst;
                                dodajKomunikat('#listaBlokady', li_id, tymczasTekst);
                            }
                        } else { // zostal usuniety alarm z ramki tcp
                            if (typ === 'komunikaty') {
                                sprawdzCzyIstnieje('#listaOstrzezenia', li_id, tymczasTekst, 'usun');
                                sprawdzCzyIstnieje('#listaAlarmy', li_id, tymczasTekst, 'usun');
                            }
                        }
                        maska = maska << 1;
                    }
                };

            if (typ === 'komunikaty') {
                $.each(daneTCP.mesg, function (index, value) {
                    przepisz(index, value, '');
                });

                // zmiana komunikatow - wyswietlenie pierwszego alarmu na tab1
                if ($('#tab1_komunikat').hasClass('ui-state-error') || $('#tab1_komunikat').hasClass('ui-state-highlight')) { // Jest aktywna plansz z ostatnim alarmem
                    if (varGlobal.komunikaty.alarmy > 0) {
                        $('#tab1_komunikat')
                            .removeClass('ui-state-highlight')
                            .addClass('ui-state-error');
                    } else if (varGlobal.komunikaty.alarmy === 0 && varGlobal.komunikaty.ostrz > 0) {
                        $('#tab1_komunikat')
                            .removeClass('ui-state-error')
                            .addClass('ui-state-highlight');
                    } else {
                        zmienKomm_Zegar.stworzZegar();
                    }
                    aktualizujStatus.dodajTekstKomunikatu('first');
                } else {
                    zmienKomm_Zegar.stworzOstatniKomunikat();
                    aktualizujStatus.dodajTekstKomunikatu('first');
                }

                // wyswietlenie na tytulach zakladek accordiona ilosci aktywnych alaramow i ostrzezen
                $('#listaAlarmy').parent().prev().text(varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc[0].OPIS + ': ' + varGlobal.komunikaty.alarmy);
                $('#listaOstrzezenia').parent().prev().text(varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc[1].OPIS + ': ' + varGlobal.komunikaty.ostrz);
            }

            if (typ === 'blokady') {
                $('#listaBlokady').empty();
                $.each(daneTCP.blockUser, function (index, value) {
                    przepisz(index, value, "User");
                });
                $.each(daneTCP.blockSrvc, function (index, value) {
                    przepisz(index, value, "Srvc");
                });
                $.each(daneTCP.blockAdv, function (index, value) {
                    przepisz(index, value, "Adv");
                });

            }
        };

    return {
        zmienListe: zmienListe
    };
});