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


        allignVertical = function (idDialog) { // wycentrowanie buttonów w ich kontenerze w osi Y
            var top,
                iloscButtonow,
                wysokoscButtona,
                wysokoscDiv;
            
            wysokoscDiv = $(idDialog).height();
            iloscButtonow = $(idDialog).children().length;
            wysokoscButtona = $(idDialog).children().first().outerHeight(true); // wysokość jednego buttona z marginesami

            top = (wysokoscDiv - (iloscButtonow * wysokoscButtona)) / 2.5; // wyrównanie nie idealnie równo lecz trochę podniesione w górę -> dlatego dzielone przez 3  a nie 2
            $(idDialog).children().css({
                'top': top
            });
        },


        dodajElementyHtml = function (menu, klasa) { // Stworzenie malego menu z buttonow (np. wybor poziomu dostepu itp)
            var i,
                fragMenu = document.createDocumentFragment(),
                button;

            for (i = 0; i < menu.length; i += 1) {
                if (menu[i].widocznosc) {
                    button = document.createElement('button');
                    $(button)
                        .text(menu[i].OPIS)
                        .addClass(menu[i].dostep)
                        .addClass(klasa)
                        .css({
                            'width': '75%', // 60
                            'font-weight': 'normal'
                        })
                        .attr('id', menu[i].id);
                    $(fragMenu).append(button); // Zwiekszenie wydajnosci - chcemy jak najmniej operacji na DOM (append na zewnatrz petli for)
                }
            }
            return fragMenu;
        };
    



    return { // Metody publiczne
        dodajElementyHtml: dodajElementyHtml,
        allignVertical: allignVertical
    };
});
