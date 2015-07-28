/**
*  @file stradaConn.js
*  @brief Kolejkowanie wiadomosci Strada
*/
'use strict';
module.exports = function (Strada) {
  var debug = false;
  // debug = true;

  /**
  * Przegląd kolejki wiadomości w celu sprawdzenia timeoutów
  * Wyslanie nastepnej wiadomosci z kolejki
  * @memberof! Strada#
  */
  Strada.prototype.clearQueue = function (force) {
    var self = this;
    if (self.queue.length === 0) { return; }
    // console.log('queue.length: ' + self.queue.length);
    // if (force) console.log('clearQueue ' + self.queue.length);
    // czyszczenie timeoutow
    var i;
    var el;
    for (i = 0; i < self.queue.length; i += 1) {
      el = self.queue[i];
      if (force || (Date.now() - el.time) > el.timeout) {
        self.queue.splice(i, 1)[0].callback({error: 'timeout'});
        if (debug) { console.log('self.queue.splice + timeout', force, (Date.now() - el.time), el.timeout); }
        i -= 1;
      }
    }
    // wyslanie nastepnego zapytania
    if (!self.lastSent && self.queue.length > 0) {
      el = self.queue[0];
      self.send(el.instrNo, el.instrID, el.data);
      if (self.queue.length > 2) {
        console.log('queue.length = ', self.queue.length);
      }
    }
  };

  /**
   *  @brief Rekurencyjne odczytanie wielu obszarow
   *  @memberof! Strada#
   */
  Strada.prototype.readAll = function (instrNo, dane2, callback, tempKonf) {
    // console.log('readAll', instrNo, dane2);
    var self = this;
    var uiCzytajObszarNr = dane2[0];
    if (uiCzytajObszarNr === 0) {
      tempKonf = {dane: new Buffer(0), DataLen: 0};
    }
    self.stradaEnqueue(instrNo, dane2, function (dane) {
      // console.log('stradaEnqueue', dane.dane);
      if (!dane.dane || (typeof dane.dane === 'string')) {
        if (callback) { callback(dane); }
      } else {
        tempKonf.dane = new Buffer.concat([tempKonf.dane, dane.dane]);
        tempKonf.DataLen = dane.DataLen;
        if (uiCzytajObszarNr > 3) {
          console.log('nie ma końca - (uiCzytajObszarNr > 3)');
          return;
        }
        // console.log('readAll rep');
        if (tempKonf.dane.length < tempKonf.DataLen) {
          // console.log('readAll rep 2');
          dane2[0] = uiCzytajObszarNr + 1;
          self.readAll(instrNo, dane2, callback, tempKonf);
        } else {
          // console.log('readAll rep c');
          if (callback) { callback(tempKonf); }
        }
      }
    });
  };

  /**
   *  @brief Dodanie rozkazu do kolejki
   *  @memberof! Strada#
   *  @param [in] instrNo Numer instrukcji
   *  @param [in] data Dane instrukcji
   *  @param [in] callback Funkcja wywolywana po odebraniu odpowiedzi
   *  @param [in] timeout Czas oczekiwania w kolejce
   */
  Strada.prototype.stradaEnqueue = function (instrNo, data, callback, timeout) {
    // if (instrNo.length == 2) console.log('stradaEnqueue', instrNo, data);
    var self = this;
    if (!callback) { callback = console.log; }
    if (!timeout) { timeout = 1000; }
    // console.log(' stradaEnqueue', instrNo, timeout);
    self.instrID = (self.instrID + 1) % 0x10000;
    self.clearQueue();
    if (!self.PLCConnected) {
      // console.log('instrNoo: ' + instrNo.toString(16));
      // console.log('PLC nie polaczony');
      callback({error: 'PLC nie polaczony'});
      return 1;
    }
    // console.log('queue.length: ' + self.queue.length);
    if (self.queue.length > 20) {
      callback({error: 'Przepełnienie kolejki'});
      return;
    }
    self.queue.push({
      instrNo: instrNo,
      instrID: Number(self.instrID),
      data: data,
      callback: callback,
      timeout: timeout,
      time: Date.now()
    });
    self.clearQueue();
  };

  /**
   *  @brief wywolanie callbacka przy otrzymaniu danych
   *  @memberof! Strada#
   *  @param [in] dane
   *  @param [in] retry - ponowne wrzucenie do kolejki tego samego zapytania (przy zapytaniu asynchronicznym)
   */
  Strada.prototype.response = function (dane, retry) {
    var self = this;
    var el = self.queue.shift();
    if (el) {
      if (debug) {
        console.log('response()', el.instrNo.toString(16), el.instrID, retry ? true : false);
        if (dane.error) console.log(dane);
      }
      if (retry) {
        if (el.instrNo.length === 2) { el.instrNo = el.instrNo[0]; }
        setTimeout(function () {
          self.stradaEnqueue([el.instrNo, 0x101], el.data, el.callback, el.timeout - (Date.now() - el.time));
        }, 100);
      } else {
        el.callback(dane);
      }
    }
    self.clearQueue();
  };

  /**
  * Odebranie danych ze sterownika protokołem Strada
  * @memberof! Strada#
  * @param dane odebrane dane
  */
  Strada.prototype.getData = function (dane) {
    var self = this;
    // console.log(self.interval);
    // console.log('getData');
    // console.log(dane.length);
    var DstIDR = dane.readUInt32LE(0);
    var SrcIDR = dane.readUInt32LE(4);
    var DirR = dane.readUInt16LE(8);
    var instrNoR = dane.readUInt16LE(10);
    var instrIDR = dane.readUInt16LE(12);
    var DataLenR = dane.readUInt16LE(14);
    var error = true;

    if (self.lastSent) {
      if (debug) { console.log(' getData', instrNoR.toString(16), instrIDR); }
      if (DstIDR !== self.lastSent.SrcID) {
        console.log('Błąd DstID');
      } else if (SrcIDR !== self.lastSent.DstID) {
        console.log('Błąd SrcID');
      } else if (DirR !== 0x10) {
        console.log('Błąd Dir');
        if (DirR === 0x110) {
          console.log('BOT nr=', dane.readInt16LE(16), ':', dane.slice(20), '(', dane.slice(20).length, ')');
        } else {
          console.log('Dir =', DirR);
        }
      } else if (instrNoR !== self.lastSent.instrNo) {
        console.log('Błąd instrNo');
      } else if (instrIDR !== self.lastSent.instrID && instrNoR > 0x200 && instrNoR !== 0x301) {
        //ignorowanie błędu STRADA w rozkazach 0x001- 0x1FF oraz 0x301
        console.log('Błąd instrID jest:', instrIDR, 'powinno być:', self.lastSent.instrID, self.lastSent.instrNo);
        // if (instrIDR < self.lastSent.instrID) {
          // console.log('Wyjscie z funkcji - pominiecie odebranych danych');
          // return;
        // }
      } else if (dane.length - 16 !== DataLenR) {
        console.log('Błąd DataLenR');
      } else {
        error = null;
      }
    }
    // console.log('odebrano ID=' + instrIDR);
    dane = dane.slice(16);  //przesłanie dalej tylko StradaData

    if (instrNoR < 0x200 || instrNoR === 0x301) {
      self.response({error: error, Dir: DirR, dane: dane, RawHead: new Buffer([])});
      self.lastSent = null;
      return;
    }
    // console.log(self.lastSent);
    if (error) {
      // console.log('BOT');
      //BOT
      var error2 = dane.readInt16LE(0);  //numer błędu
      var ErrDesc = dane.slice(4);      //opis błędu
      self.response({error: error2, Dir: DirR, dane: ErrDesc.toString(), DataLen: null, RawHead: null});
      return;
    }
    //SIN
    var sin = {
      statusInfNo : dane.readInt16LE(0),
      instrVer : dane.readUInt16LE(2),
      instrID2 : dane.readUInt16LE(4),
      dataType : dane.readUInt16LE(6),
      dataLen  : dane.readUInt16LE(8),
      dataSegmentNo : dane.readUInt16LE(10),
      rawHead : dane.slice(0, 12)
    };
    dane = dane.slice(12);  //przesłanie dalej tylko SerwerData
    sin.daneLen = dane.length;
    self.lastSent = null;
    // if (instrNoR === 0x302) {
      // dane302 = {error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead};
    // }
    if (sin.DataType === 0) {
      dane = dane.toString();
    }
    if (debug) { console.log('SIN: ', sin); }
    // if (debug) { console.log(dane.toString()); }
    switch (sin.statusInfNo) {
      case -1: {
        self.response({error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead});
        break;
      }
      case -2:
      case -4:
      case -5: {
        if (debug) { console.log('StatusInfNo: ' + sin.statusInfNo + ' - wyslanie ponowne'); }
        self.response({error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead}, true);
        break;
      }
      default: {
        // console.log('SIN: ', sin);
        error = sin.statusInfNo;
        self.response({error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead});
        break;
      }
    }
  };

  return Strada;
};
