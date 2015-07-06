﻿// stradaPar.js
'use strict';
var common = require('./common.js');
var decode = require('./decode.js');
var fs = require('fs');

module.exports = function (Strada) {
  var freshPar = 0;

  /**
   * Description
   * @method zapiszParametry
   * @param {} filename
   * @param {} temp
   */
  Strada.prototype.zapiszParametry = function (temp, toFile) {
    // console.log('zapiszParametry');
    var self = this;
    if (!temp) {
      console.log('Błąd parametrów - brak zapisu');
      return;
    }
    temp.DATA = (new Date()).toISOString().substring(0, 10);
    if (toFile) {
      fs.writeFile(self.parFilename,
        //podmiana wartości całkowitych x na x.0 wyrażeniem regularnym
        JSON.stringify(temp).replace(/"WART":([-]?)(\d+),/g, '"WART":$1$2.0,'),
        function (err) {
          if (err) { console.log(err); } else { console.log('Zapisano parametry domyślne'); }
        });
    }
    freshPar = 2;
    common.storeGpar(temp);
    // console.log('zapis_gpar', temp.TYP);
    self.socket.emit('gpar', temp);
    setTimeout(function () {
      freshPar = 0;
    }, 1000);
  };

  // dopisac cykliczna funkcje (interval) ktora przy braku paramatrow bedzie probowac je odczytac
  /**
   * Description
   * @method odswierzParametry
   * @param {} callback
   * @param {} force
   */
  Strada.prototype.odswierzParametry = function (force) {
    if (freshPar === 1) { return; }
    freshPar = 1;   //parametry w trakcie odswierzania
    var self = this;
    console.log('odswierzParametry ', (force) ? 'force' : '');
    var gpar = common.getGpar();
    console.log('Pobranie parametrow Strada (0x307)');
    self.readAll(0x307, [0, 0], function (stradaDane) {
      if (!stradaDane || stradaDane.error) {
        console.log('blad odczytu - odswierzParametry (readAll)', stradaDane ? stradaDane.error : '');
        return;
      }
      gpar = decode.decodeStrada307(stradaDane.dane, gpar);
      if (gpar) {
        self.zapiszParametry(gpar);
        console.log('Struktura parametrów poprawna (0x307) mem');
        return;
      }
      // console.log('Struktura parametrów niepoprawna');
      fs.readFile(self.parFilename, 'utf8', function (err, data) {
        console.log('Wczytano parametry JSON');
        gpar = decode.decodeStrada307(stradaDane.dane, data);
        if (gpar) {
          self.zapiszParametry(gpar);
          console.log('Struktura parametrów poprawna (0x307) loc');
          return;
        }
        // console.log('Struktura parametrów niepoprawna');
        common.pobierzPlikFTP('ide/Parametry/Temp.par', null, function (string) {
          console.log('Wczytano parametry FTP');
          gpar = decode.decodeStrada307(stradaDane.dane, string);
          if (gpar) {
            self.zapiszParametry(gpar, true);
            console.log('Struktura parametrów poprawna (0x307) ftp');
            return;
          }
          self.zapiszParametry(gpar);
          console.log('Nie pobrano parametrow FTP');
        });
      });
    });
  };

  return Strada;
};
