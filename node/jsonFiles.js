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
  var l;
  for (l in rows) {
    if (rows.hasOwnProperty(l)) {
      var row = rows[l].trim();
      if (row.search(';') !== -1 && row.search('x') === 0) {
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
      }
    }
  }
  if (word) { return out_string; } //else {
  return output; //}
}

module.exports.czytajPlikParametrowWiz = czytajPlikParametrowWiz;
module.exports.czytajPlikSygnalow = czytajPlikSygnalow;
module.exports.czytajPlikKomunikatow = czytajPlikKomunikatow;
