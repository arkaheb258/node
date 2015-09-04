/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */


define(['jquery', 'zmienneGlobalne', 'komunikaty/popUpAlarm'], function ($, varGlobal, popUpAlarm) {
    'use strict';

    var config,


        inicjacja = function (_config) {
            var zezwolenie = true,
                tekst = '',
                czyJestZalozonaBlokada = false;

            config = { // Konfiguracja wstępna
                selected: _config.selected,
                parentId: _config.parentId
            };

            // najpierw sprawdznie czy komunikat ma możliwość blokowania
            if ($(config.selected).hasClass('nieBlokowalny')) {
                popUpAlarm.inicjacja(': ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.nieBlokowalny + '!!!');
                zezwolenie = false;
            } else {
                // potem sprawdzenie czy użytkownik ma odpowiedni poziom dostęþu
                if ($(config.selected).hasClass('dostepUser')) {
                    switch (varGlobal.poziomDostepu) {
                    case 'Brak':
                        zezwolenie = false;
                        break;
                    }
                }
                if ($(config.selected).hasClass('dostepUser2')) {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[2];
                    switch (varGlobal.poziomDostepu) {
                    case 'Brak':
                    case 'User':
                        zezwolenie = false;
                        break;
                    }
                }
                if ($(config.selected).hasClass('dostepSrvc')) {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[3];
                    switch (varGlobal.poziomDostepu) {
                    case 'Brak':
                    case 'User':
                    case 'User2':
                        zezwolenie = false;
                        break;
                    }
                }
                if ($(config.selected).hasClass('dostepAdv')) {
                    tekst = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.poziomDostepuUzytkownika[4];
                    switch (varGlobal.poziomDostepu) {
                    case 'Brak':
                    case 'User':
                    case 'User2':
                    case 'Srvc':
                        zezwolenie = false;
                        break;
                    }
                }

                // Jest założona blokada - wszyscy użytkownicy mają mieć możliwość jej ściągnięcia
                if ($(config.selected).hasClass('User') || $(config.selected).hasClass('Srvc') || $(config.selected).hasClass('Adv')) {
                    zezwolenie = true;
                }
                
                if (!zezwolenie) {
                    popUpAlarm.inicjacja(': ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakDostepu + ': ' + tekst.toUpperCase());
                }
            }

            if (zezwolenie) {
                require(['komunikaty/zalozBlokade'], function (blokady) {
                    blokady.otworzDialog(config.parentId);
                });
            }

            return zezwolenie;
        };


    return {
        inicjacja: inicjacja
    };
});