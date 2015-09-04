/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt, gaugeKMSA */
/*jslint nomen: true*/
/*global  define, require*/

define(['jquery', 'zmienneGlobalne', 'kommTCP', 'diagnostykaGauge/gaugeKM', 'diagnostykaGauge/testyGauge', 'ustawKolejnosc'], function ($, varGlobal, dane, gaugeKM, testyGauge, ustawKolejnosc) { // , 'raphael', 'eve', 'justgage'      , raphael, eve, justgage
    'use strict';

    var init = false,


        inicjacja = function (daneWej) {
            var i,
                intervalId,
                div,
                length,
                plc_id,
                kontrolkiGage = [],
                daneWejKolejne = [];

            daneWejKolejne = ustawKolejnosc.inicjacja({
                inputData: daneWej,
                sortData: true
            });

            //  ____     ___         _____   _____   ____    _____    ___   __        __
            // |  _ \   / _ \       |_   _| | ____| / ___|  |_   _|  / _ \  \ \      / /
            // | | | | | | | |        | |   |  _|   \___ \    | |   | | | |  \ \ /\ / /
            // | |_| | | |_| |        | |   | |___   ___) |   | |   | |_| |   \ V  V /
            // |____/   \___/         |_|   |_____| |____/    |_|    \___/     \_/\_/
            //            daneWejKolejne.push(testyGauge.inicjacja());
            //            setTimeout(function () {
            //                testyGauge.odswiez(kontrolkiGage[kontrolkiGage.length - 1]);
            //            }, 3000);

            //console.log(daneWejKolejne);
            length = daneWejKolejne.length;
            for (i = 0; i < length; i += 1) {
                div = document.createElement("div"); // Kontrolki gauge musza byc umieszczone w elementach div
                $(div)
                    .addClass('Gauge')
                    .css({
                        'padding-top': '0.5em'
                    })
                    .attr('id', daneWejKolejne[i].id);
                $('.kontenerGauge').append(div);
            }

            $("#dialogDiagnostykaGauge").dialog("open"); // Otwarcie dialogu
            $("#dialogDiagnostykaGauge").one("dialogclose", function (event, ui) { // po zamknieciu okenka zakonczenie odswieznia danych
                clearInterval(intervalId);
                kontrolkiGage = null;
                daneWejKolejne = null;
            });

            for (i = 0; i < length; i += 1) {
                plc_id = '';
                if (daneWejKolejne[i].plc_id !== undefined) {
                    plc_id = daneWejKolejne[i].plc_id + ' - ';
                }

                kontrolkiGage[i] = gaugeKM.init(document.getElementById(daneWejKolejne[i].id))
                    .label(plc_id + daneWejKolejne[i].opis_pelny)
                    .decimals(1)
                    .arcThickness(0.7)
                    .minValue(parseFloat(daneWejKolejne[i].ana_min))
                    .maxValue(parseFloat(daneWejKolejne[i].ana_max))
                    .units(daneWejKolejne[i].jednostka)
                    .sectorsThicknes(0.25)
                    .value(0)
                    .dane([
                        { // Ustawienie sektow z odpowiednimi kolorami
                            color: "red",
                            lo: parseFloat(daneWejKolejne[i].ana_min),
                            hi: parseFloat(daneWejKolejne[i].ana_alarm_l),
                            histLo: parseFloat(daneWejKolejne[i].hist_LoALarm)
                        },
                        {
                            color: "yellow",
                            lo: parseFloat(daneWejKolejne[i].ana_alarm_l),
                            hi: parseFloat(daneWejKolejne[i].ana_warn_l)
                        },
                        {
                            color: "green",
                            lo: parseFloat(daneWejKolejne[i].ana_warn_l),
                            hi: parseFloat(daneWejKolejne[i].ana_warn_h)
                        },
                        {
                            color: "yellow",
                            lo: parseFloat(daneWejKolejne[i].ana_warn_h),
                            hi: parseFloat(daneWejKolejne[i].ana_alarm_h)
                        },
                        {
                            color: "red",
                            lo: parseFloat(daneWejKolejne[i].ana_alarm_h),
                            hi: parseFloat(daneWejKolejne[i].ana_max),
                            histHi: parseFloat(daneWejKolejne[i].hist_HiALarm)
                        }
                    ])
                    .render();
            }

            intervalId = setInterval(function () { //przechwycenie Id funkcji setInterval, po zamknieciu okna bedzie mozliwe zakonczenie odswiezania
                var wartoscAnaloguPoPrzeliczeniu;



                length = daneWejKolejne.length;
                for (i = 0; i < length; i += 1) {
                    if (dane.daneTCP.analog[daneWejKolejne[i].poz_ramka] !== undefined) {
                        wartoscAnaloguPoPrzeliczeniu = dane.daneTCP.analog[daneWejKolejne[i].poz_ramka] / daneWejKolejne[i].mnoznik;
                        kontrolkiGage[i].value(wartoscAnaloguPoPrzeliczeniu).render();

                        //                        if (daneWejKolejne[i].id === 'idTempLozyskKoszSitowy') {
                        //                            console.log(wartoscAnaloguPoPrzeliczeniu);
                        //                        }
                    }
                }
            }, 500); // varGlobal.czasOdswiezania
        };


    return {
        inicjacja: inicjacja
    };

});