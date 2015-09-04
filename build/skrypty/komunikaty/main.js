/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'obslugaJSON', 'kommTCP', 'komunikaty/przepisz'], function ($, varGlobal, json, dane, przepisz) { // , 'komunikaty/wyslijDoPLC'    , wyslij
    "use strict";

    var intervalId,
        mesgOld = [], // tablica z poprzednia paczka komunikatow - odswiezanie kontrolki tylko przy zmianie
        mesgTypeOld = [],
        blockUserOld = [],
        blockSrvcOld = [],
        blockAdvOld = [],
        daneTCP,

        sprawdzZmiany = function () { // Sprawdzenie czy nastapila zmiana w komunikatach - tylko w takiej sytuacji odswiezenie list alarmow i ostrzezen
            var sprawdzone = [],
                sprawdz = function (dane, daneOld, typ) {
                    var i,
                        wykrytoZmiany = false;
                    for (i = 0; i < dane.length; i += 1) {
                        if (daneOld[i] !== dane[i]) { // jest roznica z poprzednia paczka komunikatow
                            daneOld[i] = dane[i];
                            wykrytoZmiany = true;
                        }
                    }

                    if (wykrytoZmiany) {
                        przepisz.zmienListe(daneTCP, varGlobal.tekstyKomunikatow, typ);
                        //console.log(daneTCP.mesg[34]);
                    }
                    return daneOld;
                },
                wyczyscBlokady = function () {
                    if ($('#listaBlokady').children().length > 1) { // czysc liste blokad tylko raz
                        //console.log('czyszcze blokady');
                        $('#listaBlokady').empty();
                        blockUserOld = []; // wyzerowanie potrzebne poniewaz po ponownym wejsciu na zakladke z blokadami (w przypadku gdy nie nastapila rzeczywista zmiana) nie wyswietla sie zadne komunikaty!
                        blockSrvcOld = [];
                        blockAdvOld = [];
                    }
                };

            daneTCP = dane.daneTCP;

            // Sprawdzenie czy nastapily zmiany i zapamietanie aktualnej paczki dla nastepnego cyklu
            mesgOld = sprawdz(daneTCP.mesg, mesgOld, 'komunikaty');
            mesgTypeOld = sprawdz(daneTCP.mesgType, mesgTypeOld, 'komunikaty');

            // wyswietlenie liczby blokad (od wszystkich uzytkownikow)
            $('#listaBlokady').parent().prev().text(varGlobal.danePlikuKonfiguracyjnego.MENU_KOMUNIKATY[0].zawartosc[2].OPIS + ': ' + (varGlobal.blokady.zalUser + varGlobal.blokady.zalSrvc + varGlobal.blokady.zalAdv));

            if ($('#tabs').tabs("option", "active") === 1) { // odswiezanie blokady tylko na tabie z komunikatami i na zakladce z blokadami
                if ($("#accordion").accordion("option", "active") === 2) {
                    blockUserOld = sprawdz(daneTCP.blockUser, blockUserOld, 'blokady');
                    blockSrvcOld = sprawdz(daneTCP.blockSrvc, blockSrvcOld, 'blokady');
                    blockAdvOld = sprawdz(daneTCP.blockAdv, blockAdvOld, 'blokady');
                } else {
                    wyczyscBlokady(); // zmniejszenie struktury html DOM -> wydajnosc
                }
            } else {
                wyczyscBlokady();
            }
        },

        inicjacja = function () {
            //Rozpoczecie cyklicznego sprawdzania czy nastapily zmiany w komunikatach
            intervalId = setInterval(function () {
                sprawdzZmiany();
            }, varGlobal.czasOdswiezania);

            // Czekanie na zdarzenie zaznaczenia komunikat
            $(".selectable").on("selectablestop", function (event, ui) {
                $(".selectable li").removeClass("ui-selected"); // Skasowanie zaznaczenia myszki zeby sie nie gryzlo z nawigacja z klawiatury
            });
        };

    return {
        inicjacja: inicjacja
    };

});
