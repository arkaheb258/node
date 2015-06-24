// parametry.js
(function () {
    'use strict';
  var common = require('./common.js');
  var fs = require('fs');
  var freshPar = 0;

  /**
   * Description
   * @method pobierzParametryPLC
   * @param {} stradaReadAll - funkcja odczytujaca obszary
   * @param {} par
   * @param {function} callback
   */
  function pobierzParametryPLC(stradaReadAll, par, callback) {
    console.log('pobierzParametryPLC');
    stradaReadAll(0x307, 0, null, function (dane) {
      if (!dane || dane.error) {
        console.log('blad odczytu - readAll');
        if (callback) callback(null);
        return;
      }

      var temp = common.decodeStrada307(dane, par);
      if (!temp) {
        console.log('Błędne parametry - 0x307');
      } else {
        console.log('0x307 - Struktura parametrów zgodna z danymi konfiguracyjnymi');
      }
      if (callback) callback(temp);
    });
  }

  /**
   * Description
   * @method wyluskajParametry
   * @param {} data
   * @return out
   */
  function wyluskajParametry(data) {
// return data;
    var js = JSON.parse(data);
    var out = [];
    if (js.DANE) {
      out = js;
      for (var i in js.DANE) {
        if (js.DANE.hasOwnProperty(i)) {
          var temp = js.DANE[i];
          switch (temp.NAZ) {
          case 'sKonfTypKombajnu':
          case 'rKonfWersjaJezykowa':
//            console.log(temp.NAZ, ': ', temp.WART);
          case 'sKonfNrKomisji':
          case 'sKonfNazwaKopalni':
          case 'sKonfNrSciany':
          case 'sKonfWersjaProgramu':
          case 'rKonfCzasLetni':
          case 'rKonfCzasStrefa':
            out[temp.NAZ] = temp.WART;
            break;
          case 'rZapisTyp':
            out[temp.NAZ] = temp.WART;
            break;
          case 'tZapisCzasZrzutu':
            out[temp.NAZ] = common.codesysTimeToMs(temp.WART.toString());
            break;
          default:
            break;
          }
        }
      }
    }
//console.error(out);
    return out;
  }

  /**
   * Description
   * @method pobierzPlikParametrowLoc
   * @param {} callback
   */
  function pobierzPlikParametrowLoc(callback) {
    // console.log('pobierzPlikParametrowLoc');
    var file = process.env.PARAM_LOC_FILE || 'default.json';
    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        callback(null);
        return;
      }
      if (data.length > 0) {
        callback(wyluskajParametry(data));
      } else {
        callback(null);
      }
    });
  }

  /**
   * Description
   * @method pobierzPlikParametrowFTP
   * @param {} callback
   */
  function pobierzPlikParametrowFTP(callback) {
    // console.log('pobierzPlikParametrowFTP');
    common.pobierzPlikFTP({host : process.env.PLC_IP || '192.168.3.30', 
    user : 'admin', password : 'admin', file : 'ide/Parametry/Temp.par'},
    function (string) {
      if (string === false) {
        console.log('FTP par error');
        callback(null);
        return;
      }
      callback(wyluskajParametry(string));
    });
  }

  /**
   * Description
   * @method zapiszParametryLoc
   * @param {} filename
   * @param {} temp
   */
  function zapiszParametryLoc(filename, temp) {
    if (!temp) {
      console.log('Błąd parametrów - brak zapisu');
      return;
    }
    temp.DATA = (new Date()).toISOString().substring(0, 10);
    //podmiana wartości całkowitych x na x.0 wyrażeniem regularnym
    fs.writeFile(filename, 
    JSON.stringify(temp).replace(/"WART":([-]?)(\d+),/g, '"WART":$1$2.0,'),
    function (err) {
      if (err) { console.log(err); } else { console.log('Zapisano parametry domyślne'); }
    });
  }

  function zapiszParametry(temp, socket) {
    if (temp !== null) {
      zapiszParametryLoc(process.env.PARAM_LOC_FILE || 'default.json', temp);
      common.storeGpar(temp);
      freshPar = 2;
      setTimeout(function () {
        freshPar = 0;
      }, 1000);
      socket.emit('gpar', temp);
    }
  }
  
  /**
   * Description
   * @method odswierzParametry
   * @param {} callback
   * @param {} force
   */
  module.exports.odswierzParametry = function(stradaReadAll, socket, callback, force) {
    console.log('odswierzParametry ', force, ' ', freshPar);
    var temp = common.getGpar();
    if (!force && freshPar > 0) {
      socket.emit('gpar', temp);
      if (callback) { callback(temp); }
      return;
    }
    freshPar = 1;
    pobierzPlikParametrowLoc(function (par) {
      if (par && !force) {
        console.log('Wczytano parametry domyślne');
        pobierzParametryPLC(stradaReadAll, par, function (temp) {
          if (!temp) {
            console.log('Błędne parametry - pobranie struktury parametrów ze sterownika');
            pobierzPlikParametrowFTP(function (par2) {
              if (par2) {
                console.log('Pobrano parametry przez FTP');
                pobierzParametryPLC(stradaReadAll, par2, 
                function (temp) {
                  zapiszParametry(temp, socket);
                  if (callback) { callback(temp); }
                });
              } else {
                var err = 'Nie pobrano parametrow przez FTP';
                console.log(err);
                freshPar = 0;
                if (callback) { callback({error: err}); }
              }
            });
          } else {
            zapiszParametry(temp, socket);
            if (callback) { callback(temp); }
          }
        });
      } else {
        pobierzPlikParametrowFTP(function (par2) {
          if (par2) {
            console.log('Pobrano parametry przez FTP f');
            // console.log(par2.WER);
            pobierzParametryPLC(stradaReadAll, par2, function (temp) {
              zapiszParametry(temp, socket);
              if (callback) { callback(temp); }
            });
          } else {
            var err = 'Nie pobrano parametrow przez FTP f';
            freshPar = 0;
            console.log(err);
            if (callback) { callback({error: err}); }
          }
        });
      }
    });
  }

}());
