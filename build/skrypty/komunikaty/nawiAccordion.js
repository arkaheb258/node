/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'komunikaty/nawiSelectable', 'obslugaJSON'], function ($, varGlobal, nawiSelectable, json) {
    'use strict';

    var dezaktywujNavigacjeAccordion,
        intervalId,
        listaSelectable,
        memory,
        tabId,
        //tabIndex,

        dezaktywuj = function () {
            dezaktywujNavigacjeAccordion = false;
        },

        wykonaj = function (kod, selected) {
            //console.log('navi accordion');
            var accordionIndex,
                tabIndex = $('#tabs').tabs("option", "active"),
                sprawdzPamiecButtona = function () {
                    if (typeof varGlobal.buttonMemory[tabIndex] === "string") { // sprawdzenie czy dla aktualnego indeksu tabu istnieje pamiec poprzednio zaznaczonego buttona
                        $("#" + varGlobal.buttonMemory[tabIndex]).addClass("kopex-selected").addClass(varGlobal.ui_state);
                    }
                };


            accordionIndex = $("#accordion").accordion("option", "active"); // pobranie indexu aktywnego accordionu

            if (dezaktywujNavigacjeAccordion === true) { // Nawigacja po liscie komunikatow znajdujacej sie w accordionie
                dezaktywujNavigacjeAccordion = nawiSelectable.wykonaj(kod, listaSelectable); // Przy klawiszu ESC funkcja zwraca false
                return;
            } else {
                if ((kod === varGlobal.kodyKlawiszy.lewo) || (kod === varGlobal.kodyKlawiszy.prawo)) { // Przy wyjsciu z accordiona usuniecie klasy kopex-selected
                    selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                    $("#accordion").accordion("option", "active", 0);
                }

                switch (kod) {
                case varGlobal.kodyKlawiszy.gora:
                    if (accordionIndex === 3) { // zejscie z zakladki HISTORIA -> wyczyszczenie historii celem zwiększenia wydajnosci (mniej elementow html)
                        $('#listaHistoria').empty();
                    }

                    if (accordionIndex > 0) { // Przy zerze przeskakuje na ostatna harmonijke
                        accordionIndex -= 1;
                        $("#accordion").accordion("option", "active", accordionIndex);
                    }
                    break;

                case varGlobal.kodyKlawiszy.dol:
                    accordionIndex += 1;
                    $("#accordion").accordion("option", "active", accordionIndex);
                    if (accordionIndex === 3) { // sprawdzenie czy jest aktywny accordion z historia -> jesli tak, wywolanie odpowiednich procedur
                        json.wyslij(varGlobal.doWyslania.historia);
                    }
                    break;

                case varGlobal.kodyKlawiszy.lewo:
                    tabIndex -= 1;
                    $("#tabs").tabs("option", "active", tabIndex);
                    break;

                case varGlobal.kodyKlawiszy.prawo:
                    tabIndex += 1;
                    //console.log('tabIndex2: ' + tabIndex);
                    $("#tabs").tabs("option", "active", tabIndex);
                    sprawdzPamiecButtona();
                    break;

                case varGlobal.kodyKlawiszy.enter:
                    listaSelectable = $("#accordion").find('h3').eq(accordionIndex).next().children(); // Znalezienie listy z komunikatami w aktywnym oknie accordionu
                    if (listaSelectable.find("li").length > 0) { // Jesli sa jakies elementy listy....
                        dezaktywujNavigacjeAccordion = true; // Wylaczenie nawigacji po accordionie i aktywowanie ruchow po liscie z komunikatami
                        listaSelectable.find("li").first().addClass("ui-selected"); // Zaznaczenie pierwszego elementu listy
                    }

                    require(['komunikaty/tooltip'], function (tooltip) { // wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                        tooltip.naSelectable();
                    });
                    break;

                case varGlobal.kodyKlawiszy.escape:
                    memory = $('.kopex-memory');
                    $(memory).parent();

                    tabId = $(memory).parent().attr('id');
                    tabIndex = $(memory).parent().index() - 1; // wziecie indeksu tabu z ktorego nastapil przeskok

                    if (tabIndex < 0) { // jesli nie ma pamieci -> nie rob nic
                        return;
                    }

                    $("#accordion").removeClass("kopex-selected");
                    $("#tabs").tabs("option", "active", tabIndex);
                    $(memory).removeClass('kopex-memory');
                    $(memory).addClass("kopex-selected").addClass(varGlobal.ui_state);
                    break;
                }
            }

            require(['komunikaty/tooltip'], function (tooltip) { // wywietlenie podpowiedzi z możliwymi kierunkami nawigacji
                tooltip.naAccordionie(accordionIndex);
            });

        };


    return {
        wykonaj: wykonaj,
        dezaktywuj: dezaktywuj // klawiatura/zdarzenia -> obsluga F1 - F5
    };
});
