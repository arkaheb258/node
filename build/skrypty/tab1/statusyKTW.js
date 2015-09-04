/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

// Dodanie elementu na TAB 1 z ostatnim komunikatem / godzina
define(['jquery', 'zmienneGlobalne', 'dodajPojedynczaTabele', 'obslugaJSON'], function ($, varGlobal, dodajPojedynczaTabele, json) {
    "use strict";

    var ccc,

        inicjacja = function () { // Dodanie na tab1 statusow kombajnu, typu obudowy LP, licznikow itp
            var i,
                aDaneStatusowe = [],
                aStatusy = [];

            aDaneStatusowe = json.szukajWartosci("tab1status", varGlobal.sygnaly);

            aStatusy = aStatusy.concat(json.szukajWartosci("statusKombajnu", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("diagnostykaBlokad", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("miejsceSterowania", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("typZraszania", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("lacznikS5", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("trwaPlukanieFiltra", aDaneStatusowe));
            dodajPojedynczaTabele.dodaj({
                objects: aStatusy,
                id: '#tab1_statusy',
                background: 'ui-state-default'
            });

            aStatusy = [];
            aStatusy = aStatusy.concat(json.szukajWartosci("typObudowyLP", aDaneStatusowe));
            aStatusy = aStatusy.concat({
                id: 'poziomDostepuUzytkownika',
                opis_pelny: 'Poziom Dostępu'
            });
            dodajPojedynczaTabele.dodaj({
                objects: aStatusy,
                id: '#tab1_dol1',
                background: 'ui-state-default'
            });

            aStatusy = [];
            aStatusy = aStatusy.concat(json.szukajWartosci("pozycjaOrganX", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("pozycjaOrganY", aDaneStatusowe));
            dodajPojedynczaTabele.dodaj({
                objects: aStatusy,
                id: '#tab1_dol2',
                background: 'ui-state-default'
            });


            aStatusy = [];
            aStatusy = aStatusy.concat(json.szukajWartosci("sprawnoscAntykolizji", aDaneStatusowe));
            aStatusy = aStatusy.concat(json.szukajWartosci("zadzialanieAntykolizji", aDaneStatusowe));
            //aStatusy = aStatusy.concat(json.szukajWartosci("statusKombajnu", varGlobal.sygnaly));
            dodajPojedynczaTabele.dodaj({
                objects: aStatusy,
                id: '#tab1_dol3',
                background: 'ui-state-default'
            });
            aStatusy = [];

            //dodanie takze licznikow ktore sa pod zegarem do odswiezania
            require(['tab1/odswiezaj'], function (odswiezaj) { // rozpoczęcie odświeżania wszystkich danych statusowych
                odswiezaj.inicjacja(aDaneStatusowe);
                aDaneStatusowe = [];
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