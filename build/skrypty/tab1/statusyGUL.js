/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne', 'dodajPojedynczaTabele', 'obslugaJSON'], function ($, varGlobal, dodajTabele2, json) {
    "use strict";

    var ccc,

        inicjacja = function () { // Dodanie na tab1 statusow kombajnu, typu obudowy LP, licznikow itp
            var i,
                aDaneStatusoweGUL = [],
                aStatusy = [];
            
            aDaneStatusoweGUL = json.szukajWartosci("tab1status", varGlobal.sygnaly);

            aStatusy = aStatusy.concat(json.szukajWartosci("statusKombajnu", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("diagnostykaBlokad", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("wWyborNapedow", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("idPolaczenieKES", aDaneStatusoweGUL));
            
            aStatusy = aStatusy.concat({
                id: 'poziomDostepuUzytkownika',
                opis_pelny: 'Poziom Dostępu'
            });
            dodajTabele2.dodaj({
                objects: aStatusy,
                id: '#tab1_statusy',
                background: 'ui-state-default'
            });

            aStatusy = [];
            aStatusy = aStatusy.concat(json.szukajWartosci("idSterowanieposuwGUL1", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("idSterowanieposuwGUL2", aDaneStatusoweGUL));
            dodajTabele2.dodaj({
                objects: aStatusy,
                id: '#tab1_dol1',
                background: 'ui-state-default'
            });

            aStatusy = [];
            aStatusy = aStatusy.concat(json.szukajWartosci("idPozycjaNapinacza", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("idSilaNaciaguPrzewodu", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("wSN_ZadanaPredkosc", aDaneStatusoweGUL));
            dodajTabele2.dodaj({
                objects: aStatusy,
                id: '#tab1_dol2',
                background: 'ui-state-default'
            });

            aStatusy = [];
            aStatusy = aStatusy.concat(json.szukajWartosci("idSterowanieposuwRolka1", aDaneStatusoweGUL));
            aStatusy = aStatusy.concat(json.szukajWartosci("idSterowanieposuwRolka2", aDaneStatusoweGUL));
            dodajTabele2.dodaj({
                objects: aStatusy,
                id: '#tab1_dol3',
                background: 'ui-state-default'
            });
            aStatusy = [];

            //dodanie takze licznikow ktore sa pod zegarem do odswiezania
            require(['tab1/odswiezaj'], function (odswiezaj) { // rozpoczęcie odświeżania wszystkich danych statusowych
                odswiezaj.inicjacja(aDaneStatusoweGUL);
                aDaneStatusoweGUL = [];
            });
            // wyswietlenie aktualnego poziomu dostepu
            require(['poziomDostepu/odswiezaj'], function (odswiezaj) {
                odswiezaj.inicjacja(varGlobal.poziomDostepu);
            });
        };


    return {
        inicjacja: inicjacja

    };

});