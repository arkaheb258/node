/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */

// skrypt obsługujący wyświetlanie potwierdzeń różnych czynności użytkownik - np. czy chce na pewno zmienić język itp
define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var idDialog = "#dialogPotwierdzenie222",
        defer, // wywolanie asynchroniczne


        nawigacjaWykonaj = function (kod, selected) {
            switch (kod) {
            case varGlobal.kodyKlawiszy.lewo:
            case varGlobal.kodyKlawiszy.prawo:
            case varGlobal.kodyKlawiszy.gora:
            case varGlobal.kodyKlawiszy.dol:
                break;
            case varGlobal.kodyKlawiszy.enter:
                defer.resolve("enter");
                $(idDialog).dialog('close');
                return;
            case varGlobal.kodyKlawiszy.escape:
                defer.resolve("escape");
                $(idDialog).dialog('close');
                break;
            default:
            }
        },


        inicjacja = function (_config) {
            var div,
                p;

            this.config = { // Konfiguracja wstępna
                text: _config.text,
                icon: _config.icon
            };

            defer = new $.Deferred();
            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .attr('id', idDialog.replace("#", ""))
                    .css({
                        'border': '0.1em solid',
                        'border-color': 'grey',
                        'padding': '1em',
                        'margin': '1em'
                    });
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    title: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.potwierdzenie,
                    closeOnEscape: false,
                    width: '50%',
                    height: 'auto',
                    minHeight: 50,
                    effect: varGlobal.efektShowHide,
                    buttons: [
                        {
                            disabled: true,
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.zatwierdz
                        },
                        {
                            disabled: true,
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
                        }
                    ],
                    show: {
                        delay: 200,
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    hide: {
                        effect: varGlobal.efektShowHide,
                        duration: 250
                    },
                    close: function () {
                        $(this).parent().promise().done(function () { // zniszczeniu dialogu po ukończeniu animacji zamykania
                            $(idDialog).remove();
                        });
                    }
                });

                p = document.createElement('p');
                $(p)
                    .attr('id', 'pPodmianaPLCopis')
                    .text(this.config.text)
                    .css({
                        'font-style': 'italic',
                        'font-size': '1.2em',
                        'text-align': 'center',
                        'border-radius': '0.5em'
                    });
                $(idDialog).append(p);
                $(idDialog).dialog("open");
                $(idDialog).addClass("kopex-selected");
            }

            return defer;
        };


    return { // Metody publiczne
        inicjacja: inicjacja,
        nawigacjaWykonaj: nawigacjaWykonaj
    };
});