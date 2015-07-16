/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global require, define, dane, daneDiag */

var ppp = (function () {
    'use strict';

    var index,
        val,
        znajdzNull = function () {
            if (index === '') {
                index = 0;
            }
            if (val === '') {
                val = '666';
            }
        },
        wyslijDaneAnalogowe = function () {
            index = $('#anIndex').val();
            val = $('#anVal').val();
            znajdzNull();
            dane.Analog[index] = parseFloat(val);
        },
        wyslijDaneDiagnostyczne = function () {
            index = $('#diagIndex').val();
            val = $('#diagVal').val();
            znajdzNull();
            daneDiag.DigitData[index] = parseFloat(val);
        },
        wyslijDaneBitowe = function () {
            var i,
                array,
                val2 = 0;

            index = $('#bitIndex').val();
            val = $('#bitVal').val();
            znajdzNull();
            array = val.split("+");
            for (i = 0; i < array.length; i += 1) {
                val2 += parseFloat(array[i]);
            }
            dane.Bit[index] = val2;
        };

    // analogi
    $("#anButton").on("click", function (event, ui) {
        wyslijDaneAnalogowe();
    });
    $('#anVal').on('keypress', function (event) {
        if (event.which === 13) {
            wyslijDaneAnalogowe();
        }
    });

    // bity
    $("#bitButton").on("click", function (event, ui) {
        wyslijDaneBitowe();
    });
    $('#bitVal').on('keypress', function (event) {
        if (event.which === 13) {
            wyslijDaneBitowe();
        }
    });

    // diagnostyka bloków
    $("#diagButton").on("click", function (event, ui) {
        wyslijDaneDiagnostyczne();
    });
    $('#diagVal').on('keypress', function (event) {
        if (event.which === 13) {
            wyslijDaneDiagnostyczne();
        }
    });




}());