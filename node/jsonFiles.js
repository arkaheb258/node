/**
*  @file jsonFiles.js
*  @brief Podstawianie wartości parametró w plikach JSON
*/
'use strict';
var fs = require('fs');

/**
 * Description
 * @method szukajPar
 * @param {} gpar
 * @param {} naz
 * @return Literal
 */
function szukajPar(gpar, naz) {
  var i;
  if (gpar && gpar.DANE) {
    for (i in gpar.DANE) {
      if (gpar.DANE.hasOwnProperty(i) && gpar.DANE[i].NAZ === naz) { return gpar.DANE[i].WART; }
    }
  }
  return null;
}

/**
 * Description
 * @method czytajPlikParametrowWiz
 * @param {} data
 * @param {} gpar
 */
function czytajPlikParametrowWiz(fileToRead, gpar, callback) {
  fs.readFile(__dirname + fileToRead, 'utf8', function (err, data) {
    if (err) {
      callback('error: ' + __dirname + fileToRead);
      return;
    }
    var temp = null;
    var js;
    var g, p, s;
    try {
      js = JSON.parse(data);
      if (js.DANE) {
        for (g in js.DANE) {
          if (typeof js.DANE[g] === 'object') {
            for (p in js.DANE[g]) {
              if (typeof js.DANE[g][p] === 'object') {
                for (s in js.DANE[g][p]) {
                  if (typeof js.DANE[g][p][s] === 'object' && js.DANE[g][p][s].WART !== undefined) {
                    // if (js.DANE[g][p][s].TYP === 'pCzas') console.log(js.DANE[g][p][s].WART);
                    temp = szukajPar(gpar, s);
                    if (temp === null) {
                      // console.log('P - Nie znaleziono parametru \"' + s + '\"');
                    } else if (js.DANE[g][p][s].WART !== temp) {
      //console.log(' '+ s + ': ' + js.DANE[g][p][s].WART + ' -> ' + temp);
                      js.DANE[g][p][s].WART = temp;
                    }
                  }
                }
              }
            }
          }
        }
      }
      callback(js);
      return;
    } catch (err2) {
      console.log(data);
      callback('Błąd pliku parametrów (JSON parser)');
      return;
    }
  });
}

/**
 * Description
 * @method czytajPlikSygnalow
 * @param {} data
 * @param {} gpar
 * @return js
 */
function czytajPlikSygnalow(fileToRead, gpar, callback) {
  fs.readFile(__dirname + fileToRead, 'utf8', function (err, data) {
    if (err) {
      callback('error: ' + fileToRead);
      return;
    }
    var temp = null;
    var js = JSON.parse(data);
    var g, p, s;
    if (typeof js === 'object') {
      for (g in js) {
        if (typeof js[g] === 'object') {
          for (p in js[g]) {
            //TODO: Paweł - poprawa reakcji na undefined przy odchudzonym pliku
            // if (js[g][p] === null) {
              // delete js[g][p];
            // } else
            if (typeof js[g][p] === 'string') {
              //TODO: Paweł - poprawa reakcji na undefined przy odchudzonym pliku
              // console.log(p+': '+js[g][p]);
              // if (js[g][p] === '') {
                // delete js[g][p];
              // } else
              if (js[g][p].indexOf('_par_') === 0) {
                s = js[g][p].substr(5);
                temp = szukajPar(gpar, s);
                if (temp === null) {
                  console.log('S - Nie znaleziono parametru \"' + s + '\"');
                } else {
    //              console.log(' '+ s + ': ' + js[g][p] + ' -> ' + temp);
                  js[g][p] = temp;
                }
              }
            }
          }
        }
      }
    }
    callback(js);
    return;
  });
}

var str_KomunikatyJednSilnVacon = [
  "przekroczony dopuszczalny prąd wyjściowy",
  "przekroczone napięcie w obwodzie DC",
  "doziemienie silnika",
  "stycznik ładowania obwodu DC nadal otwarty",
  "zatrzymanie awaryjne",
  "nasycenie",
  "usterka systemowa",
  "zbyt niskie napięcie DC",
  "zanik fazy zasilającej",
  "zanik fazy wyjściowej",
  "czoper hamowania",
  "zbyt niska temperatura radiatora",
  "przekroczona temperatura radiatora 90°C",
  "utyk silnika",
  "przekroczona temperatura silnika",
  "niedociążenie silnika",
  "asymetria miedzy jednostkami pracującymi równolegle",
  "błąd sumy kontrolnej pamięci EEPROM",
  "błąd licznika",
  "błąd watchdoga mikroprocesora",
  "zabezpieczenie przed rozruchem",
  "termistor (przegrzany silnik)",
  "bezpieczne wyłączenie",
  "temperatura IGBT (sprzętowe zabezpieczenie nadprądowe)",
  "awaria wentylatora",
  "błąd transmisji CAN",
  "błąd programowy aplikacji",
  "niewłaściwy kontroler",
  "zmieniono kartę rozszerzeń lub sterującą (parametry bez zmian)",
  "dodano kartę rozszerzeń (parametry bez zmian)",
  "usunięto kartę rozszerzeń (parametry bez zmian)",
  "nieznana karta rozszerzeń lub moduł mocy",
  "temperatura IGBT (zabezpieczenie nadprądowe)",
  "temperatura rezystora hamowania",
  "błąd enkodera",
  "zmieniono kartę rozszerzeń lub sterującą (parametry domyślne)",
  "dodano kartę rozszerzeń (parametry domyślne)",
  "operacja dzielenia przez zero w aplikacji",
  "prąd wejścia analogowego <4mA)",
  "błąd zewnętrzny",
  "błąd komunikacji z panelem",
  "błąd komunikacji po magistrali",
  "błąd slotu rozszerzeń",
  "przekroczona temperatura (karta Pt100)",
  "nieudana procedura autotuningu",
  "stan hamulca inny niż sygnał sterujący",
  "błąd komunikacji Master/Follower",
  "brak przepływu w układzie chłodzenia",
  "prędkość silnika niezgodna z wartością zadana",
  "brak zezwolenia na prace",
  "stop awaryjny",
  "otwarty stycznik",
  "przekroczona temperatura  ostrzeżenie",
  "przekroczona temperatura  alarm",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa",
  "rezerwa"
];
var str_KomunikatyJednSiecVacon = [
  "przekroczony dopuszczalny prąd wyjściowy",
  "przekroczone napięcie w obwodzie DC",
  "wykrył doziemienie w sieci zasilającej",
  "nasycenie",
  "usterka systemowa",
  "zbyt niskie napięcie DC",
  "błąd synchronizacji z siecią zasilającą",
  "zanik fazy zasilającej",
  "zbyt niska temperatura radiatora",
  "przekroczona temperatura radiatora 90°C",
  "przeciążenie",
  "błąd watchdoga mikroprocesora",
  "termistor (przegrzany silnik)",
  "temperatura IGBT (sprzętowe zabezpieczenie nadprądowe)",
  "awaria wentylatora",
  "błąd programowy aplikacji",
  "zmieniono kartę rozszerzeń lub sterującą (parametry bez zmian)",
  "dodano kartę (parametry bez zmian)",
  "usunięto kartę rozszerzeń (parametry bez zmian)",
  "nieznana karta rozszerzeń lub moduł mocy",
  "temperatura IGBT (zabezpieczenie nadprądowe)",
  "błąd zewnętrzny",
  "błąd komunikacji po magistrali",
  "błąd slotu lub karty rozszerzeń",
  "błąd komunikacji Master/Follower",
  "błąd synchronizacji z siecią  brak fazy wejściowej",
  "błąd synchronizacji z siecią",
  "otwarty stycznik",
  "błąd wentylatora filtra wejściowego",
  "przegrzanie filtra wejściowego",
  "rezerwa",
  "rezerwa"
];

/**
 * Description
 * @method czytajPlikKomunikatow
 * @param {} text
 * @param {} word
 * @return output
 */
function czytajPlikKomunikatow(text, word) {
//    text = text.replace(/\t(.*)/mg, '$1');  //usuniecie tabulacji na początku wierszy
  var rows = text.split('\n');
  var output = [];
  var out_string = ''; //do generowania listy komunikatów dla serwisu
  var i = 0;
  var l, j;
  for (l in rows) {
    if (rows.hasOwnProperty(l)) {
      var row = rows[l].trim();
      if (row.search(';') === -1) continue; 
      if (row.search('x') === 0) {
        var nr = (i - (i % 16)) / 16;
        var bit = (i % 16);
        var opis = row.substring(row.search(/\(\*/g) + 2, row.search(/\*\)/g)).trim();
        var nb = 0;
        if (output[nr] === undefined) { output[nr] = {opis: 'opis slowa ' + nr, nr: nr, bity: []}; }
        if (opis.indexOf('_nb_') === 0) {
          opis = opis.substring(4).trim();
          nb = 1;
        }
  //        output[nr].bity[bit] = {nr: nr, bit: bit, opis: opis};
        out_string += 'Kod ' + (nr * 16 + bit) + ': ' + opis + '\n';
        output[nr].bity[bit] = {nb: nb, bit: bit, opis: opis};
        i += 1;
      } else {
        var opisStr = row.substring(row.search(/\(\*/g) + 2, row.search(/\*\)/g)).trim();
        if (row.search('str_KomunikatyJednSilnVacon') !== -1) {
          for (j in str_KomunikatyJednSilnVacon) {
            var nr = (i - (i % 16)) / 16;
            var bit = (i % 16);
            // var opis = row.substring(row.search(/\(\*/g) + 2, row.search(/\*\)/g)).trim();
            var opis = str_KomunikatyJednSilnVacon[j];
            var nb = 0;
            if (output[nr] === undefined) { output[nr] = {opis: 'opis slowa ' + nr, nr: nr, bity: []}; }
            if (opis.indexOf('_nb_') === 0) {
              opis = opis.substring(4).trim();
              nb = 1;
            }
            opis = opisStr + ' ' + opis;
            out_string += 'Kod ' + (nr * 16 + bit) + ': ' + opis + '\n';
            output[nr].bity[bit] = {nb: nb, bit: bit, opis: opis};
            i += 1;
          }
        } else if (row.search('str_KomunikatyJednSiecVacon') !== -1) {
          for (j in str_KomunikatyJednSiecVacon) {
            var nr = (i - (i % 16)) / 16;
            var bit = (i % 16);
            // var opis = row.substring(row.search(/\(\*/g) + 2, row.search(/\*\)/g)).trim();
            var opis = str_KomunikatyJednSiecVacon[j];
            var nb = 0;
            if (output[nr] === undefined) { output[nr] = {opis: 'opis slowa ' + nr, nr: nr, bity: []}; }
            if (opis.indexOf('_nb_') === 0) {
              opis = opis.substring(4).trim();
              nb = 1;
            }
            opis = opisStr + ' ' + opis;
            out_string += 'Kod ' + (nr * 16 + bit) + ': ' + opis + '\n';
            output[nr].bity[bit] = {nb: nb, bit: bit, opis: opis};
            i += 1;
          }
        }
      }
    }
  }
  if (word) { return out_string; } //else {
  return output; //}
}

module.exports.czytajPlikParametrowWiz = czytajPlikParametrowWiz;
module.exports.czytajPlikSygnalow = czytajPlikSygnalow;
module.exports.czytajPlikKomunikatow = czytajPlikKomunikatow;
