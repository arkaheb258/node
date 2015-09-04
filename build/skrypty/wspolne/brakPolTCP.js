/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define */

define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var ccc,


        inicjacja = function (_tekstMiedzyKim, _tekstKodBledu, _czyBladPobraniaPlikow) {
            var div,
                wys,
                szer,
                tekst1,
                p;


            if ($("#DialogBrakKomunikacjiTCP").length === 0) {
                // przypadek gdy jest błąd wczytania pliku z konfiguracją (tekstami)
                if (_czyBladPobraniaPlikow) {
                    tekst1 = 'Błąd komunikacji';
                } else {
                    tekst1 = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.bladKomunikacji;
                }

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-state-error')
                    .addClass('ui-corner-all')
                    .attr('id', 'DialogBrakKomunikacjiTCP');
                $('body').append(div);

                p = document.createElement("p");
                $(p)
                    .addClass('ui-corner-all')
                    .text(tekst1)
                    .css({
                        'font-weight': 'bold',
                        'text-decoration': 'underline',
                        'font-size': '1.0em',
                        'text-align': 'center',
                        'width': '100%'
                    });
                $("#DialogBrakKomunikacjiTCP").append(p);

                p = document.createElement("p");
                $(p)
                    .attr('id', 'brakPolTCP1')
                    .addClass('ui-corner-all')
                    .text(_tekstMiedzyKim)
                    .css({
                        //'font-weight': 'bold',
                        'font-size': '1.0em',
                        'text-align': 'center',
                        'width': '100%'
                    });
                $("#DialogBrakKomunikacjiTCP").append(p);

                p = document.createElement("p");
                $(p)
                    .attr('id', 'brakPolTCP2')
                    .addClass('ui-corner-all')
                    .text(_tekstKodBledu)
                    .css({
                        'font-weight': 'normal',
                        'font-size': '1.0em',
                        'text-align': 'center',
                        //'color': 'black',
                        'font-style': 'italic',
                        'width': '100%'
                    });
                $("#DialogBrakKomunikacjiTCP").append(p);


                //                if (_czyBladPobraniaPlikow) {
                //                    wys = $(document).height() / 3.5;
                //                    szer = '40%';
                //                } else {
                if (!varGlobal.hardware.czyMinimumViz) { // wielkość ramki w zależności od typu wyświetlacza -> true to duzy wyswietlacz
                    wys = $(document).height() / 3.5;
                    szer = '40%';
                } else { // mały wyświetlacz
                    wys = $(document).height() / 1.5;
                    szer = '95%';
                }
                //                }



                $("#DialogBrakKomunikacjiTCP").dialog({
                    modal: true,
                    closeOnEscape: false,
                    height: wys,
                    minHeight: 50,
                    width: szer,
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
                $("#DialogBrakKomunikacjiTCP").siblings('.ui-dialog-titlebar').remove();
                $("#DialogBrakKomunikacjiTCP").dialog("open");

            } else { // popupalarm juz otwarty - zmiana tekstu
                //console.log('popup juz otwarty');
                $("#brakPolTCP1").text(_tekstMiedzyKim);
                $("#brakPolTCP2").text(_tekstKodBledu); //  jqXHR jqXHR, String textStatus, String errorThrown
                // do skasowania
            }

            $("#DialogBrakKomunikacjiTCP").one("dialogclose", function (event, ui) {
                //console.log('usuwam popup');
                $("#DialogBrakKomunikacjiTCP").remove();
            });

        };

    return { // Widocznosc modulu
        inicjacja: inicjacja
    };
});