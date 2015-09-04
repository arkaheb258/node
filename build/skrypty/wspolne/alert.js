/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define */


define(['jquery', 'zmienneGlobalne', 'wspolne/odswiezajObiekt'], function ($, varGlobal, odswiezajObiekt) {
    'use strict';

    var idDialog = "#DialogWersjaInfo",
        config = {},
        intervalId,
        zezwolenie = true,

        zamknij = function (_config) {
            $(idDialog).dialog('close');
            clearInterval(intervalId);
            zezwolenie = true;
        },


        inicjacja = function (_config) {
            var div,
                isOpen,
                i,
                stworzParagraph = function (_miniConf) {
                    var p,
                        conf;

                    conf = {
                        pId: _miniConf.pId,
                        targetId: _miniConf.targetId || '#idDivTeksty',
                        text: _miniConf.text,
                        textAllign: _miniConf.textAllign || 'center',
                        fontWeight: _miniConf.fontWeight || 'normal',
                        margin: _miniConf.margin || ''
                    };

                    p = document.createElement("p");
                    $(p)
                        .attr('id', conf.pId)
                        .text(conf.text)
                        .css({
                            'font-weight': conf.fontWeight,
                            'width': '100%',
                            'text-align': conf.textAllign,
                            'margin': conf.margin
                        });
                    $(conf.targetId).append(p);
                    conf = {};
                };

            config = { // Konfiguracja wstępna
                texts: _config.texts, // tabela z kolejnymi linijkami tekstu
                timer: _config.timer || 0, // czy włączyć timer, czas w ms - po tym czasie zostanie zamknięte okienko alertu
                restart: _config.restart || false, // czy ma nastąpić restart aplikacji (odświeżenie strony)
                escConfirm: _config.escConfirm || false, // czy zamknięcie okienka ma nastąpić po zatwierdzeniu klawiszem ESCAPE przez używkownika
                background: _config.background || "ui-state-error", // 'ui-state-default' 'ui-state-error'
                windowCenter: _config.windowCenter || window, // względem jakiego elementu html ikienko z alarmem ma być wycentrowane
                position: _config.position || 'center', // pozycja wyświetlanego okienka : top, center, bottom

                //alertId: _config.alertId || '#DialogWersjaInfo', // TO DO: instancje: teraz jak już jest alert wyświetlony i z innego punktu programu ma być dodany inny to nic z tego nie bedzie
                initSignal: _config.initSignal || false, // sygna
                interval: _config.interval || 0 // 
            };

            if ($(idDialog).length === 0) { // sprawdzenie czy div już nie istnieje
                //dialogOtwarty = true;

                if (!zezwolenie) {
                    return;
                }

                div = document.createElement("div");
                $(div)
                    .addClass('OknaDialog')
                    .addClass('ui-corner-all')
                    .addClass(config.background)
                    .attr('id', idDialog.replace("#", ""));
                $('body').append(div);

                $(idDialog).dialog({
                    modal: true,
                    minHeight: 50,
                    closeOnEscape: _config.escConfirm,
                    height: "auto", // ($(document).height() / 3)
                    width: '40%',
                    show: {
                        delay: 200,
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    hide: {
                        delay: 200,
                        effect: varGlobal.efektShowHide,
                        duration: 350
                    },
                    close: function () {
                        $(this).parent().promise().done(function () { // zniszczeniu dialogu po ukończeniu animacji zamykania
                            $(idDialog).remove();

                            //dialogOtwarty = false;
                            if (config.interval > 0) {
                                zezwolenie = false; // następne zezwolenie na wyświetlenie alarmu po upłynięciu czasu okreśłonego w config.interval
                                clearInterval(intervalId);
                                intervalId = setInterval(function () {
                                    zezwolenie = true;
                                    //console.log(intervalId);
                                }, config.interval);

                            }
                        });
                    }
                });
                $(idDialog).siblings('.ui-dialog-titlebar').remove();
                $(idDialog).dialog("open");

                div = document.createElement("div");
                $(div)
                    .attr('id', 'idDivTeksty')
                    .css({
                        'border': '0.1em solid',
                        'border-color': 'black',
                        'border-radius': '1em',
                        'margin': '0.1em'
                    });
                $(idDialog).append(div);

                // Dodanie tekstów
                for (i = 0; i < config.texts.length; i += 1) {
                    stworzParagraph({
                        pId: 'idAlertText_0' + i,
                        targetId: '#idDivTeksty',
                        text: config.texts[i]
                    });
                }

                // Jeśli klawisz ESCAPE zamyka okienko - wyświetlenie informacji o tym
                if (config.escConfirm) {
                    stworzParagraph({
                        pId: 'idAlertTextESC',
                        targetId: idDialog,
                        text: 'ESCAPE - zamknij',
                        textAllign: 'right',
                        fontWeight: 'bold',
                        margin: '0'
                    });
                }

                // wycentrowanie tylko wtedy gdy okienko względem którego ma być wyświetlany alert już istnieje
                //                if ((config.windowCenter !== window) && ($(config.windowCenter).is(":visible"))) { }
                $(idDialog).dialog("option", "position", {
                    my: config.position,
                    at: config.position,
                    of: config.windowCenter // window
                });

                // Ustawienie timera
                if (config.timer > 0) {
                    setTimeout(function () {
                        $(idDialog).dialog('close');
                        if (config.restart) { // restart tylko przy użyciu timera
                            console.log('restart');
                            location.reload();
                        }
                        config = {};
                    }, config.timer);
                }

            } else {
                console.log('dialog alert juz otwarty!');
            }

            return idDialog; // zwrocenie nazwy dialogu z okienkiem alertu - mozna w wyzszej funkcji to wykorzystac do ręcznego zamknięcia
        };

    return { // Metody publiczne
        inicjacja: inicjacja,
        zamknij: zamknij
    };
});