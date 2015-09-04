/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define */

define(['jquery'], function ($) {
    'use strict';

    var ccc,

        inicjacja = function (_kierunki) {
            var fragmentHtml = document.createDocumentFragment(),
                span,
                p,
                kierunkiNawigacji = [],
                i,
                dodajIkonke = function (_typIkonki) {
                    var tekstIkonki;

                    switch (_typIkonki) {
                    case 'g':
                        tekstIkonki = 'ui-icon-circle-arrow-n';
                        break;
                    case 'd':
                        tekstIkonki = 'ui-icon-circle-arrow-s';
                        break;
                    case 'l':
                        tekstIkonki = 'ui-icon-circle-arrow-w';
                        break;
                    case 'p':
                        tekstIkonki = 'ui-icon-circle-arrow-e';
                        break;
                    case 'ent':
                        tekstIkonki = 'ui-icon-circle-check';
                        break;
                    case 'esc':
                        tekstIkonki = 'ui-icon-circle-close';
                        break;
                    }

                    span = document.createElement('span');
                    $(span)
                        .addClass('ui-icon')
                        .addClass(tekstIkonki)
                        .css({ //'zoom': '120%',
                            'float': 'left'
                        })
                        .appendTo(p);
                    $(fragmentHtml).append(p);
                };

            p = document.createElement('p');
            $(p).css({
                'margin': '0'
            });

            kierunkiNawigacji = _kierunki.split('_');
            for (i = 0; i < kierunkiNawigacji.length; i += 1) {
                dodajIkonke(kierunkiNawigacji[i]);
            }
            return fragmentHtml;
        };

    return {
        inicjacja: inicjacja
    };

});
