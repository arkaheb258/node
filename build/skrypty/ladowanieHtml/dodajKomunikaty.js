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

    var ccc,

        aktywujAccordion = function () {
            // Kontener komunikatow
            $("#accordion").accordion({
                animate: varGlobal.czyAnimacjeMale,
                collapsible: false,
                heightStyle: "fill"
            });
        },


        inicjacja = function (nrTab) {
            var fragmentHtml = document.createDocumentFragment(),
                i,
                length,
                divMain,
                div,
                h3,
                ol,
                p;

            divMain = document.createElement('div');
            $(divMain)
                .css({
                    'height': '95%' // ograniczenie żeby nie pokazywał się pasek scrolla
                })
                .attr('id', varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].id);

            length = varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc.length;
            for (i = 0; i < length; i += 1) {

                h3 = document.createElement('h3');
                $(h3)
                    //.attr('title', '') // nadanie pustego opisu tooltipa -> bedzie zastapiony przez ikonki w skrypcie komunikaty/tooltip.js
                    .attr('id', 'idAccordion_' + varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc[i].id) // id naglowka potrzebne do wyswietlania tooltipow z podpowiedziami nawigacji z klawiatury
                    .text(varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc[i].OPIS);
                $(divMain).append(h3);

                div = document.createElement('div');
                ol = document.createElement('ol');
                $(ol)
                    .addClass('selectable')
                    .attr('id', varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc[i].id);
                $(div).append(ol);
                $(divMain).append(div);
            }

            $(fragmentHtml).append(divMain);
            $("#tab" + (nrTab + 1)).append(fragmentHtml);
            aktywujAccordion();
        };

    return {
        inicjacja: inicjacja
    };

});


// Taka struktura sie tworzy:
//             <div id="accordion">
//                <h3>_Alarmy</h3>
//                <div>
//                    <ol class="selectable" id='listaAlarmy'></ol>
//                </div>
//                <h3>_Ostrzezenia</h3>
//                <div>
//                    <ol class="selectable" id='listaOstrzezenia'></ol>
//                </div>
//                <h3>_Zalozone blokady</h3>
//                <div>
//                    <ol class="selectable" id='listaBlokady'></ol>
//                </div>
//                <h3>_Historia komunikatow</h3>
//                <div>
//                    <ol class="selectable" id='listaHistoria'></ol>
//                </div>
//            </div>
