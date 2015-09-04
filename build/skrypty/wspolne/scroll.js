/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define */


define(['jquery', 'zmienneGlobalne', 'scrollTo'], function ($, varGlobal, scroll) {
    'use strict';

    var ccccccc,

        parametry = function () {
            var select,
                selectedIndex;

            select = $('#menu').find(".ui-state-focus");
            $('#DialogParametryLista').stop().scrollTo(select, 800, {
                offset: -50
            });
        },


        rozkazyPLC = function () {
            var select,
                selectedIndex,
                $paneTarget,
                $target;

            select = $('#menuRozkazy').find(".ui-state-focus"); // poziom wyzej aby zaznaczyc wlasciwy element Li a nie anchor href
            selectedIndex = $('#menuRozkazy').find(".ui-state-focus").parent().index();

            $paneTarget = $(select).parent();
            $target = $paneTarget.find('li:eq(' + (selectedIndex) + ')');
            $('#DialogRozkazy').stop().scrollTo($target, 400, { // 800
                //offset: -50  // powoduje dziwne skakanie podswietlenia
            });
        },


        komunikaty = function () { // czasami są dziwne skoki przy zmianie liczby komunikatow -> przy wymuszeniu z brackets/dane.php nie klikac na przegladarce w liste ale np w zakladke TAB
            var select,
                paneTarget;

            select = $(".ui-selected");
            paneTarget = $(select).parent().parent(); // li -> ol -> div
            $(paneTarget).stop().scrollTo(select, 400, {
                offset: -50
                    //margin: true
                    //over: -2.5
            });
        },


        eks = function (selected) {
            var paneTarget; // element w którym znajduję sie lista do skalowania (czyli rodzic buttona)

            paneTarget = $(selected).parent(); // button -> div
            $(paneTarget).stop().scrollTo(selected, 400, {
                offset: -50
            });
        },


        komunikatyTop = function (selected) {
            if (selected !== undefined) {
                selected.parent().parent().scrollTo(0);
            }
        };


    return {
        komunikaty: komunikaty,
        komunikatyTop: komunikatyTop,
        parametry: parametry,
        rozkazyPLC: rozkazyPLC,
        eks: eks
    };


});