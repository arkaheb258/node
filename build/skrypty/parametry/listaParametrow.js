/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

// Stworzenie listy z wszystkimi parametrami --> kontrolka jquery menu
define(['jquery', 'zmienneGlobalne', 'wspolne/dodajMenuRozwijane'], function ($, varGlobal, elementMenu) {
    "use strict";

    var idDialog = "#DialogParametryLista", // tak będzie nazwane okienko popup,

        stworzMenuListaParametrow = function () {
            // Pod wzgledem wydajnosci lepiej jest jak najmniej pracowac na DOM - dlatego dopiero na samym koncu zostanie wstawiony wczescniej stworzony fragment,
            var frag = document.createDocumentFragment();

            $('#meprogrenu').empty(); // Wyczyszczenie listy ul   --> czy czyscis i tworzyc za kazdym razem? co jest szybsze?
            $.each(varGlobal.parametry.DANE, function (key, val) { // Stworzenie pierwszego poziomu menu
                var i,
                    ul,
                    li;

                li = elementMenu.dodaj(key, val, false);
                $(frag).append(li);
                ul = frag.lastChild.lastChild;
                $(ul).addClass('menuDrugiPoziom');
                $.each(val, function (ke, va) { // Stworzenie drugiego poziomu menu
                    var ul2,
                        li2;

                    if (ke !== 'OPIS') {
                        li2 = elementMenu.dodaj(ke, va, false);
                        ul.appendChild(li2);
                        ul2 = ul.lastChild.lastChild;
                        $(ul2).addClass('ui-menu-multilevel'); // Trzeci poziom zmienia swoj rozmiar na bardzo maly (jakis byg jquery), nadanie mu osobnej klasy i okreslenie jego szer w css
                    }

                    if ((typeof va === 'object')) {
                        $.each(va, function (k, v) {
                            var li3;

                            if (k !== 'OPIS') {
                                li3 = elementMenu.dodaj(k, v, true);
                                $(ul2).append(li3);
                            }
                        });
                    }
                });
            });
            $('#menu').append(frag); // Po append element frag jest automatycznie czyszczony
            $('#menu').menu("refresh");
        },


        inicjacja = function (buttonId) {
            var ul,
                div,
                nazwaDialog;

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", "")); //idDialog.replace("#", ""))            dialogWymianaPLC
                $('body').append(div);

                nazwaDialog = varGlobal.parametry.TYPM + " - v." + varGlobal.parametry.WER + ' - ' + varGlobal.parametry.DATA + ', Poziom dostępu: ' + varGlobal.poziomDostepu;
                $(idDialog).dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: ($(document).height() - 30),
                    width: '95%',
                    title: nazwaDialog
                });

                $(idDialog).dialog("open");
                ul = document.createElement("ul");
                $(ul).attr('id', 'menu');
                $(idDialog).append(ul);
                $("#menu").menu({
                    position: {
                        my: "left top",
                        at: "right",
                        collision: "none"
                    }

                });

                stworzMenuListaParametrow();

                $("#DialogParametry").empty();
                $('#menu').addClass("kopex-selected");
                $('#menu').menu("next"); // Zaznaczenie pierwszego elementu menu rozwijalnego
            }

            $(idDialog).one("dialogclose", function (event, ui) { // oczekiwanie na zdarzenie zamknięcia okienka
                $(idDialog).remove();
            });

        };

    return {
        inicjacja: inicjacja
    };

});