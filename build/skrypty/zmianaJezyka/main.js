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

    var init = false,
        idDialog = "#dialogZmianaJezyka", // tak będzie nazwane okienko popup
        idButtonPowrot,


        zmmienJezyk = function (_idButtona) {
            var wartoscParametru;

            switch (idButtonPowrot) {
            case "#idJezykPolski":
                wartoscParametru = 0;
                break;
            case "#idJezykRosyjski":
                wartoscParametru = 1;
                break;
            case "#idJezykAngielski":
                wartoscParametru = 2;
                break;
            case "#idJezykHiszpanski":
                wartoscParametru = 3;
                break;
            case "#idJezykChinski":
                wartoscParametru = 4;
                break;
            default:
            }

            require(['progresBar'], function (progresBar) {
                progresBar.inicjacja({
                    show: true,
                    status: 'sending'
                });
            });

            varGlobal.doWyslania.parametr.id = 'rKonfWersjaJezykowa';
            varGlobal.doWyslania.parametr.typ = 'pLista';
            varGlobal.doWyslania.parametr.wartosc = wartoscParametru;
            require(['obslugaJSON'], function (obslugaJSON) {
                obslugaJSON.wyslij(varGlobal.doWyslania.parametr);
                console.log(varGlobal.doWyslania.parametr);
            });
        },


        inicjacja = function (_idButtona) {
            if (!init) {
                init = true;

                $(".klZmianaJezyka").on("click", function (event, ui) {
                    idButtonPowrot = event.target.id;
                    idButtonPowrot = '#' + idButtonPowrot;

                    require(['potwierdzenie'], function (potwierdzenie) {
                        potwierdzenie.inicjacja({ // wywołanie
                            text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.ustaw + ': ' + $(idButtonPowrot).text()
                        }).done(function (odpowiedzAsynch) { // odpowiedź asynchroniczna 
                            // Powrot nawigacji na button wywołujący
                            $(idButtonPowrot).addClass("kopex-selected").addClass(varGlobal.ui_state);

                            switch (odpowiedzAsynch) {
                            case 'enter':
                                zmmienJezyk();
                                break;
                            case 'escape':
                                break;
                            }

                        });
                    });
                });
            }
        };


    return {
        inicjacja: inicjacja

    };

});