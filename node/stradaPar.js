/**
*  @file stradaPar.js
*  @brief Odświerzania parametrów
*/
'use strict';
var argv = require('minimist')(process.argv.slice(2));
var common = require('./common.js');
var decode = require('./decode.js');
var fs = require('fs');

module.exports = function (Strada) {
  var freshPar = 0;

  /**
   * Description
   * @method zapiszParametry
   * @memberof! Strada#
   * @param {} filename
   * @param {} temp
   */
  Strada.prototype.zapiszParametry = function (temp, toFile) {
    // console.log('zapiszParametry');
    var self = this;
    if (!temp) {
      console.log('Błąd parametrów - brak zapisu');
      setTimeout(function () {
        self.socket.emit('io_emit', ['get_gpar', true]);
      }, 1000);
      return;
    }
    temp.DATA = (new Date()).toISOString().substring(0, 10);
    if (toFile) {
      fs.writeFile(self.parFilename,
        //podmiana wartości całkowitych x na x.0 wyrażeniem regularnym
        JSON.stringify(temp).replace(/"WART":([\-]?)(\d+),/g, '"WART":$1$2.0,'),
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
    }, 2000);
  };

  /**
   * Description
   * @memberof! Strada#
   * @method odswierzParametry
   * @param {} callback
   * @param {} force
   */
  Strada.prototype.odswierzParametry = function (force) {
    console.log('odswierzParametry ', (force) ? 'force' : '', (freshPar) ? 'fresh' : '');
    if (!force && freshPar) { return; }
    freshPar = 1;   //parametry w trakcie odswierzania
    var self = this;
    var gpar = common.getGpar();
    console.log('Pobranie parametrow Strada (0x307)');
    self.readAll(0x307, [0, 0], function (stradaDane) {
      if (!stradaDane || stradaDane.error) {
        console.log('blad odczytu - odswierzParametry (readAll)', stradaDane ? stradaDane.error : '');
        return;
      }
      if (gpar) {
        gpar = decode.decodeStrada307(stradaDane.dane, gpar);
      } else { console.log('Brak parametrów'); }
      if (gpar) {
        self.zapiszParametry(gpar);
        console.log('Struktura parametrów poprawna (0x307) mem');
        return;
      }
      // console.log('Struktura parametrów niepoprawna');
      fs.readFile(self.parFilename, 'utf8', function (err, data) {
        if (err) {
          console.log('Błąd wczytania parametrow JSON');
          // return;
        }
        // console.log('Wczytano parametry JSON');
        gpar = decode.decodeStrada307(stradaDane.dane, data);
        if (gpar) {
          self.zapiszParametry(gpar);
          console.log('Struktura parametrów poprawna (0x307) loc');
          return;
        }
        // console.log('Struktura parametrów niepoprawna');
        var con_par = {host : '192.168.3.30', user : 'admin', password : 'admin', path: 'ide/Parametry/Temp.par'};
        if (argv.wago) {
          con_par.password = 'wago';
          con_par.path = 'PLC/Parametry/Temp.par';
        }
        common.pobierzPlikFTP(con_par, function (string) {
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
