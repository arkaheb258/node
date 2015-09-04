/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'tab1/main'], function ($, varGlobal, zaladujTab1) {
    "use strict";

    var init = false,


        minimum = function (_nrTab, _zawartosc) {
            require(['minimumViz/main'], function (main) { // Wlaczenie obslugi komunikatow
                main.inicjacja(_nrTab, _zawartosc);
            });

            if (!init) { // jeśli choć jeden tab minimum zostanie aktywowany -> odpalenie osobnego odświeżania danych na mały monitor
                init = true;
                require(['minimumViz/odswiezaj'], function (odswiezaj) { // Wlaczenie obslugi komunikatow
                    odswiezaj.inicjacja();
                });
            }
        },


        buttony = function (_nrTab, _zawartosc) {
            require(['ladowanieHtml/dodajButtony'], function (dodajButtony) { // Wlaczenie obslugi komunikatow
                dodajButtony.inicjacja(_nrTab, _zawartosc);
            });
        },


        komunikaty = function (nrTab) {
            require(['ladowanieHtml/dodajKomunikaty'], function (kontrolkiKomunikaty) { // Zaladowanie kontrolek (accordiona z komunikatami)
                kontrolkiKomunikaty.inicjacja(nrTab);
            });
            require(['komunikaty'], function (obslugaKomunikaty) { // Wlaczenie procedur obslugi komunikatow
                obslugaKomunikaty.inicjacja();
            });
        },


        tab1 = function (_typ) {
            var tekst,
                nowaObudowa;

            require(['tab1/main'], function (tab1) { // W razie braku wybranego poziomu dostepu otworzenia okienka z wyborem
                //tab1.inicjacja(_typ); //.done(function (czyDOMready) { // Wywolanie asynchroniczne
                tab1.inicjacja(_typ).done(function (czyDOMready) { // Wywolanie asynchroniczne
                    if (czyDOMready) {
                        if (_typ === varGlobal.identyfikatorKombajnu.ktw) {
                            //console.log('tab1 - asynchr');
                            require(['grafikaKTW/main'], function (_grafikaKTW) {
                                nowaObudowa = varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfObudowaTyp.WART; // pobranie typu obudowy z parametrów
                                tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.typObudowyLP[nowaObudowa];
                                $("#typObudowyLP").text(tekst); // opis na kontrolce na tab1
                                console.log(tekst);
                                _grafikaKTW.inicjacja(tekst, 'ktw150typ1'); // załadowanie grafiki dopiero po stworzeniu szkieletu (raphael czesto wywalał błąd że div#grafika jeszcze nie gotowy)
                            });
                        }
                        if (_typ === varGlobal.identyfikatorKombajnu.gul) {
                            require(['grafikaGUL/main'], function (_grafikaGUL) {
                                _grafikaGUL.inicjacja(varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfRolkaZabudowanaPoLewej.WART); // kierunek rolki 0:prawo, 1:lewo
                            });
                        }
                        if (_typ === varGlobal.identyfikatorKombajnu.wow) {
                            require(['grafikaWOW/main'], function (_grafikaGUL) {
                                _grafikaGUL.inicjacja(); // kierunek rolki 1:lewo, 2:prawo
                            });
                        }
                    }
                });
            });
        },


        zezwoleniaNapedy = function () {
            require(['zezwoleniaNapedy/zezwNapedy'], function (zezwoleniaDlaNapedow) { // okienka popUp z wyswietlaniem stanu zezwolen dla zalaczenia napedu
                zezwoleniaDlaNapedow.inicjacja();
            });
        },


        testZabezpieczen = function () { // test zabezpieczen na duzy wyswietlacz (ten 10")
            require(['testZabezpieczen/main'], function (_main) {
                _main.inicjacja();
            });
        },


        inicjacja = function () {
            var i,
                MENU_TAB,
                czyUsunacNieaktywneTaby = true,
                aDisabledTabs = [],
                removeTabId = [],
                removePanelId = [],
                szerokoscTabow,
                aFlags = [ // ścieżki do obrazków z flagami państw (potrzebne do zakładki z wyborem języków)
                    "../obrazki/Poland.png",
                    "../obrazki/Russia.png",
                    "../obrazki/Britain.png",
                    "../obrazki/China.png",
                    "../obrazki/Argentina.png"
                ],
                length;

            // Wybranie odpowiedniego zestawu tabów w zależności od typu kombajnu
            varGlobal.typKombajnu = varGlobal.typKombajnu.toUpperCase();
            varGlobal.typKombajnu = varGlobal.typKombajnu.trim();
            switch (varGlobal.typKombajnu) {
            case varGlobal.identyfikatorKombajnu.ktw:
                if (!varGlobal.hardware.czyMinimumViz) {
                    MENU_TAB = varGlobal.danePlikuKonfiguracyjnego.MENU_TAB_KTW;
                } else {
                    MENU_TAB = varGlobal.danePlikuKonfiguracyjnego.MENU_TAB_KTW_MIN;
                }
                break;
            case varGlobal.identyfikatorKombajnu.gul:
                MENU_TAB = varGlobal.danePlikuKonfiguracyjnego.MENU_TAB_GUL;
                break;

            case varGlobal.identyfikatorKombajnu.wow:
                MENU_TAB = varGlobal.danePlikuKonfiguracyjnego.MENU_TAB_WOW;
                break;
            default: // przy blednie wpisanym typie kombajnu wyswietli sie komunikat alarmowy
                console.log('Zly typ kombajnu: ' + varGlobal.typKombajnu);
                break;
            }

            // Wczytanie tabów
            length = MENU_TAB.length;
            for (i = 0; i < length; i += 1) {
                $("#tabs").find("a").eq(i).text(MENU_TAB[i].OPIS); // Opisy (naglowki) na tabach

                // sprawdzenie czy wszystkie taby mają być aktywne, ich wyłączenia nastąpi po wyjściu z pętli FOR
                if (MENU_TAB[i].widocznosc === false) {
                    aDisabledTabs.push(i); // to jest potrzebne do opcji 'disabled'...
                    removeTabId.push($("#tabs").find("a").eq(i).attr('href')); // ...a te dwie tablice do opcji usunięcia zakładek 
                    removePanelId.push($("#tabs").find("a").eq(i).attr("id"));
                }

                switch (MENU_TAB[i].id) { // jakiego typu ma być zakładka TAB
                case 'tab1Grafika':
                    tab1(varGlobal.typKombajnu);
                    break;
                case 'komunikaty':
                    komunikaty(i);
                    break;
                case 'buttony':
                    buttony(i, MENU_TAB[i].zawartosc);
                    break;
                case 'jezyki':
                    buttony(i, MENU_TAB[i].zawartosc);
                    $("#tabs").find("a").eq(i).css({
                        "background-image": 'url(' + aFlags[varGlobal.wersjaJezykowa] + ')'
                    });
                    break;
                case 'minimum':
                    minimum(i, MENU_TAB[i].zawartosc[0].id); // tylko jeden znacznik na tab!
                    break;
                default:
                    break;
                }
            }

            // wyłączenie tabów z widocznością na false (będzie je widać ale 'pół przeźroczyste')
            $("#tabs").tabs("option", "disabled", aDisabledTabs);

            // Zniszczenie nieaktywnych tabów
            if (czyUsunacNieaktywneTaby) {
                for (i = 0; i < aDisabledTabs.length; i += 1) {
                    $("#" + removePanelId[i]).closest("li").remove();
                    $(removeTabId[i]).remove();
                }
                $("#tabs").tabs("refresh");
                szerokoscTabow = 100 / $('#tabs').children().children('li').length - 1;
                szerokoscTabow = szerokoscTabow + '%';
                $(".ui-tabs-nav li")
                    .css({
                        'width': szerokoscTabow
                    });
            }

            // aktywowanie nawigacji po ekranach z opuznieniem zeby grafika sie załadowała
            setTimeout(function () {
                require(['klawiatura'], function (klawiatura) { // Aktywowanie nawigacji po ekranach (klawiatura i ramka tcp)
                    klawiatura.inicjacja();
                    testZabezpieczen();
                });
            }, 1000);
        };


    return {
        inicjacja: inicjacja
    };
});