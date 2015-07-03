// stradaConn.js
'use strict';
var common = require('./common.js');
module.exports = function(Strada, socket) {
  var ntpDate = -1;
  var debug = false;
  // var debug = true;
  
  /**
  * Przegląd kolejki wiadomości w celu sprawdzenia timeoutów
  * Wyslanie nastepnej wiadomosci z kolejki
  */
  Strada.prototype.clearQueue = function(force) {
    var self = this;
    if (self.queue.length === 0) { return; }
    // console.log('queue.length: ' + self.queue.length);
    // if (force) console.log('clearQueue ' + self.queue.length);
    // czyszczenie timeoutow
    var i;
    for (i = 0; i < self.queue.length; i += 1) {
      var el = self.queue[i];
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
  }

  // rekurencyjne odczytanie wielu obszarow
  Strada.prototype.readAll = function(instrNo, dane2, callback, tempKonf) {
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
  }
  
  /**
   *  @brief Dodanie rozkazu do kolejki
   *  
   *  @param [in] instrNo Numer instrukcji
   *  @param [in] data Dane instrukcji
   *  @param [in] callback Funkcja wywolywana po odebraniu odpowiedzi
   *  @param [in] timeout Czas oczekiwania w kolejce
   */
  Strada.prototype.stradaEnqueue = function(instrNo, data, callback, timeout) {
    var self = this;
    if (!callback) { callback = console.log; }
    if (!timeout) { timeout = 1000; }
    // console.log(' stradaEnqueue', instrNo, timeout);
    self.instrID = (self.instrID + 1) % 0x10000;
    self.clearQueue();
    if (!self.PLCConnected) {
      console.log('instrNo: ' + instrNo);
      console.log('PLC nie polaczony');
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
  }

  /**
   *  @brief wywolanie callbacka przy otrzymaniu danych
   *  @param [in] dane 
   *  @param [in] retry - ponowne wrzucenie do kolejki tego samego zapytania (przy zapytaniu asynchronicznym)
   */
  Strada.prototype.response = function(dane, retry) {
    var self = this;
    var el = self.queue.shift();;
    if (el) {
      // console.log('response()', el.instrNo.toString(16), el.instrID, retry ? true : false);
      // console.log(dane);
      if (retry) {
        if (el.instrNo.length === 2) { el.instrNo = el.instrNo[0]; }
        self.stradaEnqueue([el.instrNo, 0x101], el.data, el.callback, el.timeout - (Date.now() - el.time));
      } else {
        el.callback(dane);
      }
    }
    self.clearQueue();
  }

  /**
  * Wysłanie instrukcji do sterownika protokołem Strada
  * @param instrNo kod instrukcji
  * @param data dane do wyslania
  */
  Strada.prototype.send = function(instrNo, instrID, data) {
    var self = this;
    if (debug) { console.log('sendData', instrNo.toString(16), instrID); }
    var DstID = 1;
    var SrcID = 4;
    var Dir = 0x01;
    var outBuff = new Buffer(16);
    var temp;
    var tempOutBuff;

    if (instrNo.length === 2) {
      Dir = 0x101;
      instrNo = instrNo[0];
    }

    outBuff.writeUInt32LE(DstID, 0);
    outBuff.writeUInt32LE(SrcID, 4);
    outBuff.writeUInt16LE(Dir, 8);
    outBuff.writeUInt16LE(instrNo, 10);
    outBuff.writeUInt16LE(instrID, 12);
    outBuff.writeUInt16LE(0, 14);
    if (instrNo === 0x204) { data[0] = data[0] * 100; }
    if (instrNo === 0x20C) { data = data * 10; }

    switch (instrNo) {
    case 0x0: //External instrNo
      instrNo = data[0];
      outBuff.writeUInt16LE(instrNo, 10);
      tempOutBuff = data[1];
      data = null;
      break;
    case 0x201: //Zapisz datę i czas.
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt32LE(data, 4);
      break;
    case 0x202: //Zapisz aktualne blokady.
      if (!data || !data.length) { data = [0, 0, 0, 0]; }
      tempOutBuff = new Buffer(4);    //naglowek Iver >=4bajty
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(data.length, 2);
      break;
    case 0x203: //Zapisz aktualny język.
    case 0x204: //Zapisz aktualny numer sekcji.
    case 0x207: //Zapisz miejsce sterowanie posuwem.
    case 0x208: //Zapisz tryb pracy posuwu.
    case 0x209: //Zapisz tryb pracy ciągników.
    case 0x20A: //Zapisz całkowity czas pracy kombajnu.
    case 0x20B: //Zapisz całkowity czas jazdy kombajnu.
    case 0x20C: //Zapisz całkowity dystans kombajnu.
    case 0x216: //Zapisz kanał radiowy SSRK. (1-69)
    case 0x21B: //Zapisz typ skrawu wzorcowego.
    case 0x21C: //Zapisz fazę skrawu wzorcowego.
    case 0x21D: //Zapisz auto fazę skrawu wzorcowego.
    case 0x221: //Zapisz miejsce sterowania kombajnu przez zewnętrzny system sterowania
    case 0x222: //Zapisz tryb pracy pomp hydrauliki.
    case 0x307: //Odczytanie obszaru danych konfiguracyjnych
    case 0x308: //Podaj historię zdarzeń.
    case 0x401: //Testuj hamulec.
    case 0x402: //Sterowanie reflektorami.
    case 0x404: //Kalibracja czujnika położenia napędów hydraulicznych
    case 0x502: //Obsluga plików parametrów
    case 0x601: //Podaj nazwy plików Skrawu Wzorcowego.
    case 0x603: //Podaj nazwę aktualnego pliku Skrawu Wzorcowego.
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeUInt16LE(data[1], 6);
      // console.log(data);
      // console.log(tempOutBuff);
      data = null;
      break;
    case 0x701: //Kalibracja czujników położenia napędów hydraulicznych kombajnów chodnikowych
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeInt16LE(data[1], 6); // !! Int zamiast UInt
      data = null;
      break;
    case 0x702: //Ustawianie liczników czasu pracy dla kombajnów chodnikowych.
      tempOutBuff = new Buffer(12);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(8, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeUInt16LE(0, 6);
      tempOutBuff.writeInt32LE(data[1], 8);
      data = null;
      break;
    case 0x403: //Zeruj liczniki dzienne.
    case 0x602: //Skasuj aktywny plik Skrawu Wzorcowego i usuń dane Skrawu z pamięci.
      tempOutBuff = new Buffer(4);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(0, 2);
      data = null;
      break;
    case 0x600: //Zapisz nazwę pliku Skrawu Wzorcowego wybranego przez użytkownika.
    case 0x604: //Skasuj plik Skrawu Wzorcowego (inny niż aktywny).
    case 0x606: //Stwórz nowy plik Skrawu Wzorcowego
      tempOutBuff = new Buffer(26);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(24, 2);
      tempOutBuff.write(data, 4);
      data = null;
      break;
    case 0x605: //Zmień nazwę pliku Skrawu Wzorcowego
      tempOutBuff = new Buffer(50);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(24, 2);
      tempOutBuff.write(data[0], 4);
      tempOutBuff.write(data[1], 28);
      data = null;
      break;
    case 0x302: //Odczytanie obszaru danych wizualizacyjnych kombajnu
      tempOutBuff = new Buffer(16);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(12, 2);
  //    console.log('uiCzytajObszarNr: '+data);
      tempOutBuff.writeUInt16LE(data, 4); //uiCzytajObszarNr
      if (ntpDate === 1) {
        console.log('Sterownik dostaje date');
        tempOutBuff.writeUInt16LE(1, 6);
        tempOutBuff.writeUInt32LE(Math.round((new Date()).getTime() / 1000), 8);
        ntpDate = -2;
        setTimeout(function () {
          ntpDate = -1;
        }, 1000);
      }
      break;
    case 0x310: //Podaj status wejść/wyjść wybranego bloku.
      console.log(data);
      tempOutBuff = new Buffer(32);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);  //instrVer
      tempOutBuff.writeUInt16LE(28, 2); //ClientDataLen
      tempOutBuff.writeUInt16LE(data[0], 4);  //uiCzytajObszarNr
      tempOutBuff.writeUInt16LE(0, 6);  //Rezerwa
      tempOutBuff.write(data[1], 8);
      data = null;
      break;
    case 0x500: //Zapisz parametr
      tempOutBuff = new Buffer(100);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(96, 2);
      if (data.NAZ.length > 31) {
        console.log('0x500 - za długa NAZWA (' + data.NAZ.length + ')');
        data.NAZ = data.NAZ.substr(0, 31);
      }
      tempOutBuff.write(data.NAZ, 4);
      tempOutBuff.write(data.TYP, 36);
  //console.log(data.TYP);
      if (data.TYP === 'STRING') {
        if (data.WART.length > 29) {
          console.log('0x500 - za długi STRING (' + data.WART.length + ')');
          data.WART = data.WART.substr(0, 29);
        }
        tempOutBuff.write('\"' + data.WART + '\"', 68);
      // } else if (data.TYP === 'LISTA') {
        // tempOutBuff.write(data.WART.toFixed(1), 68);
      } else if (data.TYP === 'REAL' || (data.TYP === 'LISTA')) {
        temp = data.WART.toString();
        if (temp.indexOf('.') === -1) {
          data.WART = temp + '.0';
        } else if (temp.length - temp.indexOf('.') < 3) {
          data.WART = parseFloat(temp).toFixed(1);//.toString();
        } else {
          data.WART = temp;
        }
        tempOutBuff.write(data.WART, 68);
      } else if (data.TYP === 'TIME') {
  //        tempOutBuff.write('"T#' + common.msToCodesysTime(data.WART) + 'ms"', 68);
  // console.log('"T#' + (data.WART*1000) + 'ms"');
        // tempOutBuff.write('"T#' + (data.WART * 1000) + 'ms"', 68);
        tempOutBuff.write('"' + common.msToCodesysTime(data.WART * 1000) + '"', 68);
      } else {
        console.log('0x500 - Błąd TYPU');
        tempOutBuff.write(data.WART, 68);
      }
      break;
    default:  //domyślnie jako parametr przyjmuje tablicę
      if (instrNo < 0x200 || instrNo === 0x301) { break; }  //dla rozkazow SSN, SSO i Tiefenbach
      if (!data || !data.length) { data = [0, 0, 0, 0]; }
      tempOutBuff = new Buffer(4);    //naglowek Iver >=4bajty
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(data.length, 2);
      break;
    }

    if (tempOutBuff && tempOutBuff.length) {
      outBuff = Buffer.concat([outBuff, tempOutBuff]);
    }
    if (data && data.length) { outBuff = Buffer.concat([outBuff, new Buffer(data)]); }
    outBuff.writeUInt16LE(outBuff.length - 16, 14); //długość StradaData
    if (self.lastSent) { console.log('nadpisanie lastSent'); }
    self.lastSent = {DstID: DstID, SrcID: SrcID, Dir: Dir, instrNo : instrNo, instrID : instrID, time : new Date()};
    if (self.client) { self.client.write(outBuff); } else { console.log('client error'); }
    // console.log('wysłano ID=' + instrID + ' instrNo: ' + instrNo + ' self.lastSent.instrID = ' + self.lastSent.instrID);
  }

  /**
  * Odebranie danych ze sterownika protokołem Strada
  * @param dane odebrane dane
  */
  Strada.prototype.getData = function(dane) {
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
          console.log('BOT nr=' + dane.readInt16LE(16) + ': ' + dane.slice(20) + ' (' + dane.slice(20).length + ')');
        } else {
          console.log('Dir = ' + DirR);
        }
      } else if (instrNoR !== self.lastSent.instrNo) {
        console.log('Błąd instrNo');
      } else if (instrIDR !== self.lastSent.instrID
          && instrNoR > 0x200
          && instrNoR !== 0x301) {  //ignorowanie błędu STRADA w rozkazach 0x001- 0x1FF oraz 0x301
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
      rawHead : dane.slice(0, 12),
    }
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
    case -1:
      self.response({error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead});
      break;
    case -2:
    case -4:
    case -5:
      console.log('StatusInfNo: ' + sin.statusInfNo + ' - wyslanie ponowne');
      setTimeout(function () {
        self.response({error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead}, true);
        // self.response({error: error, Dir: 0x101, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead}, true);
      }, 100);
      break;
    default:
      // console.log('SIN: ', sin);
      error = sin.statusInfNo;
      self.response({error: error, Dir: DirR, dane: dane, DataLen: sin.dataLen, RawHead: sin.rawHead});
      break;
    }
  }

  //mechanizm do usuniecia (zastepuje go usluga systemowa)
  // zastapic skryptem *.sh
  // if (argv.clock) {
  if (false) {
    socket.on('strada_req_time', function () {
      console.log('Sterownik rzada daty');
      if (ntpDate === -1) {
        console.log('data dla PLC: ', new Date());
        ntpDate = 1;
      }
    });
  }
  
  return Strada;
}
