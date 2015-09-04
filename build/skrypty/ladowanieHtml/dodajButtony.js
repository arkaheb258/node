/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */



define(['jquery', 'zmienneGlobalne', 'wspolne/dodajMenu2'], function ($, varGlobal, dodajMenu) {
    "use strict";

    var ccc,


        uruchomProceduryButtona = function (katalog, idButtona) {
            // Odpalenie plików inicjujących skrypty java script obsługujących funkcjonalność kryjącą się za buttonem...
            require([katalog + '/main'], function (main) { // ... czyli przejscie po każdym katalogu zawierającym pliki i zainicjowanie plików main.js
                main.inicjacja(idButtona);
            });
        },


        inicjacja = function (_nrTab, _ZAWARTOSC) {
            var i,
                j,
                length,
                length2,
                button,
                katalog,
                idButtona,
                obiektButton,
                fragmentHtml = document.createDocumentFragment(),
                funDodajButton,
                idDialog;

            length2 = _ZAWARTOSC.length;
            funDodajButton = function () {
                if (obiektButton.widocznosc) {
                    if ((obiektButton.typKombajnu === varGlobal.typKombajnu) || (obiektButton.typKombajnu === 'ALL')) {
                        button = document.createElement('button');
                        $(button)
                            .addClass('przyciskMenuGlowne')
                            .addClass(obiektButton.klasa)
                            .addClass(obiektButton.dostep)
                            .attr('id', obiektButton.id)
                            .text(obiektButton.OPIS);
                        $(fragmentHtml).append(button);
                        // załadowanie modułów odpowiadających za funkcjonalności poszczególnych buttonów
                        katalog = obiektButton.katalog; // katalog, w ktorym fizucznie znajduja sie pliki obslugujace funkcjonalnosc buttona
                        idButtona = obiektButton.id; // nie dotyczy buttonów które będą reagować na ich klasę -> buttony z gauge i diagnostyczne
                        if (katalog !== null) { // dane diagnostyczne i kontrolki gauge mają być załadowane tylko raz -> katalog jest więc wpisany tylko dla pierwszego buttona w strukturze jsona
                            uruchomProceduryButtona(katalog, idButtona);
                        }
                    }
                }
            };

            for (i = 0; i < length2; i += 1) {
                obiektButton = _ZAWARTOSC[i];
                if (obiektButton.wersjaWyposazenia === undefined) { // jeśli nie zdefiniowane -> button dostępny dla wszystkich wersji
                    funDodajButton();
                } else { // jest podana wersja wyposażenia
                    if (varGlobal.wersjaWyposazenia === parseFloat(obiektButton.wersjaWyposazenia)) {
                        funDodajButton();
                    }
                }
            }

            $("div#tab" + (_nrTab + 1)).append(fragmentHtml);
            $("button").button();
            $("#idJezykPolski").button({
                icons: {
                    primary: "polska"
                },
                disabled: !varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.LISTA[0]
            });
            $("#idJezykRosyjski").button({
                icons: {
                    primary: "rosja"
                },
                disabled: !varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.LISTA[1]
            });
            $("#idJezykAngielski").button({
                icons: {
                    primary: "anglia"
                },
                disabled: !varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.LISTA[2]
            });
            $("#idJezykChinski").button({
                icons: {
                    primary: "chiny"
                },
                disabled: !varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.LISTA[3]
            });
            $("#idJezykHiszpanski").button({
                icons: {
                    primary: "argentyna"
                },
                disabled: !varGlobal.parametry.DANE.grupa1.podgrupa2.rKonfWersjaJezykowa.LISTA[4]
            });

            idDialog = "#tab" + (_nrTab + 1);
            dodajMenu.allignVertical(idDialog); // wyrównanie buttonów w osi Y
        };

    return {
        inicjacja: inicjacja
    };

});