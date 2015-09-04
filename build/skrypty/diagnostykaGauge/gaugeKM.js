/*jslint browser: true*/
/*jslint bitwise: true */
/*global $, jQuery*/
/*jslint devel: true */
/*global document: false */
/*global JustGage, getRandomInt */
/*jslint nomen: true*/
/*global  define, require*/


define(['jquery', 'd3'], function ($, d3) {
    'use strict';

    var ccc,


        init = function (parent) {

            var _data = null,
                _duration = 10, // wartości domyslne w przypadku nie podania ich przez użytkownika
                _arcThickness = 0.7, // szerokość łuku
                _fill = '#edebeb', /// wypełnienie pustej części łuku
                _dane,
                _label = "",
                _units = '',
                _labelFontColor = "#b3b3b3",
                _decimals = 0,
                _value = 0,
                _minValue = 0,
                _maxValue = 0,
                _sectorsThicknes = 0.15,

                currentArc = (-90 + 0.1) * (Math.PI / 180), // aktualna wartość jaka ma być wyrysowana na łuku
                daneWart = [],
                daneKolor = [],
                init = false,
                width,
                height,
                fontSize = 10,
                path,
                labelWart,
                labelUnit,
                zaznaczonyElementHtml,
                przesuniecie,
                arc1 = d3.svg.arc(), // łuk główny
                arc2; // łuk z zakresami

            zaznaczonyElementHtml = d3.select(parent);

            function arcTween(a) { // actualValue
                var i = d3.interpolate(currentArc, a);
                return function (t) { //transitionValue
                    currentArc = i(t);
                    return arc1.endAngle(i(t))();
                };
            }

            function component() {
                zaznaczonyElementHtml.each(function (data) { // Select the svg element, if it exists. Tablica z tylko jednym elementem
                    var canvas,
                        grupa1,
                        grupa2,
                        grupa3,
                        zakresy,
                        tempPie,
                        labelOpis,
                        labelMin,
                        labelMax,
                        x,
                        y,
                        i,
                        render = function () {

                            canvas.attr("width", '100%')
                                .attr("height", '100%');

                            // określenie parametrów głównego łuku
                            grupa1 = canvas.append("g")
                                .attr("class", "lukGlowny")
                                .attr('fill', _fill);
                            width = parent.offsetWidth / 2 * 0.75; // *0.8
                            height = width / 2; // 2
                            // użycie generatora do tworzenia łuków
                            arc1.outerRadius(width)
                                .innerRadius(width * _arcThickness)
                                .startAngle(-90 * (Math.PI / 180))
                                .endAngle(90 * (Math.PI / 180));
                            // ścieżka pustego łuku (tła)
                            x = width + ((parent.offsetWidth - width * 2) / 2); // wycentrowanie łuku względem szerokości
                            y = width;
                            przesuniecie = "translate(" + x + "," + y + ")";
                            grupa1.append("path")
                                .attr("transform", przesuniecie)
                                .attr("d", arc1);

                            // ustalenie wstępnej wielkości czcionki
                            fontSize = width * 0.1;

                            // pokazanie aktualnej wartości na łuku
                            arc1.endAngle(currentArc);
                            grupa3 = canvas.append("g")
                                .attr("class", "lukWartosc")
                                .selectAll(".arc")
                                .data(data);
                            path = grupa3.enter()
                                .append("path")
                                .attr('fill', 'silver')
                                .attr("transform", przesuniecie)
                                .attr("d", arc1);

                            // ustalenie zakresów
                            for (i = 0; i < _dane.length; i += 1) { // stwotrzenie zakresów bez uwzględnienia histerez
                                if (_dane[i].hi !== 0) {
                                    if (_dane[i].hi - _dane[i].lo > 0) { // na zakresach wysokich gdy np. chcemy pozbyć się ostrzeżeni amogą powstać zera - powodują kłopoty z ustawianiem kolorów na wysokie zakresy
                                        daneKolor.push(_dane[i].color);
                                        daneWart.push(_dane[i].hi - _dane[i].lo);
                                    }
                                }
                            }
                            // dodanie histerez kosztem pól sąsiadujących z alarmami je posiadającymi
                            if ((_dane[0].hi !== 0) && (_dane[0].histLo !== 0) && (!isNaN(_dane[0].histLo !== 0))) { // histereza dla niskiego alarmu - alarm niski jeśli istnieje zawsze ma index 0
                                daneWart[1] = daneWart[1] - _dane[0].histLo; // następne pole (zazwyczaj ostrzeżenie) będzie pomniejszone o wartość histerezy
                                daneWart.splice(1, 0, _dane[0].histLo); // na pozycji 1 dodaj jedną warość (_dane[0].histLo) i żadnej nie usuwaj (0)
                                daneKolor.splice(1, 0, 'orange');
                            }
                            if ((_dane[4].hi !== 0) && (_dane[4].histHi !== 0) && (!isNaN(_dane[4].histHi))) { // alarm wysoki zawsze na ostatnim indeksie, dla naszych zasrosowań zawsze jest max 5 zakresów
                                var index = daneWart.length - 1;
                                daneWart[index - 1] = daneWart[index - 1] - _dane[4].histHi;
                                daneWart.splice(index, 0, _dane[4].histHi);
                                daneKolor.splice(index, 0, 'orange');
                            }
                            // stworzenie łuków z zakresami
                            arc2 = d3.svg.arc()
                                .outerRadius(width * _arcThickness - 2)
                                .innerRadius(width * _arcThickness - (width / 4 * _sectorsThicknes));
                            tempPie = d3.layout.pie()
                                .value(function (d) {
                                    return d;
                                })
                                .sort(null)
                                .startAngle(-90 * (Math.PI / 180))
                                .endAngle(90 * (Math.PI / 180));
                            grupa2 = canvas.append("g")
                                .attr("class", "zakresy");
                            zakresy = grupa2.selectAll('.arc')
                                .data(tempPie(daneWart))
                                .enter()
                                .append("g")
                                .attr("class", "arc")
                                .attr('fill', _fill);
                            zakresy.append("path")
                                .attr("d", arc2)
                                .attr("transform", przesuniecie)
                                .style("fill", function (d, i) {
                                    return daneKolor[i];
                                });


                            //                            zakresy.append("text")
                            //                                .attr("text-anchor", "middle")
                            //                                .attr('font-family', 'Arial')
                            //                                .attr("fill", _labelFontColor)
                            //                                .attr('font-size', fontSize)
                            //                                //.attr("class", "label")
                            //                                .attr("transform", function (d) {
                            //                                    return "translate(" + arc2.centroid(d) + ")";
                            //                                })
                            //                                .attr("text-anchor", "middle")
                            //                                .text(function (d, i) {
                            //                                    //console.log(d.value);
                            //                                    //return d.value;
                            //                                    return '66';
                            //                                });


                            // dodanie labelki z wartością
                            labelWart = canvas.append("text")
                                .text('_wart')
                                .attr('font-weight', 'bold')
                                .attr('font-family', 'Arial')
                                .attr('fill', _labelFontColor)
                                .attr('font-size', fontSize * 2.9)
                                .attr("class", 'chartArcsGaugeUnit')
                                .attr("transform", przesuniecie)
                                .attr("dy", "-0.6em")
                                .style("text-anchor", "middle");
                            // dodanie labelki z jednostką analogu
                            labelUnit = canvas.append("text")
                                .attr("text-anchor", "middle")
                                .attr('font-family', 'Arial')
                                .attr("fill-opacity", 0.8)
                                .attr("fill", _labelFontColor)
                                .attr('font-size', fontSize * 1.2)
                                .attr("class", "label")
                                .attr("transform", przesuniecie)
                                .attr("dy", "-0.1em")
                                .text(_units);
                            // labelka z opisem zmiennej wyświetlanej na kontrolce
                            labelOpis = canvas.append("foreignObject") // foreinObject pozwala na zawijanie długich tekstów
                                .attr('y', width)
                                .attr("height", 30)
                                .attr("width", parent.offsetWidth - 10)
                                .attr('style', 'word-wrap: break-word; text-align:center;')
                                //.attr('font-weight', 'bold')
                                .attr("text-anchor", "middle")
                                .attr('font-family', 'Arial')
                                .style("color", _labelFontColor)
                                .attr('font-size', fontSize * 1.4)
                                .attr("class", "label")
                                .text(_label);
                            labelMin = canvas.append("text")
                                .attr("text-anchor", "middle")
                                .attr('font-family', 'Arial')
                                .attr("fill-opacity", 0.8)
                                .attr("fill", _labelFontColor)
                                .attr('font-size', fontSize * 1.2)
                                .attr("class", "label")
                                .attr("transform", "translate(" + (x - width * _arcThickness * 0.8) + "," + y + ")")
                                .attr("dx", "0.3em")
                                .text(_minValue);
                            labelMax = canvas.append("text")
                                .attr("text-anchor", "middle")
                                .attr('font-family', 'Arial')
                                .attr("fill-opacity", 0.8)
                                .attr("fill", _labelFontColor)
                                .attr('font-size', fontSize * 1.2)
                                .attr("class", "label")
                                .attr("transform", "translate(" + (x + width * _arcThickness * 0.8) + "," + y + ")")
                                .attr("dx", "-0.3em")
                                .text(_maxValue);
                        },

                        update = function () {
                            var kolor,
                                wartoscKolor = 0,
                                wartosHi,
                                endAngle;

                            endAngle = (-90 + (_value / _maxValue) * 180);
                            if ((_value > _minValue) && (_value < _maxValue)) { // wartość mieści się w zakresie
                                for (i = 0; i < daneWart.length; i += 1) { // pobranie odpowiadającego wartości koloru
                                    wartoscKolor += daneWart[i];
                                    if (_value < wartoscKolor) {
                                        kolor = daneKolor[i];
                                        break;
                                    }
                                }
                                endAngle = endAngle * Math.PI / 180; // przeliczenie na radiany
                            } else if (_value >= _maxValue) { // wartość poza zakresem max, będzie narysowany pełny łuk 180stopni                        
                                endAngle = 90 * (Math.PI / 180);
                                kolor = daneKolor[daneKolor.length - 1];
                            } else if (_value <= _minValue) { // wartość poza zakresem min
                                endAngle = -90 * (Math.PI / 180);
                                kolor = daneKolor[0];
                            }

                            path.style("fill", kolor);
                            path.datum(endAngle);
                            path.transition()
                                .duration(_duration)
                                .attrTween("d", arcTween);

                            labelWart.data(_value)
                                .transition()
                                .duration(0)
                                .text(function (d) {
                                    return d.toFixed(_decimals);
                                });
                        };

                    if (init === false) {
                        init = true;
                        canvas = d3.select(this).append('svg').attr("class", "gauge-svg");
                        render();
                        update();
                    } else {
                        update();
                    }
                });

            }


            //   ___    ____     ____       _   _____
            //  / _ \  |  _ \   / ___|     | | | ____|
            // | | | | | |_) | | |      _  | | |  _|
            // | |_| | |  __/  | |___  | |_| | | |___
            //  \___/  |_|      \____|  \___/  |_____|
            component.arcThickness = function (_) {
                if (!arguments.length) {
                    return _arcThickness;
                }
                _arcThickness = _;
                return component;
            };
            component.fill = function (_) {
                if (!arguments.length) {
                    //_fill = _;
                    return _fill;
                }
                _fill = _;
                return component;
            };
            component.dane = function (_) {
                if (!arguments.length) {
                    return _dane;
                }
                _dane = _;
                return component;
            };
            component.units = function (_) {
                if (!arguments.length) {
                    return _units;
                }
                _units = _;
                return component;
            };
            component.labelFontColor = function (_) {
                if (!arguments.length) {
                    return _labelFontColor;
                }
                _labelFontColor = _;
                return component;
            };
            component.decimals = function (_) {
                if (!arguments.length) {
                    return _decimals;
                }
                _decimals = _;
                return component;
            };
            component.sectorsThicknes = function (_) {
                if (!arguments.length) {
                    return _sectorsThicknes;
                }
                _sectorsThicknes = _;
                return component;
            };
            // ------------------------------------------------------------------------------------------------------------------------------------------------------------------
            component.render = function () {
                component();
                return component;
            };
            component.value = function (_) {
                if (!arguments.length) {
                    return _value;
                }
                _value = [_];
                zaznaczonyElementHtml.datum([_value]);
                return component;
            };
            component.minValue = function (_) {
                if (!arguments.length) {
                    return _minValue;
                }
                _minValue = _;
                return component;
            };
            component.maxValue = function (_) {
                if (!arguments.length) {
                    return _maxValue;
                }
                _maxValue = _;
                return component;
            };
            component.label = function (_) {
                if (!arguments.length) {
                    return _label;
                }
                _label = _;
                return component;
            };
            component.duration = function (_) {
                if (!arguments.length) {
                    return _duration;
                }
                _duration = _;
                return component;
            };
            return component;
        };


    return {
        init: init
    };


});