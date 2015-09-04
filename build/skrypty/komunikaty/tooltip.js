/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

// dodanie pomocy nawigacyjnych - pokazanie wszystkich możliwych kierunkow
define(['jquery', 'wspolne/stworzTooltip'], function ($, stworzTooltip) {
    'use strict';

    var id_h3,
        selectedId,
        timeoutIdSelectable,
        timeoutIdAccordion,

        naSelectable = function () { // tooltipy na zaznaczonych komunikatach
            var mojContent = '',
                accordionIndex,
                tabIndex;

            if ($("#" + selectedId).data('ui-tooltip')) { // Jesli jest otwarty tooltip z poprzednia podpowiedzia -> zamkniecie go
                $("#" + selectedId).tooltip('destroy'); // destroy   close
            }


            clearTimeout(timeoutIdSelectable); // reset timera przy kazdym nowym poleceniu nawigacji (licznik ma zawsze odliczyc te 3 sekundy od poczatku)
            timeoutIdSelectable = setTimeout(function () {
                selectedId = $('.ui-selected').attr('id');
                $("#" + selectedId).attr('title', '');

                if (selectedId !== undefined) {
                    accordionIndex = $("#accordion").accordion("option", "active");
                    switch (accordionIndex) {
                    case 0: // alarmy
                        mojContent = stworzTooltip.inicjacja('g_d_ent_esc');
                        break;
                    case 1: // ostrzeżenia
                        mojContent = stworzTooltip.inicjacja('g_d_esc');
                        break;
                    case 2: // zalożone blokady
                        mojContent = stworzTooltip.inicjacja('g_d_ent_esc');
                        break;
                    case 3: // historia
                        mojContent = stworzTooltip.inicjacja('g_d_esc');
                        break;
                    }

                    if ($("#DialogBlokady").is(":visible")) { // nie wyswietlenie podpowiedzi gdy uzytkownik wcisnal enter i zaklada blokade
                        return;
                    }

                    $("#" + selectedId).tooltip({
                        position: {
                            my: "top+5",
                            at: "right-50 bottom"
                        },
                        content: function () {
                            return mojContent;
                        }
                    });
                    $("#" + selectedId).tooltip("open");
                }
            }, 2000);
        },


        naAccordionie = function (_accordionIndex) { // tooltipy na wstażkach accordiona
            var acordionTitle,
                mojContent = '',
                opcjaPamiecAktywna = '', // bedac na zakladce np diagnostyki i klikajac klawisz ESC nastepuje automatyczny przeskok na komunikaty -> ponowne ESC powoduje powrot na zakladke komunikaty
                zaznaczonyKomunikat,
                tabIndex;

            if ($("#" + id_h3).data('ui-tooltip')) { // Jesli jest otwarty tooltip z poprzednia podpowiedzia -> zamkniecie go
                $("#" + id_h3).tooltip('destroy'); // destroy   close
            }
            tabIndex = $('#tabs').tabs("option", "active"); // rysowanie tooltipow tylko na zakladce z komunikatami
            if (tabIndex !== 1) {
                return;
            }

            id_h3 = $("#accordion").find('h3').eq(_accordionIndex).attr('id'); // pobranie id aktywnego naglowka accordiona
            if (acordionTitle === undefined) {
                $("#" + id_h3).attr('title', ''); // nadanie pustego opisu tooltipa -> bedzie zastapiony przez ikonki

                if ($('.kopex-memory').parent().attr('id') !== undefined) { // sprawdzenie czy jest aktywny przycisk historii przeskoku z innej zakladki
                    opcjaPamiecAktywna = '_esc';
                }
                switch (_accordionIndex) {
                case 0: // alarmy
                    mojContent = stworzTooltip.inicjacja('l_p_d_ent' + opcjaPamiecAktywna);
                    break;
                case 1: // ostrzeżenia
                    mojContent = stworzTooltip.inicjacja('l_p_g_d_ent' + opcjaPamiecAktywna);
                    break;
                case 2: // zalożone blokady
                    mojContent = stworzTooltip.inicjacja('l_p_g_d_ent' + opcjaPamiecAktywna);
                    break;
                case 3: // historia
                    mojContent = stworzTooltip.inicjacja('l_p_g_ent' + opcjaPamiecAktywna);
                    break;
                }
            }

            clearTimeout(timeoutIdAccordion);
            timeoutIdAccordion = setTimeout(function () {
                tabIndex = $('#tabs').tabs("option", "active");
                zaznaczonyKomunikat = $('#' + id_h3).next().find('.ui-selected').attr('id');
                if ((tabIndex === 1) && (zaznaczonyKomunikat === undefined)) { // jeszcze raz sprawdzenie czy jest aktywna zakladaka z komunikatami - ktos mogl szybko przejsc w inna lokalizacje
                    $("#" + id_h3).tooltip({
                        position: {
                            my: "top+5",
                            at: "right-75 bottom"
                        },
                        content: function () {
                            return mojContent;
                        }
                    });
                    $("#" + id_h3).tooltip("open");
                }
            }, 2000);
        };


    return {
        naAccordionie: naAccordionie,
        naSelectable: naSelectable
    };
});
