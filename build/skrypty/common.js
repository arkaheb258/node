/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global require */

// Pierwszy plik, ktory bedzie zaladowany przez biblioteke require - konfiguracja sciezek do modulow
require.config({
    baseUrl: "skrypty",

    packages: ['klawiatura', 'komunikaty', 'ladowanieHtml', 'rozkazy'],

    //waitSeconds: 15, // !!!!!!!!!!!!!!!! do testów olimexa - serwer blokuje pobieranie skryptów - wyjaśnić z Arkiem !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    paths: {
        jquery: 'libs/jquery',
        jqueryUI: 'libs/jqueryUI',
        scrollTo: 'libs/jquery.scrollTo',
        keyboard: 'libs/jquery.keyboard.min',
        keyboardNav: 'libs/jquery.keyboard.extension-navigation.min',
        dateTimePL: 'libs/jquery.datetimeentry-pl',
        dateTimePlugin: 'libs/jquery.plugin',
        dateTime: 'libs/jquery.datetimeentry',
        paper: "libs/paper-full.min",
        socketio: "libs/socket.io",
        d3: "libs/d3.min",
        c3: "libs/c3.min",
        zmienneGlobalne: 'wspolne/zmienneGlobalne',
        obslugaJSON: 'wspolne/obslugaJSON',
        progresBar: 'wspolne/progresBar',
        //dodajMenu: 'wspolne/dodajMenu',
        //kommTCP: 'wspolne/kommTCP',
        kommTCP: 'wspolne/socketIO',
        kontrolkiUI: 'wspolne/kontrolkiUI',
        app: 'app',
        scroll: 'wspolne/scroll',
        ustawKolejnosc: 'wspolne/ustawKolejnosc',
        dodajPojedynczaTabele: 'wspolne/dodajPojTabele3',
        alert: 'wspolne/alert',
        potwierdzenie: 'wspolne/potwierdzenie',
        //watchdog: 'wspolne/watchdog'
        sprawdzPozDostepu: 'komunikaty/sprawdzPozDostepu'
            //domyslne: 'domyslne'

    },

    shim: {
        'jqueryUI': ['jquery'],
        'paper': {
            exports: 'paper'
        },
        'keyboard': {
            deps: ['jquery', 'jqueryUI'],
            exports: 'keyboard'
        },
        'keyboardNav': {
            deps: ['jquery', 'jqueryUI', 'keyboard'],
            exports: 'keyboardNav'
        },
        'dateTimePlugin': {
            deps: ['jquery'],
            exports: 'dateTimePlugin'
        },
        'dateTimePL': {
            deps: ['jquery', 'dateTime'],
            exports: 'dateTimePL'
        },
        'dateTime': {
            deps: ['jquery', 'dateTimePlugin'],
            exports: 'dateTime'
        }
    }
});


// Start glownej aplikkacji
require(['app'], function (app) {
    'use strict';

    $(document).ready(function () {
        console.time("app");
        app.inicjacja();
        console.timeEnd("app");
    });
});