/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'wspolne/dodajMenuRozwijane'], function ($, varGlobal, json, elementMenu) {
    "use strict";


    var idButtonPowrot,
        idDialog = '#DialogRozkazy',


        zamknij = function () {
            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state); // Powrot nawigacji na button
            $(idDialog).dialog('close');
        },


        stworzListeRozkazow = function () {
            var frag = document.createDocumentFragment(),
                menuROZKAZY = {},
                ul,
                li,
                i,
                j,
                length;

            menuROZKAZY = varGlobal.danePlikuKonfiguracyjnego.ROZKAZY;
            length = menuROZKAZY.length;
            for (i = 0; i < length; i += 1) {
                if ((menuROZKAZY[i].typKombajnu === varGlobal.typKombajnu) || (menuROZKAZY[i].typKombajnu === 'ALL')) {
                    if (menuROZKAZY[i].widocznosc === true) {
                        li = elementMenu.dodaj("key" + i, menuROZKAZY[i], false);
                        $(frag).append(li);
                        ul = frag.lastChild.lastChild;

                        for (j = 0; j < menuROZKAZY[i].zawartosc.length; j += 1) {
                            if (menuROZKAZY[i].zawartosc[j].widocznosc === true) {
                                li = elementMenu.dodaj(i + "__" + j, menuROZKAZY[i].zawartosc[j], true); // i + "__" + j   -> po tym "id" po kliknieciu bedzie znaleziony odpowiedni rozkaz w tablicy
                                ul.appendChild(li);
                            }
                        }
                    }
                }
            }
            $('#menuRozkazy').append(frag); // Po append element frag jest automatycznie czyszczony
            $('#menuRozkazy').menu("refresh");
        },


        otworz = function () { // otwarcie listy menu ui
            var div,
                ul;

            div = document.createElement("div");
            $(div)
                .addClass('OknaDialog')
                .attr('id', idDialog.replace("#", ""));
            $('body').append(div);

            $(idDialog).dialog({
                autoOpen: false,
                modal: true,
                closeOnEscape: false,
                height: ($(document).height() - 200),
                width: '90%',
                title: $(idButtonPowrot).text(),
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

            $(idDialog).dialog("open");
            ul = document.createElement("ul"); // stworzenie rozwijalnego menu
            $(ul).attr('id', 'menuRozkazy');
            $(idDialog).append(ul);
            //$("#menuRozkazy").menu({});
            $("#menuRozkazy").menu();

            stworzListeRozkazow();

            $('#menuRozkazy').addClass("kopex-selected");
            $('.ui-menu').css({ // szerokosc pierwszego poziomu menu
                'width': '50%',
                'text-align': 'left'
            });
            $('.ui-menu .ui-menu').css({ // szerokosc drugiego poziomu menu
                'width': '90%', // 45%
                'text-align': 'left'
            });

            $('#menuRozkazy').menu("next"); // Zaznaczenie pierwszego elementu menu rozwijalnego
            //$("#menuRozkazy").menu("refresh");






            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
//                setTimeout(function () {
//                    $(idDialog).remove();
//                }, 500);
            });
        },


        inicjacja = function (idButtona) {
            if (varGlobal.danePlikuKonfiguracyjnego.ROZKAZY === undefined) { // nie istnieje struktura z rozkazami
                console.log('nie istnieje struktura json z rozkazami');
                varGlobal.danePlikuKonfiguracyjnego = json.pobierz('konfiguracja.json');
            }
            idButtonPowrot = '#' + idButtona;
            $(idButtonPowrot).on("click", function (event, ui) {
                otworz(); // otwarcie okienka dialog
            });
        };

    return {
        inicjacja: inicjacja,
        otworz: otworz,
        zamknij: zamknij
    };

});
