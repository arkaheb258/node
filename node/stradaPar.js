// stradaPar.js
'use strict';
var common = require('./common.js');
var fs = require('fs');

module.exports = function(Strada) {
  var freshPar = 0;

  /**
   * Description
   * @method zapiszParametry
   * @param {} filename
   * @param {} temp
   */
  Strada.prototype.zapiszParametry = function(temp, toFile) {
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
    self.socket.emit('gpar', temp);
    setTimeout(function () {
      freshPar = 0;
    }, 1000);
  }

  /**
   * Description
   * @method odswierzParametry
   * @param {} callback
   * @param {} force
   */
    //dodac callback z zapisem(store + emit)
  Strada.prototype.odswierzParametry = function(force) {
    var self = this;
    console.log('odswierzParametry ', (force) ? true : false );
    var gpar = common.getGpar();
    
    console.log('0x307 - Pobranie parametrow Strada');
    self.readAll(0x307, 0, null, function (stradaDane) {
      if (!stradaDane || stradaDane.error) {
        console.log('blad odczytu - readAll');
        return;
      }
      gpar = common.decodeStrada307(stradaDane, gpar);
      if (gpar) {
        self.zapiszParametry(gpar);
        console.log('0x307 - Struktura parametrów poprawna');
        return;
      } 
      // console.log('Struktura parametrów niepoprawna');
      fs.readFile(self.parFilename, 'utf8', function (err, data) {
        console.log('Wczytano parametry JSON');
        gpar = common.wyluskajParametry(data);
        gpar = common.decodeStrada307(stradaDane, gpar);
        if (gpar) {
          self.zapiszParametry(gpar);
          console.log('0x307 - Struktura parametrów poprawna');
          return;
        } 
        // console.log('Struktura parametrów niepoprawna');
        common.pobierzPlikFTP('ide/Parametry/Temp.par', null, function (string) {
          gpar = common.wyluskajParametry(string);
          if (gpar) {
            console.log('Wczytano parametry FTP');
            gpar = common.decodeStrada307(stradaDane, gpar);
            if (gpar) {
              self.zapiszParametry(gpar, true);
              console.log('0x307 - Struktura parametrów poprawna');
              return;
            } 
          } 
          self.zapiszParametry(gpar);
          console.log('Nie pobrano parametrow FTP');
        });
      });
    });
  }

  return Strada;
};
 