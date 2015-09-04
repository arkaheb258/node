/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global require, define */


// sprawdzenie poprawnosci ladowania plikow jsona
define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';

    var czyBladJson = false,
        defer = new $.Deferred(),
        idDiv = "#idDivWatchdogOutput",
        tekstBledu = '',
        inicjalizacja = false,
        initParametry = false,
        initSygnaly = false,


        sprawdzPlikJson = function (_sciezkaDoPliku) {

            $.getJSON(_sciezkaDoPliku, function (json) {
                console.log(json);
                if ($.type(json) === "string") { // blad - powienien byc obiekt
                    tekstBledu += json;
                    $(idDiv).append('<br/>');
                    czyBladJson = true;
                }
            });
        },


        inicjacja = function () {
            console.log('watchdog start');

            // start watchdoga po zwloce czasowej - serwer musi mieć czas na podstawienie plików
//            setTimeout(function () {
//                if (!inicjalizacja) {
//                    inicjalizacja = true;
//                }
//            }, 5000);





            setInterval(function () {

                if (!inicjalizacja) {
                    return;
                }


                console.log(varGlobal.parametry);

                if (varGlobal.parametry === undefined) {
                    if (!initParametry) {
                        initParametry = true;
                        sprawdzPlikJson("json/parametry.json");
                        console.log('blad parametrow');
                    }
                }


                //console.log(varGlobal.sygnaly);
                if (!varGlobal.sygnaly) {
                    if (!initSygnaly) {
                        initSygnaly = true;
                        sprawdzPlikJson("json/sygnaly.json");
                        console.log('blad sygnalow');
                    }
                }




                if (czyBladJson) {
                    console.log('wyswietl blad');
                    $('#idDivWatchdogOutput')
                        .text(tekstBledu)
                        .css({
                            'font-size': '1.5em',
                            'border': '0.1em solid',
                            'border-color': 'black',
                            'border-radius': '1em',
                            'margin': '1em',
                            'padding': '1em'
                        });

                } else {

                    defer.resolve("enter");


                    setTimeout(function () {
                        //$('#idDivWatchdogOutput').text('ok');
                    }, 4000);

                }




            }, 3000);





        };

    return { // Metody publiczne
        inicjacja: inicjacja
    };
});