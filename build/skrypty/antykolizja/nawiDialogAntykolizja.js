/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  require, define */

define(['jquery', 'zmienneGlobalne'], function ($, varGlobal) {
    'use strict';


    var ccc,

        wykonaj = function (kod, selected) {

            switch (kod) {

            case varGlobal.kodyKlawiszy.enter:

                require(['antykolizja/popUpAntykolizja'], function (popUpAntykolizja) {
                    //$("#DialogPopUpAntykolizja").dialog("close");
                    popUpAntykolizja.uruchomTimer(); // potwierdzenie przyjęte. Jeśli po określonym czasie usterka nie zostanie usunieta -> ponowne wyświetlenie planszy (ma być w miarę upierdliwe)
                });

                break;

            default:

            }
        };

    return {
        wykonaj: wykonaj
    };
});
