/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global define */

define(function () {
    'use strict';

    var konfiguracja = {
        sygnaly: {}, // dane o wszystkich sygnalach pobranych z pliku json
        data: '',
        trwaZmianaCzasu: false,
        danePlikuKonfiguracyjnego: {},
        hardware: {},
        daneDoWykresow: {},
        diagnostykaBlokow: {},
        adresSerweraRozkazy: '/rozkaz?callback=?',
        daneDoOdswiezania: [], // Obiekty kotre maja byc caly czas odswiezane, np. stan klawiszy nawigacyjnych
        tekstyKomunikatow: undefined, // Teksty komunikatow pobrane z serwera (z pliku jsona)
        parametry: undefined, // Parametry pobrane z serwera (z pliku jsona)
        czasOdswiezania: 300, // czas odświeżania danych na planszach, np. kontrolek gauge
        czasOdswiezaniaSerwer: 200, // czas odpytywania serwera node po ajaxie (nieaktualne po wprowadzeniu biblioteki socket.io)
        czyAnimacje: false, // wlaczenie / wylaczenie animacji dla duzych okienek z kontrolkami gauge i diagnostyka
        czyAnimacjeMale: true, // wylaczenie / wlaczenie pozostalych animacji
        poziomDostepu: 'Srvc', // Aktualnie ustawiony poziom dostepu uzytkownika --> Brak, User, User2, Srvc, Adv
        czasPodtrzymania: 'Brak', // Czas podtrzymania wybranego poziomu dostepu (w minutach) ---- lub wyłączenie, wpisanie stringu 'Brak'
        efektShowHide: 'drop', // // drop    blind   clip fold slide
        buttonMemory: [], // pamiec aktywnego byttonu jesli uzytkownik bedzie chcial przejsc na plansze obok
        uszkodzenieAntykolizji: false,
        czyPozycjonowanieGIG: false, // czy na kombajnie jest zamontowany system do pozycjonowania kombajnu względem osi wyrobiska
        wersjaWyposazenia: undefined, // wersja konfiguracji kombajnu -> zmiany na wyspach PLC itp
        wersjaJezykowa: undefined,
        typKombajnu: undefined, // aktualnie wybrany typ kombajnu: KTW-150, GUL-500
        podajDaneDiagnostyczne: false,
        typNawigacjiPoEkranach: 0, // 0-komendy z klawiatury usb,  1-komendy z ramki tcp   (wykorzystywane na planszy z trybem serwisowym dla GULa)
        trybSerwisowyAktywny: false,
        identyfikatorKombajnu: { // dopuszczalne identyfikatory dla typu kombajnu pobrane z parametrów
            ktw: 'KTW',
            gul: 'GUL',
            wow: 'WOW'
        },
        zmienianyParametr: {
            grupa: 0,
            podgrupa: 0,
            id: '',
            obiekt: undefined
        },
        blokady: {
            maxUser: 30,
            maxSrvc: 40,
            maxAdv: 100,
            zalUser: 0, // Liczba aktywnych blokad (zalozonych)
            zalSrvc: 0,
            zalAdv: 0
        },
        komunikaty: { // Liczba aktywnych alarmow i ostrzezen
            alarmy: 0,
            ostrz: 0,
            alarmy2: 0,
            ostrz2: 0
        },
        ui_state: 'ui-state-hover', //  "ui-state-active",   ui-state-hover      ui-state-focus
        doWyslania: {
            "blokady": {
                "rozkaz": "ustawBlokade",
                "dostep": "Srvc", //pierwsza litera zawsze z duzej  --> Brak, User, Srvc, Adv
                "slowo": 5,
                "bit": 3,
                "wartosc": 1
            },
            "czas": {
                "rozkaz": "ustawCzas",
                "wartosc": "aaaaaaaaaa"
            },
            "parametr": {
                "rozkaz": "ustawParametr",
                "typ": "aaaaa", // pString
                "id": "aaaaa", //nazwa parametru ze sterownika np. sKonfblabla
                "wartosc": "aaaaaa"
            },
            "parametrPlik": { // Operacje na plikach parametrow (zapis/odczyt dla 5 plikow uzytkownikow), przywrocenie ustawien domyslnych
                "rozkaz": "ustawPlik",
                "plik": "aaaaaa", // default
                "akcja": "aaaaa" // load
            },
            "historia": {
                "rozkaz": "podajHistorie"
            },
            "kalibrEnk": {
                "rozkaz": "kalibracja", // identyfikator dla Arka
                "napedId": 0, // identyfikator napędu
                "pozycja": 0 // wartość kątowa pozycji napędu -160..160° pomnożona x100 -> ja wysylam to co wpisl uzytkownik np 25.6 (nie wymnazam)
            },
            "eks_520": {
                "rozkaz": "eks", // identyfikator dla Arka
                "wActivID": 0 // identyfikator rozkazu (np 2001 dla prac miesięcznych)
            },
            "podmianaPLC": {
                "rozkaz": "podmianaPLC", // identyfikator dla Arka
                "typ": "zapisz", // zapisz / odczytaj
                "wartosc": "wszystkie" // wszystkie / nazwaPliku
            },
            "zalTrybSerwisowy": {
                "rozkaz": "trybSerwisowy_223",
                "wID": 0,
                "wWartosc": 0
            },
            "diagnostykaBloku": {
                "rozkaz": "statusWeWyBloku_310",
                "wWartosc": 500, // częstotliwość odpytywania
                "sID": 0 // id bloku  
            }
        },
        kodyKlawiszy: { // Kody do zdarzen JQuery wcisnietych klawiszy
            "lewo": 37,
            "prawo": 39,
            "gora": 38,
            "dol": 40,
            "enter": 13,
            "escape": 27
        }
    };

    return konfiguracja;
});