/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'kommTCP', 'komunikaty/przepisz', 'komunikaty/liczbaDostepnych', 'poziomDostepu/odswiezaj'], function ($, varGlobal, json, dane, przepisz, liczbaDostepnych, poziomDostepuTekst) { // , 'komunikaty/wyslijDoPLC'    , wyslij
    "use strict";

    var index,
        odswiezListe = false,
        selectedIndex,
        selectedLi,
        idButtonPowrot,
        idDialog = '#PelnaListaKomm',
        idSelectable = '#listaPelnaOLselectable',


        zamknij = function () {
            //console.log($('#DialogBlokady').length);
            if ($('#DialogBlokady').length > 0) {
                require(['komunikaty/zalozBlokade'], function (blokady) {
                    blokady.zamknij();
                });
                return;
            }

            $(idSelectable).empty();
            $(idDialog).removeClass("kopex-selected");
            $(idDialog).dialog('close');
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button parametrow
        },


        dodajKomunikaty = function (komenda) {
            var i,
                div,
                ol,
                maska,
                iloscWordKomunikatow,
                tytul,
                klasa,
                nrKomunikatu,
                li_id, // string z nazwa id dla kazdego aktywnego komunikatu np mesg_nr_bit_nr  -->  mesg_0_bit_12
                tymczasTekst = '',
                tekstPozdost,
                czyBlokowalny,
                poziomDostepuKomunikatu,
                blokady,
                fragMenu = document.createDocumentFragment(),
                dodajPojedynczy = function (li_id, _tekst, _klasaBlokady, _czyBlokowalny, _poziomdostepu) {
                    var li,
                        kolorTekstu;

                    if (klasa === null) {
                        kolorTekstu = '';

                    } else {
                        kolorTekstu = 'red';
                    }

                    li = document.createElement("li");
                    if (_czyBlokowalny === 1) { // 0-mozna blokowac, 1-brak mozliwosci blokowania komunikatu
                        $(li).addClass('nieBlokowalny');
                        _tekst += ' (' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.nieBlokowalny + ')';
                    }

                    //console.log(_poziomdostepu);
                    if ((_poziomdostepu !== undefined) && (_poziomdostepu !== '')) {
                        $(li).addClass(_poziomdostepu);
                    } else {
                        $(li).addClass('dostepUser');
                    }

                    $(li)
                        .text(_tekst)
                        .addClass('ui-widget-content')
                        .addClass(_klasaBlokady)
                        .css({
                            'text-align': 'left'
                        })
                        .attr('id', li_id);
                    $(fragMenu).append(li);
                };


            iloscWordKomunikatow = varGlobal.tekstyKomunikatow.length - 1; // ilosc wordow komunikatow
            switch (komenda) { // pokaz nestepny lub poprzedni word
            case 'next':
                index += 1;
                break;

            case 'prev':
                index -= 1;
                break;
            }

            if (index < 0) {
                index = iloscWordKomunikatow;
            } else if (index > iloscWordKomunikatow) {
                index = 0;
            }

            maska = 1;
            for (i = 0; i < 16; i += 1) { // sprawdzenie wszystkich bitow w wordzie
                nrKomunikatu = index * 16 + i; // obliczenie kodu (numeru) komunikatu z numeru worda oraz numeru bitu w wordzie
                li_id = '';
                li_id = "mesg_" + index + "_bit_" + i;

                if ((varGlobal.tekstyKomunikatow[index] !== undefined) && (varGlobal.tekstyKomunikatow[index].bity[i] !== undefined)) { //  sprawdzenie czy w ogole istnieje tekst komunikatu w pliku "komunikaty.json"
                    tymczasTekst = '';

                    klasa = null;
                    if (dane.daneTCP.blockUser[index] & maska) {
                        tymczasTekst += '(Blokada User) ';
                        klasa = 'User';
                    }
                    if (dane.daneTCP.blockSrvc[index] & maska) {
                        tymczasTekst += '(Blokada Srvc) ';
                        klasa = 'Srvc';
                    }
                    if (dane.daneTCP.blockAdv[index] & maska) {
                        tymczasTekst += '(Blokada Adv) ';
                        klasa = 'Adv';
                    }

                    tymczasTekst += varGlobal.danePlikuKonfiguracyjnego.TEKSTY.kod + ' ' + nrKomunikatu + ' - ' + varGlobal.tekstyKomunikatow[index].bity[i].opis;
                    czyBlokowalny = varGlobal.tekstyKomunikatow[index].bity[i].nb;
                    poziomDostepuKomunikatu = varGlobal.tekstyKomunikatow[index].bity[i].dostep;

                    dodajPojedynczy(li_id, tymczasTekst, klasa, czyBlokowalny, poziomDostepuKomunikatu);
                }
                maska = maska << 1;
            }

            tekstPozdost = poziomDostepuTekst.inicjacja(varGlobal.poziomDostepu);
            blokady = liczbaDostepnych.inicjacja();
            tytul = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pelnaLista + ' - ' + (index) + ' / ' + (iloscWordKomunikatow) + ', ' +
                //varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDost + ': ' + varGlobal.poziomDostepu + ', ' +
                varGlobal.danePlikuKonfiguracyjnego.TEKSTY.pozDost + ': ' + tekstPozdost + ', ' +
                varGlobal.danePlikuKonfiguracyjnego.TEKSTY.blokLiczbDost + ': ' + blokady.dostepne + '/' + blokady.max;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    autoOpen: false,
                    closeOnEscape: false,
                    height: 'auto',
                    width: '95%',
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

                ol = document.createElement("ol");
                $(ol)
                    .addClass("selectable")
                    .attr('id', idSelectable.replace("#", "")); //idDialog.replace("#", ""))            dialogWymianaPLC
                $(ol).append(fragMenu);
                $(idDialog).append(ol);

                $(idDialog).dialog("open");
                $(idDialog).addClass("kopex-selected");
            } else {
                $(idSelectable).empty();
                $(idSelectable).append(fragMenu);
                $(idDialog).dialog("option", "title", tytul); // Nadanie tytulu okienku
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });

            if (odswiezListe === false) { // pierwsze wywolanie lub nastepna strona
                $("#listaPelnaOLselectable").find("li").first().addClass("ui-selected"); // Zaznaczenie pierwszego elementu listy
            } else { // ponowne podswietlenie elementu na ktorym byla zalozona blokada
                odswiezListe = false;
                $("#listaPelnaOLselectable").find("li").eq(selectedIndex).addClass("ui-selected");
            }
        },


        odswiez = function () {
            selectedLi = $(".ui-selected");
            selectedIndex = $(selectedLi).index();

            odswiezListe = true;
            dodajKomunikaty(index);
        },

        nastepnaStrona = function () {
            dodajKomunikaty('next');
        },

        poprzedniaStrona = function () {
            dodajKomunikaty('prev');
        },

        otworz = function () {
            index = 0;
            dodajKomunikaty(index);
        },

        inicjacja = function (idButtona) {

            //idButtonPowrot = '#' + idButtona;
            idButtonPowrot = "#pelnaListaKomuniktow";
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });
        };


    return {
        inicjacja: inicjacja,
        nastepnaStrona: nastepnaStrona,
        poprzedniaStrona: poprzedniaStrona,
        zamknij: zamknij,
        odswiez: odswiez
    };

});