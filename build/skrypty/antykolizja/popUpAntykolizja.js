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
        timerUruchomiony = false,


        uruchomTimer = function () {
            var minuty = 30;

            timerUruchomiony = true;
            $("#DialogPopUpAntykolizja").one("dialogclose", function (event, ui) {
                $("#DialogPopUpAntykolizja").remove();
                clearTimeout(timeoutID);
                timeoutID = setTimeout(function () { // zamkniecie i zniszczenie okienka po zwloce czasowej
                    timerUruchomiony = false;
                }, (minuty * 60 * 1000));
            });

            $("#DialogPopUpAntykolizja").dialog("close");
        },


        zamknij = function () {
            if ($("#DialogPopUpAntykolizja").length > 0) { // zniszczenie okienka popoup jeśli otwarte
                $("#DialogPopUpAntykolizja").remove();
            }
            timeoutID = 0;
            timerUruchomiony = false;
        },


        inicjacja = function () {
            var tabIndex,
                div,
                p;

            if (($("#DialogPopUpAntykolizja").length === 0) && (timerUruchomiony === false)) {
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-state-error')
                    .addClass('ui-corner-all')
                    .css({
                        'padding': '5% 0' // wycentrowanie tekstu w pionie
                    })
                    .attr('id', 'DialogPopUpAntykolizja');
                $('body').append(div);

                p = document.createElement("p");
                $(p)
                    .attr('id', 'tekstPopUpuAntykolizja')
                    .addClass('ui-corner-all')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.antykolizja)
                    .css({
                        'padding': '1% 0', // wycentrowanie tekstu w pionie
                        'font-size': '1.5em',
                        'font-weight': 'bold',
                        'text-align': 'center',
                        'letter-spacing': '0.1em',
                        'width': '100%'
                    });
                $("#DialogPopUpAntykolizja").append(p);

                $("#DialogPopUpAntykolizja").dialog({
                    autoOpen: false,
                    modal: true,
                    closeOnEscape: true,
                    height: 'auto', // ($(document).height() / 10)
                    width: '80%',
                    position: {
                        my: "center",
                        at: "center",
                        of: window
                    }
                });

                $("#DialogPopUpAntykolizja").siblings('.ui-dialog-titlebar').remove();
                $("#DialogPopUpAntykolizja").dialog("open");
            }
        };


    return {
        inicjacja: inicjacja,
        uruchomTimer: uruchomTimer
    };

});
