/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'scroll'], function ($, varGlobal, scroll) { // , 'komunikaty/wyslijDoPLC'           , komunikaty
    'use strict';

    var inicjacja = false,
        aktywnyAccordion,
        intervalId,
        selected,
        wylaczNawiAccordion,
        czyPustaLista = false,

        zmianaRamkiTcp = function (wybanaLista) { // Gdy zmienia sie ilosc komunikatow (zmiana ramki tcp) kasuje sie zaznaczenie
            var selected2 = $(".ui-selected");

            if (selected2.attr('id') === undefined) { // Nie ma zaznaczonego elementu
                wybanaLista.find("li").first().addClass("ui-selected"); // Zaznaczenie pierwszego elementu
                selected2 = $(".ui-selected");
                scroll.komunikaty();
                console.log('zmiana ramki tcp');
            }
        },


        wyjscie = function () { // wyjście z listy selectable na accordiona, moze to być też wywołane z zewnątrz (przy przeskoku pomiędzy tabami na klawiszach funkcyjnych F1 - F5)
            scroll.komunikatyTop(selected);
            $(".selectable li").removeClass("ui-selected");
            inicjacja = false;
            wylaczNawiAccordion = false;
            clearInterval(intervalId);
        },

        wykonaj = function (wcisnietyKlawisz, wybanaLista) { // Nawigacja po liscie z komunikatami
            //var //wylaczNawiAccordion = true,
            //selected = $(".ui-selected");

            wylaczNawiAccordion = true;
            selected = $(".ui-selected");

            if (inicjacja === false) { // odpalenie timera tylko raz
                intervalId = setInterval(function () { // przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                    zmianaRamkiTcp(wybanaLista); // Reakcje na zmiany w ramce tcp (kasuje sie zaznaczenie) - kiedys sprobowac zrobic to na zdarzeniu
                }, varGlobal.czasOdswiezania);
                inicjacja = true;
            }

            if (wybanaLista.children().length === 0) { // zniknely wszystkie komunikaty lub blokady -> wyjscie poziom wyzej na accordion
                console.log('wyjdz poziom wyzej');
                inicjacja = false;
                wylaczNawiAccordion = false;
                clearInterval(intervalId); // wylaczenie odwiezania
            }

            switch (wcisnietyKlawisz) {
            case varGlobal.kodyKlawiszy.gora:
                $(".selectable li").removeClass("ui-selected");
                if (selected.prev().length === 0) { // po dojsciu do pierwszego elementu przeskoczenie na ostatni
                    selected.siblings().last().addClass("ui-selected");
                } else {
                    selected.prev().addClass("ui-selected");
                }
                break;

            case varGlobal.kodyKlawiszy.dol:
                $(".selectable li").removeClass("ui-selected");
                if (selected.next().length === 0) { // po dojsciu do ostatniego elementu przejscie na pierwszy
                    selected.siblings().first().addClass("ui-selected");
                } else {
                    selected.next().addClass("ui-selected");
                }
                break;

            case varGlobal.kodyKlawiszy.enter:
                aktywnyAccordion = $('.ui-selected').parent().attr('id');
                if ((aktywnyAccordion === "listaAlarmy") || (aktywnyAccordion === "listaBlokady")) { // Zakladanie i zdejmowanie blokad tylko na odpowiednich zakladkach
                    require(['sprawdzPozDostepu'], function (sprawdzPozDostepu) {
                        sprawdzPozDostepu.inicjacja({
                            selected: selected,
                            parentId: aktywnyAccordion
                        });
                    });
                }
                break;

            case varGlobal.kodyKlawiszy.escape:
                wyjscie(selected);
                require(['komunikaty/tooltip'], function (tooltip) { // wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                    tooltip.naAccordionie($("#accordion").accordion("option", "active"));
                });
                break;

            default:
                break;
            }

            scroll.komunikaty(); // Przy dlugiej liscie komunikatow sterowanie scroll barem

            require(['komunikaty/tooltip'], function (tooltip) { // wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                tooltip.naSelectable();
            });

            return wylaczNawiAccordion;
        };

    return { // Metoda publiczna
        wykonaj: wykonaj,
        wyjscie: wyjscie // klawiatura/zdarzenia -> obsługa F1 - F5
    };
});