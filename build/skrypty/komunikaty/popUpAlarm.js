/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    "use strict";

    var timeoutID,
        idDialog = "#DialogPopUpAlarm",


        inicjacja = function (tekst) {
            var tabIndex,
                div,
                p;


            tabIndex = $('#tabs').tabs("option", "active"); // Pobranie indexu aktywnego tabu
            if (tabIndex < 1) { // nie wyswietlanie okienka na tab1
                return;
            }

            if ($(idDialog).length === 0) {

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-state-error')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                p = document.createElement("p");
                $(p)
                    .attr('id', 'tekstPopUpu')
                    .addClass('ui-corner-all')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.alarm + ' ' + tekst)
                    .css({
                        'margin': '0',
                        'font-size': '1.0em',
                        'text-align': 'left',
                        'height': '100%',
                        'width': '100%'
                    });
                $(idDialog).append(p);

                $(idDialog).dialog({
                    modal: false,
                    closeOnEscape: true,
                    height: ($(document).height() / 8),
                    width: '90%',
                    show: {
                        delay: 200,
                        effect: 'bounce', // shake  bounce  pulsate
                        duration: 1000
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
                $('#tekstPopUpu').text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.alarm + ' ' + tekst);
            }

            clearTimeout(timeoutID);
            timeoutID = setTimeout(function () { // zamkniecie i zniszczenie okienka po zwloce czasowej
                $(idDialog).dialog("close");
            }, 6000);
            $(idDialog).one("dialogclose", function (event, ui) {
                $(idDialog).remove();
                //console.log('niszcze DialogPopUpAlarm ');
            });

        };

    return {
        inicjacja: inicjacja
    };

});
