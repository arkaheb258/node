/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require */


define(['jquery', 'obslugaJSON', 'zmienneGlobalne', 'kommTCP'], function ($, json, varGlobal, dane) {
    "use strict";

    var init = false,
        daneDoOdswiezania = [],
        data = new Date(), //"October 13, 1975 11:13:00"


        odswiezajZegar = function () {
            var d1 = new Date("October 13, 1975 11:13:00"),
                tekstDaty,
                zeroWiodace = function (i) {
                    return (i < 10) ? '0' + i : i;
                };

            data.setTime(dane.daneTCP.timeStamp_js);

            tekstDaty = data.getUTCFullYear() + '/' + zeroWiodace(data.getUTCMonth() + 1) + '/' + zeroWiodace(data.getUTCDate()) + ' ' +
                zeroWiodace(data.getUTCHours()) + ":" + zeroWiodace(data.getUTCMinutes()) + ":" + zeroWiodace(data.getUTCSeconds());
            varGlobal.data = tekstDaty;

            $('#p_dataCzas').text(tekstDaty);
        },


        inicjacja = function () {
            setInterval(function () {
                odswiezajZegar();
            }, varGlobal.czasOdswiezania);
        };


    return {
        inicjacja: inicjacja
    };
});
