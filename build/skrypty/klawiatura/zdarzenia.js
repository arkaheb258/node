/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery',
        'zmienneGlobalne',
        'klawiatura/nawiTaby'
       ],
    function ($,
        varGlobal,
        nawiTaby) {

        'use strict';
        var zezwolenieKlawiatury = true,
            setTimeoutId,
            sprawdzPozycjeNawigacji = function (kodKlawisza) { // Sprawdzenie na ktorym elemencie znajduje sie aktualna nawigacja (element z klasa kopex-selected)
                var kopexSelected,
                    iloscOtwartychPopup,
                    dialogAlarmIsOpen,
                    dialogRegularIsOpen,
                    ccc,
                    dialogIsOpen;

                if (($("#DialogPopUpAntykolizja").dialog("isOpen")) && ($('#DialogPopUpAntykolizja').length > 0)) { // przejecie nawigacji podczas wyswietlenia alarmu o antykolizji
                    require(['antykolizja/nawiDialogAntykolizja'], function (nawiDialogAntykolizja) {
                        nawiDialogAntykolizja.wykonaj(kodKlawisza, kopexSelected);
                    });
                    return;
                }
                if (($("#dialogPrzypomnienieEKS").dialog("isOpen")) && ($('#dialogPrzypomnienieEKS').length > 0)) {
                    require(['ksiazkaSerwisowa/nawiEKSprzypomnienie'], function (nawiEKSprzypomnienie) {
                        nawiEKSprzypomnienie.wykonaj(kodKlawisza, kopexSelected);
                    });
                    return;
                }

                // podczas wyskakiwabnia okienka popup z ostatnim komunikatem (to małe od dołu) czasami traci się możliwość nawigacji po innych elementach (np. buttonach)
                iloscOtwartychPopup = $(".ui-dialog:visible").length; // policzenie ile okienek popup jest otwartych
                // okienko popup z ostatnim alarmem (to wyskakujące na dole) jest otwarte:
                if ($("#DialogPopUpAlarm").is(":visible")) {
                    dialogAlarmIsOpen = true; // tylko w tym przypadku dalsza możliwość nawigacji
                } else {
                    dialogAlarmIsOpen = false;
                }
                // zwykły popup otwarty (alarm zamknięty):
                if (($(".ui-dialog").is(":visible") && (!dialogAlarmIsOpen))) {
                    dialogRegularIsOpen = true;
                } else {
                    if (dialogAlarmIsOpen) {
                        if (iloscOtwartychPopup === 1) {
                            dialogIsOpen = false; // otwarte okienko tylko z alarmem -> normalna nawigacja na głównych tabach i buttonach
                        }
                        if (iloscOtwartychPopup > 1) {
                            dialogIsOpen = true; // otwarte okienko z alarmem podczas wyświetlania innego popupu (np. z pełną listą komunikatów)
                        }
                    }
                }
                // wszystkie okienka są zamkniete:
                if (!$(".ui-dialog").is(":visible")) {
                    dialogIsOpen = false;
                }

                kopexSelected = $('.kopex-selected'); // szukanie aktywnego elementu
                //console.log(kopexSelected);
                if (kopexSelected.hasClass("kopex-selected")) { // Znaleziono aktywny element
                    if (dialogIsOpen === false) {
                        if (kopexSelected.hasClass("przyciskMenuGlowne")) {
                            require(['klawiatura/nawiButtony'], function (nawiButtony) {
                                nawiButtony.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("ui-accordion")) {
                            require(['komunikaty/nawiAccordion'], function (nawiAccordion) {
                                nawiAccordion.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("przyciskMenuPoziomDost")) {
                            require(['poziomDostepu/nawiPoziomDost'], function (nawiPoziomDost) {
                                //console.log('przy');
                                nawiPoziomDost.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                    } else {
                        if (kopexSelected.is("#DialogBlokady")) {
                            require(['komunikaty/nawiZalozBlokade'], function (nawiZalozBlokade) {
                                nawiZalozBlokade.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#DialogKsiazkaSerwisowa")) {
                            require(['ksiazkaSerwisowa/nawiEKStaby'], function (nawiEKStaby) {
                                nawiEKStaby.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("buttonEKS")) {
                            require(['ksiazkaSerwisowa/nawiEKSbuttony'], function (nawiEKSbuttony) {
                                nawiEKSbuttony.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#dialogPotwierdzenieEKS")) {
                            require(['ksiazkaSerwisowa/nawiEKSpotwierdzenie'], function (nawiEKSpotwierdzenie) {
                                nawiEKSpotwierdzenie.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("przyciskMenuPodmianaPLC")) {
                            require(['podmianaPLC/nawiMenuGlowne'], function (nawiMenuGlowne) {
                                nawiMenuGlowne.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#DialogLiczniki")) {
                            require(['liczniki/nawiDialogLiczniki'], function (nawiDialogLiczniki) {
                                nawiDialogLiczniki.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#menuRozkazy")) {
                            //console.log("kopexSelected.is");
                            require(['rozkazy/nawiRozkazyMenu'], function (nawiRozkazyMenu) {
                                nawiRozkazyMenu.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#DialogEdycjaRozkazu")) {
                            require(['rozkazy/nawiDialogPotwierdzenie'], function (nawiDialogPotwierdzenie) {
                                nawiDialogPotwierdzenie.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#PelnaListaKomm")) {
                            require(['komunikatyPelnaLista/nawiPelnaListaKomm'], function (nawiPelnaLista) {
                                nawiPelnaLista.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#dateEntry")) {
                            require(['dataCzas/nawiDataCzas'], function (nawiDataCzas) {
                                nawiDataCzas.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("przyciskMenuPoziomDost")) {
                            require(['poziomDostepu/nawiPoziomDost'], function (nawiPoziomDost) {
                                nawiPoziomDost.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("keyboardNaviPozDost")) {
                            require(['poziomDostepu/nawiPoziomDostKlaw'], function (nawiPoziomDostKlaw) {
                                nawiPoziomDostKlaw.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#menu")) {
                            require(['parametry/nawiParametryLista'], function (nawiParametry) {
                                nawiParametry.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#spinner")) {
                            require(['parametry/nawiParametrySpinner'], function (nawiParametrySpinner) {
                                nawiParametrySpinner.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("keyboardNavi")) {
                            require(['parametry/nawiParametryKlaw'], function (nawiParametryKlaw) {
                                nawiParametryKlaw.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("przyciskMenuParametry")) {
                            require(['parametry/nawiParamMenu'], function (nawiParamMenu) {
                                nawiParamMenu.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#dialogDiagnostykaGauge")) {
                            require(['diagnostykaGauge/nawiDialogGauge'], function (nawiDialogGauge) {
                                nawiDialogGauge.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        //                        if (kopexSelected.is("#dialogPotwierdzenieWymianaPLC")) {
                        //                            require(['podmianaPLC/nawiPotwierdzenie'], function (nawiPotwierdzenie) {
                        //                                nawiPotwierdzenie.wykonaj(kodKlawisza, kopexSelected);
                        //                            });
                        //                        }
                        if (kopexSelected.hasClass("radioButtonPLC")) {
                            require(['diagnostykaPLC/nawiDiagnostykaPLC'], function (nawiDiagnostykaPLC) {
                                nawiDiagnostykaPLC.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("przyciskMenuDiagnostBlokow")) {
                            require(['diagnostykaBloki/nawiMenu'], function (nawiMenu) {
                                nawiMenu.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("radioButtonDiagnBloki")) {
                            require(['diagnostykaBloki/nawiBlok'], function (nawiBlok) {
                                nawiBlok.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }


                        //                        if (kopexSelected.hasClass("klasaButtonSelectMenu")) {
                        //                            require(['gulTrybSerwisowy/nawiDialog'], function (nawiDialog) {
                        //                                nawiDialog.wykonaj(kodKlawisza, kopexSelected);
                        //                            });
                        //                        }
                        if (kopexSelected.hasClass("przyciskMenuGULTrybSerw")) {
                            require(['gulTrybSerwisowy/nawiMenu'], function (nawiMenu) {
                                nawiMenu.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }


                        if (kopexSelected.hasClass("klasaButtonWykresy")) {
                            require(['wykresyRT/nawiDialog'], function (nawiDialog) {
                                nawiDialog.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.is("#dialogDiagnostykaKolumny")) {
                            require(['diagnostykaKolumny/nawiDiagnostykaKol'], function (nawiDiagnostykaKol) {
                                nawiDiagnostykaKol.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }
                        if (kopexSelected.hasClass("radioButtonRamkaTCP")) {
                            require(['ramkaTcp/nawiRamkaTcp'], function (nawiRamkaTcp) {
                                nawiRamkaTcp.wykonaj(kodKlawisza, kopexSelected);
                            });
                        }

                        if (kopexSelected.is("#dialogPotwierdzenie222")) {
                            require(['potwierdzenie'], function (potwierdzenie) {
                                potwierdzenie.nawigacjaWykonaj(kodKlawisza, kopexSelected);
                            });
                        }




                    }
                } else { // jesli nie ma klasy kopex-selected to znaczy ze nawigacja jest na tabach
                    if (dialogIsOpen === false) {
                        nawiTaby.wykonaj(kodKlawisza);
                    } else {
                        console.log('!! stracono nawigacje !!');
                    }
                }
            },


            przechwycZdarzenieKlawiatury = function () {
                $(document).on("keyup", function (event, ui) { // Oczekiwanie na zdarzenie puszczenia klawisza    keyup
                    var selected = $(".kopex-selected"),
                        selectedKomunikat,
                        tabIndex,
                        tabIndexNowy;

                    //console.log('przechwycZdarzenieKlawiatury - keyup');
                    event.preventDefault();
                    event.stopPropagation();

                    switch (event.which) {
                    case varGlobal.kodyKlawiszy.gora:
                        sprawdzPozycjeNawigacji(varGlobal.kodyKlawiszy.gora);
                        break;
                    case varGlobal.kodyKlawiszy.dol:
                        sprawdzPozycjeNawigacji(varGlobal.kodyKlawiszy.dol);
                        break;
                    case varGlobal.kodyKlawiszy.lewo:
                        sprawdzPozycjeNawigacji(varGlobal.kodyKlawiszy.lewo);
                        break;
                    case varGlobal.kodyKlawiszy.prawo:
                        sprawdzPozycjeNawigacji(varGlobal.kodyKlawiszy.prawo);
                        break;
                    case varGlobal.kodyKlawiszy.enter:
                        sprawdzPozycjeNawigacji(varGlobal.kodyKlawiszy.enter);
                        break;
                    case varGlobal.kodyKlawiszy.escape:
                        sprawdzPozycjeNawigacji(varGlobal.kodyKlawiszy.escape);
                        break;
                    case 48: // 0
                        break;
                    case 49: // 1
                    case 50: // 2
                    case 51: // 3
                    case 52: // 4
                    case 53: // 5
                            
                            //DialogGULtrybSerwisowy
                        tabIndexNowy = event.which - 48 - 1;
                        if (($("#DialogEdycjaParametru").dialog("isOpen") === true) || ($("#DialogPoziomDostepu").dialog("isOpen") === true) || ($("#DialogEdycjaRozkazu").length > 0) || ($("#DialogGULtrybSerwisowy").dialog("isOpen") === true)) { // wyjątki na planszach gdzie może być wklepywana bezpośrednio z klawiatury wartość liczbowa
                            console.log('DialogEdycjaParametru: ' + $("#DialogEdycjaParametru").dialog("isOpen") + ', DialogPoziomDostepu: ' + $("#DialogPoziomDostepu").dialog("isOpen") + ', DialogEdycjaRozkazu:' + $("#DialogEdycjaRozkazu").length);
                        } else {
                            tabIndex = $('#tabs').tabs("option", "active"); // aktualnie ustawiony tab
                            if (selected.hasClass("przyciskMenuGlowne")) { // zapisanie do pamięci aktywnego buttona
                                varGlobal.buttonMemory[tabIndex] = $(selected).attr('id'); // ... zapamietanie jego id na odpowiedniej komorce pamieci (odpowiadajacej indekowi tabu)
                            }
                            selectedKomunikat = $(".ui-selected");
                            if ($(selectedKomunikat).is('[id]')) { // jesli jest jakiś zaznaczony komunikat na tab2
                                require(['komunikaty/nawiSelectable'], function (nawiSelectable) {
                                    nawiSelectable.wyjscie();
                                });
                                require(['komunikaty/nawiAccordion'], function (nawiAccordion) {
                                    nawiAccordion.dezaktywuj();
                                });
                            }
                            selected.removeClass("kopex-selected").removeClass(varGlobal.ui_state);
                            $(".ui-dialog-content").remove(); // zamknięcie wszystkich okienek dialog
                            $("#tabs").tabs("option", "active", tabIndexNowy); // przejście na nowy tab
                            if (tabIndexNowy === 1) { // przypadek wejścia na komunikaty i blokady
                                $("#accordion").accordion("option", "active", 0);
                                $("#accordion").addClass("kopex-selected");
                            } else {
                                if (typeof varGlobal.buttonMemory[tabIndexNowy] === "string") { // sprawdzenie czy dla aktualnego indeksu tabu istnieje pamiec poprzednio zaznaczonego buttona
                                    $("#" + varGlobal.buttonMemory[tabIndexNowy]).addClass("kopex-selected").addClass(varGlobal.ui_state);
                                }
                            }
                        }
                        break;
                    case 54: // 6
                        break;
                    case 55: // 7
                        break;
                    case 56: // 8
                        break;
                    case 57: // 9
                        break;
                    default:
                        break;
                    }
                });
            };


        return {
            przechwycZdarzenieKlawiatury: przechwycZdarzenieKlawiatury
        };
    });

//                keydown -> can be prevented -> fired when: press a key
//                keypress -> can be prevented -> fired when: hold a key
//                keyup -> can not be prevented -> fired when: release a key

// sprawdzenie czy zostaly wcisniete dwa klawisze na raz
//                    if (event.shiftKey && event.which === varGlobal.kodyKlawiszy.gora) {
//                        console.log("Kombinacja klawiszy wciśnięta!");
//                    }