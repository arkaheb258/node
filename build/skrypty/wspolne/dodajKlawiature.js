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

        inicjacja = function (obiekt2, nazwaDialog) {
            var input,
                p,
                layoutKlawiatury,
                layoutCustArray = [];


            if ((obiekt2.TYP === 'pLiczba') || (obiekt2.TYP === 'pCzas')) { // Dla wartosci liczbowej dodanie informacji o zakresie MIN, MAX oraz dozwolonej precyzji
                p = document.createElement('p');
                $(p)
                    .attr('id', 'pZakresPrecyzja')
                    .text(varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramZakres + ': [' + obiekt2.MIN + ' ÷ ' + obiekt2.MAX + ']. ' + // .toFixed(0)
                        varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramPrecyzja + ': ' + obiekt2.PREC + ' ' + varGlobal.danePlikuKonfiguracyjnego.TEKSTY.paramPrecyzja2)
                    .css({
                        'letter-spacing': '0.1em',
                        'text-align': 'left',
                        'border-radius': '0.5em',
                        'width': '100%'
                    });
                $("#" + nazwaDialog).append(p);
            }

            input = document.createElement('input'); // Dynamiczne dodanie elementow skladajacych sie na klawiature
            $(input)
                .attr('id', 'keyboard')
                .attr('type', 'text')
                .addClass('keyboardNavi')
                .css({
                    'font-size': '1.5em',
                    'text-align': 'center',
                    'width': '15em'
                });
            $("#" + nazwaDialog).append(input);

            $("#" + nazwaDialog).dialog({
                buttons: [
                    {
                        disabled: true,
                        text: varGlobal.danePlikuKonfiguracyjnego.TEKSTY.anuluj
                    }
                ]
            });

            switch (obiekt2.TYP) { // Wyswietlenie odpowiedniej klawiatury do zadanej zmiennej ( dana typu real nie potrzebuje pelnej qwerty)
            case 'pCzas':
                layoutKlawiatury = 'custom';
                //layoutCustArray = [' 5 6 7 8 9', '0 1 2 3 4', 'T # {bksp}', 'd h m s', '{accept} {cancel}'];
                layoutCustArray = ['7 8 9', '4 5 6', '1 2 3', '0 . {bksp}', '{accept} {cancel}'];
                break;

            case 'pLiczba':
                layoutKlawiatury = 'custom';
                layoutCustArray = [' 5 6 7 8 9', '0 1 2 3 4', '- . {bksp}', '{accept} {cancel}'];
                break;

            case 'pString':
                layoutKlawiatury = 'qwerty';
                break;
            }

            $('#keyboard')
                .keyboard({
                    alwaysOpen: true, // false
                    stayOpen: true, // false
                    layout: layoutKlawiatury,
                    usePreview: false,
                    initialFocus: false,
                    customLayout: {
                        'default': layoutCustArray
                    }
                })
                .addNavigation({
                    position: [0, 0], // set start position [row-number, key-index]
                    toggleMode: true, // true = navigate the virtual keyboard, false = navigate in input/textarea
                    focusClass: 'hasFocus' // css class added when toggle mode is on
                });
            $('#keyboard').addClass("kopex-selected").focus();
        };


    return { // Metody publiczne
        inicjacja: inicjacja
    };
});
