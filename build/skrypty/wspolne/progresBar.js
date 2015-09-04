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

    var idDialog = '#DialogProgressbar',
        config = {},
        init = false,
        defer,
        czyZamknac = false,

        inicjacja = function (_config) {
            var div,
                p, // tutaj bedzie tekst bledu
                divLabel,
                progressbarValue;


            config = { // Konfiguracja wstępna
                show: _config.show || false, // czy rozpocząć wyświetlanie statusu
                status: _config.status, // sending / OK / error
                error: _config.error,
                info: _config.info // informacja do pokazania pod paskiem z animacją (to samo co error ale nie chciało mi się wszędzie w kodzie poprawiać)
            };
            //console.log(config);


            if ($(idDialog).length === 0) {
                if (!config.show) {
                    return;
                }

                defer = new $.Deferred();
                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    autoOpen: false,
                    closeOnEscape: false,
                    width: '40%',
                    height: ($(document).height() / 4), // ($(document).height() / 5)
                    close: function () {
                        $(this).parent().promise().done(function () {
                            //console.log('progress bar remove');
                            $(idDialog).remove();
                            defer.resolve(true);
                        });
                    }
                });
                $(idDialog).siblings('.ui-dialog-titlebar').remove();

                if (varGlobal.czyAnimacjeMale === false) {
                    $(idDialog).dialog("option", "show", false);
                    $(idDialog).dialog("option", "hide", false);
                }

                div = document.createElement('div'); // Stworzenie elementow skladajacych sie na progressbar (dwa divy)
                $(div)
                    .attr('id', 'progressbar')
                    .css({
                        'width': '80%',
                        'text-align': 'center',
                        'margin-left': 'auto',
                        'margin-right': 'auto',
                        'position': 'relative',
                        'top': '20%'
                    });
                divLabel = document.createElement("div");
                $(divLabel)
                    .attr('id', 'progressLabel')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramWys)
                    .css({
                        'letter-spacing': '0.5em',
                        'width': '100%',
                        'float': 'left',
                        'line-height': '200%',
                        'font-weight': 'bold'
                    });
                $(div).append(divLabel);
                $(idDialog).append(div);

                p = document.createElement('p'); // teks bledu zwroconego przez funkcje ajax lub serwer www
                $(p)
                    .attr('id', 'ptekstBledu')
                    .addClass('ui-corner-all')
                    .text('')
                    .css({
                        'position': 'relative',
                        'top': '30%',
                        'text-align': 'center',
                        'width': '100%'
                    });
                $(idDialog).append(p);

                $(idDialog).dialog("open");

                $('#progressbar').progressbar({
                    value: false // Animowane, przesuwajace sie paski zamiast konkretnej wartosci paska postepu
                });

            } else {
                setTimeout(function () { // Po dwoch sekundach poinformowanie o sukcesie lub bledzie wysylania do plc
                    progressbarValue = $("#progressbar").find(".ui-progressbar-value");
                    switch (config.status) {
                    case 'sending':
                        break;
                    case 'OK':
                        progressbarValue.css({
                            background: 'green'
                        });
                        $('#progressLabel').text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.OK); // Wyslano
                        czyZamknac = true;
                        break;
                    case 'error':
                        progressbarValue.css({
                            background: 'red'
                        });
                        $('#progressLabel').text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.blad); // Blad
                        $('#ptekstBledu').text(config.error);
                        czyZamknac = true;
                        break;
                    default:
                        //console.log('zły parametr wejściowy dla progresBar');
                    }

                    if (czyZamknac) {
                        czyZamknac = false;
                        setTimeout(function () {
                            $(idDialog).dialog("close");
                        }, 2000);
                    }

                }, 1000);
                $('#ptekstBledu').text(config.info);
            }

            return defer;
        };

    return { // Widocznosc modulu
        inicjacja: inicjacja
    };
});