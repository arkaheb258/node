/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/

define(['jquery', 'zmienneGlobalne', 'wspolne/brakPolTCP', 'socketio'], function ($, varGlobal, brakPolTCP, _io) {
    'use strict';

    var i,
        timeoutIdNodexVisu = 0,
        timeoutIdNodexPLC = 0,
        timeoutIdNoNewData = 0,
        poprzedniaRamka,
        init = false,
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
        daneDiag = {
            sID: '',
            DigitData: [],
            AnalogData: []
        },
        socket = _io(),


        policzKomunikaty = function () {
            var ccc,
                sprawdzWordBlokad = function (val) {
                    var i,
                        licznik = 0,
                        maska = 1;

                    for (i = 0; i < 16; i += 1) {
                        if (val & maska) {
                            licznik += 1; // Licznik zalozonych blokad
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
                }
            }
            varGlobal.komunikaty.alarmy = 0;
            varGlobal.komunikaty.ostrz = 0;
        },


        rozkazSIO = function (_obiekt) {
            var tablPobranychPlikow = [],
                tempString = '',
                time = 5000;

            console.log(_obiekt);
            require(['progresBar'], function (progresBar) {
                progresBar.inicjacja({
                    show: true,
                    status: 'sending'
                });

                socket.emit(_obiekt.ioEmit, _obiekt.ioMess);
                if (!init) {
                    init = true;
                    socket.on(_obiekt.ioOn, function (_str) {
                        console.log(_str);
                        switch (_str) {
                        case 'OK':
                        //case 'error':
                            progresBar.inicjacja({
                                status: 'OK',
                                info: 'Zakończono pobieranie plików'
                            });
                            tablPobranychPlikow.unshift("Pobrano pliki:");
                            require(['alert'], function (alert) {
                                alert.inicjacja({
                                    texts: tablPobranychPlikow,
                                    background: 'ui-state-default',
                                    timer: time
                                });
                                setTimeout(function () {
                                    alert.inicjacja({
                                        texts: [
                                            varGlobal.danePlikuKonfiguracyjnego.TEKSTY.restart
                                        ],
                                        timer: time,
                                        restart: true
                                    });
                                }, time + 1000);
                            });
                            break;
                        case 'err':
                            progresBar.inicjacja({
                                status: 'error'
                            });
                            break;
                        default:
                            if (_str.search('flash') === -1) {
                                tempString += _str + ', ';
                            } else { // znaleziono wpis o oinformacji z jakiego katalogu są pobierane pliki
                                tablPobranychPlikow.push(tempString);
                                tempString = '';
                                tablPobranychPlikow.push('--- KATALOG: ' + _str + ' ---');
                            }
                            progresBar.inicjacja({
                                info: 'Pobieram: ' + _str // nazwy pobieranych plików
                            });
                        }
                    });
                }
            });
        },


        pobierzDane = function () { // rejestracja trzech zdarzeń do obsługi połączenia z socketem.io
            var tekstBleduPol,
                length,
                timeout = 2000,
                startKomunikacji = false,
                timeoutInit;

            // przypadek gdy serwer nie zainicjuje komunikacji (nie odpali żadnego ze zdarzeń)
            setTimeout(function () {
                if (!startKomunikacji) {
                    tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                    brakPolTCP.inicjacja(tekstBleduPol, 'Brak inicjacji komunikacji z serwerem node');
                }
            }, 5000);


            //                                           _   
            //  _ __ ___  ___ ___  _ __  _ __   ___  ___| |_ 
            // | '__/ _ \/ __/ _ \| '_ \| '_ \ / _ \/ __| __|
            // | | |  __/ (_| (_) | | | | | | |  __/ (__| |_ 
            // |_|  \___|\___\___/|_| |_|_| |_|\___|\___|\__|
            //                                           
            socket.on('reconnecting', function () {
                console.log('socket.io - reconnecting');
                tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                brakPolTCP.inicjacja(tekstBleduPol, 'socket.io - reconnecting');
                setTimeout(function () { // uzyskanie migania reconnecting/disconnected
                    brakPolTCP.inicjacja(tekstBleduPol, 'socket.io - disconnected');
                }, 1000);
            });
            socket.on('connect', function () {
                console.log('socket.io - connected');
            });
            socket.on('disconnect', function () {
                console.log('socket.io - disconnected');
                setTimeout(function () {
                    wyzerujRamkeTCP();
                    tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                    brakPolTCP.inicjacja(tekstBleduPol, 'socket.io - disconnected');
                }, timeout);
            });


            //            __               _     
            //  _ __ ___ / _|_ __ ___  ___| |__  
            // | '__/ _ \ |_| '__/ _ \/ __| '_ \ 
            // | | |  __/  _| | |  __/\__ \ | | |
            // |_|  \___|_| |_|  \___||___/_| |_|
            //                               
            socket.on('refresh', function (_obj) {
                location.reload();
            });


            //   __ _ _ __   __ _ _ __ 
            //  / _` | '_ \ / _` | '__|
            // | (_| | |_) | (_| | |   
            //  \__, | .__/ \__,_|_|   
            //  |___/|_|
            socket.on('gpar', function (_obj) {
                console.log('gpar - zmiana parametrow');
                //socket.emit('getDefPar'); // prośba o przysłanie DEFAULTOWEJ struktury plików parametry.json oraz sygnaly.json
                //socket.emit('getDefSyg');

                socket.emit('getPar'); // prośba o przysłanie aktualnej struktury plików parametry.json oraz sygnaly.json
                socket.emit('getSyg');
                require(['parametry/odswiez'], function (odswiez) {
                    odswiez.przeladuj(); // odświeżenie listy parametrów
                });
            });
            socket.on('actPar', function (_obj) { // actual
                varGlobal.parametry = _obj;
            });
            socket.on('actSyg', function (_obj) { // actual
                varGlobal.sygnaly = _obj;
            });
            socket.on('defPar', function (_obj) { // default
                varGlobal.parametry = _obj;
            });
            socket.on('defSyg', function (_obj) { // default
                varGlobal.sygnaly = _obj;
            });


            //      _ _                             _         _         
            //   __| (_) __ _  __ _ _ __   ___  ___| |_ _   _| | ____ _ 
            //  / _` | |/ _` |/ _` | '_ \ / _ \/ __| __| | | | |/ / _` |
            // | (_| | | (_| | (_| | | | | (_) \__ \ |_| |_| |   < (_| |
            //  \__,_|_|\__,_|\__, |_| |_|\___/|___/\__|\__, |_|\_\__,_|
            //                |___/                     |___/         
            socket.on('daneDiag', function (obj) {
                //console.log('dane diagnostyczne');
                //console.log(obj);

                daneDiag.DigitData = obj.DigitData;
                daneDiag.AnalogData = obj.AnalogData;
            });


            //      _                  
            //   __| | __ _ _ __   ___ 
            //  / _` |/ _` | '_ \ / _ \
            // | (_| | (_| | | | |  __/
            //  \__,_|\__,_|_| |_|\___|
            socket.on('dane', function (_obj) {
                startKomunikacji = true;

                //console.log(obj);
                // Brak danych z PLC do serwera node
                if ((_obj.error) || _obj.ERROR) {
                    // jesli wczesniej okienko nie zostalo utworzone z powodu zlego pobrania plikow po ftp ze sterownika
//                    if ($("#DialogBrakKomunikacjiTCP").length > 0) {
//                        if ($("#DialogBrakKomunikacjiTCP").hasClass('bladFtp') === false) {
//                            return;
//                        }
//                    }
                    
                    if (!timeoutInit) {
                        timeoutInit = true;
                        timeoutIdNodexPLC = setTimeout(function () { // inicjacja okienka informującego o błędzie z opóźnieniem
                            wyzerujRamkeTCP();
                            tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP2; // ""Monitor  -------  Node  ---x---  PLC1"
                            brakPolTCP.inicjacja(tekstBleduPol, _obj.error);
                        }, timeout);
                    } else { // aktualizacja wyświetlanych komunikatów z obiektu _obj.error)
                        if ($("#DialogBrakKomunikacjiTCP").length > 0) {
                            brakPolTCP.inicjacja(tekstBleduPol, _obj.error);
                        }
                    }
                } else { // powróciła poprawna komunikacja
                    timeoutInit = false;
                    clearTimeout(timeoutIdNodexPLC);
                    if ($("#DialogBrakKomunikacjiTCP").length > 0) { // zamkniecie  okienka o braku komunikajci - tez z mala zwloka czasowa
                        setTimeout(function () {
                            $("#DialogBrakKomunikacjiTCP").dialog("close");
                        }, 2000);
                    }
                }

                // Nie przychodzi _obj.error tylko po prostu dane w ogóle przestają dochodzić z node a nie było zdarzenia disconnect
                clearTimeout(timeoutIdNoNewData);
                timeoutIdNoNewData = setTimeout(function () { // brak danych przychodzących z PLC, połączenie z serwerem www ok
                    wyzerujRamkeTCP();
                    if (socket.connected) { // jeżeli nastąpiło wcześniej zdarzenie disconnect socketa to nie nadpisuj tej informacji
                        tekstBleduPol = varGlobal.danePlikuKonfiguracyjnego.TEKSTY.brakPolTCP1; // ""Monitor  ---x---  Node  -------  PLC1"
                        brakPolTCP.inicjacja(tekstBleduPol, 'Brak danych z serwera Node');
                    }
                }, timeout + 3000);

                //Obsługa poprawnych danych standardowych
                if (_obj.error === undefined && _obj.Analog !== undefined) {
                    daneTCP.timeStamp_s = _obj.TimeStamp_s;
                    daneTCP.timeStamp_ms = _obj.TimeStamp_ms;
                    daneTCP.timeStamp_js = _obj.TimeStamp_js;
                    daneTCP.analog = _obj.Analog;
                    daneTCP.bit = _obj.Bit;
                    daneTCP.mesg = _obj.Mesg;
                    daneTCP.mesgType = _obj.MesgType;
                    daneTCP.mesgStatus = _obj.MesgStatus;
                    daneTCP.blockUser = _obj.BlockUsr;
                    daneTCP.blockSrvc = _obj.BlockSrvc;
                    daneTCP.blockAdv = _obj.BlockAdv;

                    policzKomunikaty();
                }
            });
        },


        inicjacja = function () {
            pobierzDane();
        };


    return {
        inicjacja: inicjacja,
        daneTCP: daneTCP,
        daneDiag: daneDiag,
        socket: socket,
        rozkazSIO: rozkazSIO
    };
});



//            socket.on 'connect', - > console.log 'connected'
//            socket.on 'reconnect', - > console.log 'reconnect'
//            socket.on 'connecting', - > console.log 'connecting'
//            socket.on 'reconnecting', - > console.log 'reconnecting'
//            socket.on 'connect_failed', - > console.log 'connect failed'
//            socket.on 'reconnect_failed', - > console.log 'reconnect failed'
//            socket.on 'close', - > console.log 'close'
//            socket.on 'disconnect', - > console.log 'disconnect'