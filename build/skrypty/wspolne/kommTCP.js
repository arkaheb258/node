/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/

define(['jquery', 'zmienneGlobalne', 'wspolne/brakPolTCP'], function ($, varGlobal, brakPolTCP) {
    'use strict';


//  ____    _____      _      ____    _____                             _                                                _             _     ___    ___       _
// / ___|  |_   _|    / \    |  _ \  | ____|            _ __     __ _  | |_   _ __   ____           ___    ___     ___  | | __   ___  | |_  |_ _|  / _ \     (_)___
// \___ \    | |     / _ \   | |_) | |  _|     _____   | '_ \   / _` | | __| | '__| |_  /          / __|  / _ \   / __| | |/ /  / _ \ | __|  | |  | | | |    | / __|
//  ___) |   | |    / ___ \  |  _ <  | |___   |_____|  | |_) | | (_| | | |_  | |     / /           \__ \ | (_) | | (__  |   <  |  __/ | |_   | |  | |_| |  _ | \__ \
// |____/    |_|   /_/   \_\ |_| \_\ |_____|           | .__/   \__,_|  \__| |_|    /___|          |___/  \___/   \___| |_|\_\  \___|  \__| |___|  \___/  (_)/ |___/
//                                                     |_|                                                                                                 |__/


    var i,
        intervalId,
        wznowKomunikacje = false,
        timeoutId = 0,
        timeoutIdNodexPLC = 0,
        //init,
        //restartInit = false,
        daneTCP = {
            timeStamp_s: 0,
            timeStamp_ms: 0,
            timeStamp_js: 0,
            analog: [],
            bit: [],
            mesg: [],
            mesgType: [],
            mesgStatus: [],
            blockUser: [],
            blockSrvc: [],
            blockAdv: []
        },


        policzKomunikaty = function () {
            var ccc,
                sprawdzWordBlokad = function (val) {
                    var i,
                        licznik = 0,
                        maska = 1;

                    for (i = 0; i < 16; i += 1) {
                        if (val & maska) {
                            licznik += 1; // Licznik zalozonych kblokad
                        }
                        maska = maska << 1;
                    }
                    return licznik;
                },
                sprawdzWordKomunikatow = function (val, inx) {
                    var i,
                        maska = 1;

                    for (i = 0; i < 16; i += 1) {
                        if (val & maska) {
                            if (daneTCP.mesgType[inx] & maska) { //Sprawdzenia czy mamy do czynienia z alarmem czy ostrzezeniem MESG_TYPE: 0-alarm, 1-ostrzezenie
                                varGlobal.komunikaty.ostrz += 1;
                            } else {
                                varGlobal.komunikaty.alarmy += 1;
                            }
                        }
                        maska = maska << 1;
                    }
                };

            varGlobal.blokady.zalUser = 0; // Liczniki ilosci aktywnych blokad
            varGlobal.blokady.zalSrvc = 0;
            varGlobal.blokady.zalAdv = 0;
            $.each(daneTCP.blockUser, function (index, value) {
                varGlobal.blokady.zalUser += sprawdzWordBlokad(value);
            });
            $.each(daneTCP.blockSrvc, function (index, value) {
                varGlobal.blokady.zalSrvc += sprawdzWordBlokad(value);
            });
            $.each(daneTCP.blockAdv, function (index, value) {
                varGlobal.blokady.zalAdv += sprawdzWordBlokad(value);
            });

            varGlobal.komunikaty.alarmy = 0;
            varGlobal.komunikaty.ostrz = 0;
            $.each(daneTCP.mesg, function (index, value) {
                sprawdzWordKomunikatow(value, index);
            });
        },


        wyzerujRamkeTCP = function () { // wyzerowanie ramki po stracie polaczenia
            var i;

            for (i = 0; i < daneTCP.analog.length; i += 1) {
                if (daneTCP.analog[i] !== undefined) {
                    daneTCP.analog[i] = 0;
                }
            }
            for (i = 0; i < daneTCP.bit.length; i += 1) {
                if (daneTCP.bit[i] !== undefined) {
                    daneTCP.bit[i] = 0;
                }
            }
            for (i = 0; i < daneTCP.mesg.length; i += 1) {
                if (daneTCP.mesg[i] !== undefined) {
                    daneTCP.mesg[i] = 0;
                    //daneTCP.mesgType[i] = 0;
                }
            }
        },


        pobierzDane = function () {
            var tekstBleduPol;

            if (wznowKomunikacje) { // po dluzszym braku polaczenia ajax przestaje sie restartowac, dlatego tutaj jest chwilowe wylaczenie wywolywania zapytan ajaxa
                if (timeoutId === 0) {
                    timeoutId = setTimeout(function () {
                        wznowKomunikacje = false;
                        tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                        $("#brakPolTCP1").text(tekstBleduPol);
                        $("#brakPolTCP2").text('Reset komunikacji...');
                        clearTimeout(timeoutId); // reset timera przy wznowieniu nawigacji pomiedzy node<->chrome
                        timeoutId = 0;
                    }, 3000);
                }
            } else {
                $.ajax({
                    url: varGlobal.adresSerweraDane, //"http://127.0.0.1/dane.php?callback=?", //     'http://127.0.0.1/dane.php?callback=?'      "http://192.168.3.100:8888/dane?callback=?"    "http://192.168.3.78/dane.php?callback=?"
                    timeout: 3000, // The time in milliseconds to wait before considering the request a failure.
                    type: "GET", // whether this is a POST or GET request
                    dataType: "json", // the type of data we expect back
                    success: function (obj) {
                        var length,
                            tekstBleduPol,
                            tymczasString = '';

                        if ((obj.error) || (obj.ERROR)) { // w nowej wersji jest zmienione na  obj.error
                            wyzerujRamkeTCP();
                            if (timeoutIdNodexPLC === 0) {
                                timeoutIdNodexPLC = setTimeout(function () { // ustawienie zwloki czasowej na pojawienie sie okienka (na opalni przu urabianiu czesto generowal sie blad braku komunikacji i zaraz znikal)
                                    tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP2; // ""Monitor  -------  Node  ---x---  PLC1"
                                    brakPolTCP.inicjacja(tekstBleduPol, obj.error);
                                }, 2000);
                            }
                            return;
                        } else {
                            if (timeoutIdNodexPLC !== 0) {
                                clearTimeout(timeoutIdNodexPLC); // reset timera przy wznowieniu nawigacji
                                timeoutIdNodexPLC = 0;
                            }
                        }

                        if ($("#DialogBrakKomunikacjiTCP").length > 0) { // zamkniecie  okienka o braku komunikajci - tez z mala zwloka czasowa
                            setTimeout(function () {
                                if ($("#DialogBrakKomunikacjiTCP").hasClass('bladFtp') === false) { // jesli wczesniej okienko nie zostalo utworzone z powodu zlego pobrania plikow po ftp ze sterownika
                                    $("#DialogBrakKomunikacjiTCP").dialog("close");
                                }
                            }, 2000);
                        }

                        if (obj.error === undefined && obj.Analog !== undefined) {
                            daneTCP.timeStamp_s = obj.TimeStamp_s;
                            daneTCP.timeStamp_ms = obj.TimeStamp_ms;
                            daneTCP.timeStamp_js = obj.TimeStamp_js;

                            length = obj.Analog.length;
                            for (i = 0; i < length; i += 1) {
                                if (obj.Analog[i] === null) {
                                    console.log('Brak danych w ramce - nr:' + i);
                                }
                                daneTCP.analog[i] = Math.round(obj.Analog[i] * 100) / 100;
                                if (obj.Bit[i] !== null) {
                                    daneTCP.bit[i] = obj.Bit[i];
                                }
                                if (obj.Mesg[i] !== null) {
                                    daneTCP.mesg[i] = obj.Mesg[i];
                                }
                                if (obj.MesgType[i] !== null) {
                                    daneTCP.mesgType[i] = obj.MesgType[i];
                                }
                                if (obj.MesgStatus[i] !== null) {
                                    daneTCP.mesgStatus[i] = obj.MesgStatus[i];
                                }
                                if (obj.BlockUsr[i] !== null) {
                                    daneTCP.blockUser[i] = obj.BlockUsr[i];
                                }
                                if (obj.BlockSrvc[i] !== null) {
                                    daneTCP.blockSrvc[i] = obj.BlockSrvc[i];
                                }
                                if (obj.BlockAdv[i] !== null) {
                                    daneTCP.blockAdv[i] = obj.BlockAdv[i];
                                }
                            }
                            policzKomunikaty();
                        }
                    },
                    error: function (xhr, status, tekstBleduPol) {
                        wyzerujRamkeTCP();
                        //console.log(daneTCP.analog);
                        console.log('błąd tcp, callback \'error\', status: ' + status);
                        tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                        if (varGlobal.trwaZmianaCzasu === false) {
                            brakPolTCP.inicjacja(tekstBleduPol, status);
                        }
                        wznowKomunikacje = true;
                    },
                    complete: function (xhr, status) {
                        if (status === 'timeot') { // wychwytywanie bledow ktorych nie wylapuje callback 'error'
                            wyzerujRamkeTCP();
                            console.log('błąd tcp, callback \'complete\', status: ' + status);
                            tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                            if (varGlobal.trwaZmianaCzasu === false) {
                                brakPolTCP.inicjacja(tekstBleduPol, status);
                            }
                            wznowKomunikacje = true;
                        }
                    }
                });
            }
        },

        inicjacja = function () {
            console.log('kommTCP - inicjacja');
            intervalId = setInterval(function () {
                pobierzDane();
            }, varGlobal.czasOdswiezaniaSerwer);
        };

    return {
        inicjacja: inicjacja,
        daneTCP: daneTCP
    };
});
