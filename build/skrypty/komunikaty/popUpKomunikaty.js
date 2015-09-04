/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

// podczas podgladu analogow lub danych diagnostycznych istnieje mozliwosc wyswietlenia kilku ostatnich alarmow i ostrzezen (podczas najezdzania czujnikow nie trzeba nawigowac do komunikatow)
define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    "use strict";

    var timeoutID,
        idDialog = "#DialogPopUpKomunikaty",


        inicjacja = function () {
            var i,
                tabIndex,
                div,
                p,
                czyDodacKomunikat,
                tekstKomm,
                klasaBledu,
                dodajKomunikaty = function (lista) {
                    for (i = 0; i < 4; i += 1) {
                        // ui-state-highlight    ui-state-error
                        if (i === 0) {
                            if (lista === '#listaAlarmy') {
                                tekstKomm = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbAlrm + ' ' + varGlobal.komunikaty.alarmy;
                            }
                            if (lista === '#listaOstrzezenia') {
                                tekstKomm = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.tab1LiczbOstrz + ' ' + varGlobal.komunikaty.ostrz;
                            }
                            klasaBledu = '';
                            czyDodacKomunikat = true;
                        } else {
                            if (lista === '#listaAlarmy') {
                                klasaBledu = 'ui-state-error';
                            }
                            if (lista === '#listaOstrzezenia') {
                                klasaBledu = 'ui-state-highlight';

                            }

                            if ($(lista).find("li").eq(i - 1).length > 0) {
                                tekstKomm = i + ') ' + $(lista).find("li").eq(i - 1).text();
                                czyDodacKomunikat = true;
                            } else {
                                czyDodacKomunikat = false;
                            }
                        }

                        if (czyDodacKomunikat) {
                            p = document.createElement("p");
                            $(p)
                                .attr('id', 'komm_' + i)
                                .addClass('ui-corner-all')
                                .addClass(klasaBledu)
                                .text(tekstKomm)
                                .css({
                                    'padding': '0.1em',
                                    'padding-left': '0.5em',
                                    'margin': '0.2em',
                                    'font-size': '1.0em',
                                    'text-align': 'left',
                                    'height': '100%',
                                    'width': '99%'
                                });
                            $(idDialog).append(p);
                        }
                    }
                };

            if ($(idDialog).length === 0) {

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""))
                    .css({
                        'justify-content': 'center',
                        'text-align': 'center'
                    });
                $('body').append(div);

                dodajKomunikaty('#listaAlarmy');
                dodajKomunikaty('#listaOstrzezenia');

                $(idDialog).dialog({
                    modal: false,
                    closeOnEscape: true,
                    //height: ($(document).height() / 10),
                    height: 'auto',
                    width: '90%',
                    show: {
                        delay: 200,
                        effect: 'clip', // shake  bounce  pulsate
                        duration: 500
                    },
                    hide: {
                        effect: 'clip',
                        duration: 300
                    },
                    position: {
                        my: "center",
                        at: "bottom",
                        of: window
                    }
                });
                $(idDialog).siblings('.ui-dialog-titlebar').remove();
                $(idDialog).dialog("open");

            } else { // popupalarm juz otwarty - zmiana tekstu
                console.log('popupalarm juz otwarty - odświeżenie tekstów komunikatów');
                $(idDialog).empty();
                dodajKomunikaty('#listaAlarmy');
                dodajKomunikaty('#listaOstrzezenia');
                //$('#tekstPopUpu').text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.alarm + ' ' + tekst);
            }

            clearTimeout(timeoutID);
            timeoutID = setTimeout(function () { // zamkniecie i zniszczenie okienka po zwloce czasowej
                $(idDialog).dialog("close");
            }, 8000);
            $(idDialog).on("dialogclose", function (event, ui) {
                $(idDialog).remove();
            });

        };

    return {
        inicjacja: inicjacja
    };

});