/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global idZegartestowy, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery'], function ($) {
    'use strict';

    var ccc,


        odswiez = function (id) {
            setTimeout(function () {
                id.value(5).render();
            }, 2000);
            setTimeout(function () {
                id.value(12).render();
            }, 3000);
            setTimeout(function () {
                id.value(18).render();
            }, 4000);
            setTimeout(function () {
                id.value(40).render();
            }, 5000);
            setTimeout(function () {
                id.value(83).render();
            }, 6000);
            setTimeout(function () {
                id.value(87).render();
            }, 7000);
            setTimeout(function () {
                id.value(98).render();
            }, 8000);
            setTimeout(function () {
                id.value(133).render();
            }, 9000);
            setTimeout(function () {
                id.value(-25).render();
            }, 10000);
            setTimeout(function () {
                id.value(0).render();
            }, 11000);
            setTimeout(function () {
                id.value(100).render();
            }, 12000);
            setTimeout(function () {
                id.value(66.6).render();
            }, 13000);
        },


        inicjacja = function () {
            var nowyZegarGauge = {
                id: 'idZegartestowy',
                opis_pelny: 'Zegar testowy',
                jednostka: 'A',
                ana_min: 0,
                ana_alarm_l: 10,
                ana_warn_l: 20,
                ana_warn_h: 80,
                ana_alarm_h: 90,
                ana_max: 100,
                hist_LoALarm: 5,
                hist_HiALarm: 5

                //                ana_min: 0,
                //                ana_alarm_l: 8,
                //                ana_warn_l: 8,
                //                ana_warn_h: 50,
                //                ana_alarm_h: 50,
                //                ana_max: 50,
                //                hist_LoALarm: 5,
                //                hist_HiALarm: 5
            };

            return nowyZegarGauge;
        };


    return {
        inicjacja: inicjacja,
        odswiez: odswiez
    };


});
