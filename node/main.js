// main.js
(function () {
  'use strict';
  var argv = require('minimist')(process.argv.slice(2));
  var port = argv.port || 8888;
  var socket = require('socket.io-client')('http://127.0.0.1:' + port);

  var fs = require('fs');
  var common = require('./common.js');
  var EverSocket = require('eversocket').EverSocket;

  var ntpDate = -1;
  var instrID = 0;
  var queue = [];
  var lastSent = null;
  var PLCConnected = false;
  var debug = false;

  var CONNECT_TIMEOUT_MS = (argv.interval || 200) * 5;

  var client = new EverSocket({
    reconnectWait: CONNECT_TIMEOUT_MS,  // wait after close event before reconnecting
    timeout: CONNECT_TIMEOUT_MS,    // set the idle timeout
    reconnectOnTimeout: true    // reconnect if the connection is idle
  });

  var Strada = function(socket) {
    this.socket = socket;
    var self = this;
    this.tempKonf = {dane: new Buffer(0), DataLen: 0};
  };
  require('./parametry.js')(Strada, socket);
  require('./strada_dane.js')(Strada, socket);

  
  /**
  * Przegląd kolejki wiadomości w celu sprawdzenia timeoutów
  */
  Strada.prototype.clearQueue = function(force) {
    if (queue.length === 0) { return; }
    // if (force) console.log('strada.clearQueue ' + queue.length);
    var i;
    for (i = 0; i < queue.length; i += 1) {
      var el = queue[i];
      if ((new Date() - el.time) > el.timeout || force) {
        queue.splice(i, 1)[0].callback({error: 'timeout'});
        if (debug) { console.log('queue.splice + timeout'); }
        i -= 1;
      }
    }
  }

  /**
  * Wysłanie instrukcji do sterownika protokołem Strada
  * @param instrNo kod instrukcji
  * @param data dane do wyslania
  */
  Strada.prototype.sendFunction = function(instrNo, data) {
    // console.log(' strada.sendFunction()');
    instrID = (instrID + 1) % 0x10000;
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

    if (instrNo === 0x204) {
      data[0] = data[0] * 100;
    }

    if (instrNo === 0x20C) {
      data = data * 10;
    }

    switch (instrNo) {
    case 0x0: //External instrNo
      instrNo = data[0];
      outBuff.writeUInt16LE(instrNo, 10);
      tempOutBuff = data[1];
      data = null;
      break;
    case 0x201: //Zapisz datę i czas.
      // console.log('data: ');
      // console.log(data);
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt32LE(data, 4);
      // tempOutBuff.writeUInt16LE(data, 4);
      // tempOutBuff.writeUInt16LE(0, 6);
      break;
    case 0x202: //Zapisz aktualne blokady.
      if (!data || !data.length) { data = [0, 0, 0, 0]; }
      tempOutBuff = new Buffer(4);    //naglowek Iver >=4bajty
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(data.length, 2);
      break;
    case 0x203: //Zapisz aktualny język.
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
    case 0x601: //Podaj nazwy plików Skrawu Wzorcowego.
    case 0x603: //Podaj nazwę aktualnego pliku Skrawu Wzorcowego.
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data, 4);
      tempOutBuff.writeUInt16LE(0, 6);
      // tempOutBuff.writeUInt16LE(data, 4);
      break;
    case 0x204: //Zapisz aktualny numer sekcji.
    case 0x207: //Zapisz miejsce sterowanie posuwem.
    case 0x208: //Zapisz tryb pracy posuwu.
    case 0x209: //Zapisz tryb pracy ciągników.
    case 0x20A: //Zapisz całkowity czas pracy kombajnu.
    case 0x20B: //Zapisz całkowity czas jazdy kombajnu.
    case 0x402: //Sterowanie reflektorami.
    case 0x404: //Kalibracja czujnika położenia napędów hydraulicznych
    case 0x502: //Obsluga plików parametrów
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeUInt16LE(data[1], 6);
      data = null;
      break;
    case 0x701: //Kalibracja czujników położenia napędów hydraulicznych kombajnów chodnikowych
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeInt16LE(data[1], 6);
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
        console.log("Sterownik dostaje date");
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
        tempOutBuff.write('"' + data.WART + '"', 68);
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

    if (data && data.length) {
      outBuff = Buffer.concat([outBuff, new Buffer(data)]);
    }

    outBuff.writeUInt16LE(outBuff.length - 16, 14); //długość StradaData
    if (lastSent) {
      console.log('nadpisanie lastSent');
    }
    lastSent = {DstID: DstID, SrcID: SrcID, Dir: Dir, instrNo : instrNo, instrID : instrID, time : new Date()};
    if (client) { client.write(outBuff); } else { console.log('client error'); }
//    console.log('wysłano ID=' + instrID + ' instrNo: ' + instrNo + ' lastSent.instrID = ' + lastSent.instrID);
    return instrID;
  }

  
  /**
   * Description
   * @method encodeStrada202
   * @param {Object} data
   * @return outBuff
   */
  Strada.prototype.encodeStrada202 = function(data) {
    var BlockRW = require("./blockrw.js");
    var outBuff;
    var bw;
    if (!data.BlockUsr) {
      console.log('Brak BlockUsr');
      data.BlockUsr = [];
    }
    if (!data.BlockSrvc) {
      console.log('Brak BlockSrvc');
      data.BlockSrvc = [];
    }
    if (!data.BlockAdv) {
      console.log('Brak BlockAdv');
      data.BlockAdv = [];
    }
    bw = new BlockRW();
    outBuff = bw.write(data.BlockUsr, false);
    outBuff = Buffer.concat([outBuff, bw.write(data.BlockSrvc, false)]);
    outBuff = Buffer.concat([outBuff, bw.write(data.BlockAdv, false)]);

    if (outBuff.length % 4) {
      outBuff = Buffer.concat([outBuff, new Buffer([0, 0])]);
    }
    return outBuff;
  }

  /**
   * Description
   * @method decodeStrada308
   * @param {Buffer} dane
   * @return out
   */
  Strada.prototype.decodeStrada308 = function(dane) {
    var out = [];
    var gpar = common.getGpar();
    var i = 0;
    while (i < dane.length) {
      var temp = {};
      temp.nr = dane.readUInt16LE(i) & 0x7FFF;
      if (dane.readUInt16LE(i) > 0x8000) {
        temp.typ = 'Ostrzeżenie';
      } else {
        temp.typ = 'Alarm';
      }
      i += 2;
      temp.czas = dane.readUInt32LE(i) * 1000;
      i += 4;
      if (temp.czas === 0 && temp.nr === 0) {
        break;
      }
      var d = new Date(temp.czas);
      var n = d.getTimezoneOffset();
      d.setMonth(0);
      n -= d.getTimezoneOffset();
      if (gpar) {
        if (gpar.rKonfCzasStrefa !== undefined) {
          temp.czas += (gpar.rKonfCzasStrefa - 12) * 3600000;
        }
        if (gpar.rKonfCzasLetni) {
          temp.czas -= n * 60000;
        }
      }
      out.push(temp);
    }
    return out;
  }
  
  // dodanie rozkazu do kolejki
  Strada.prototype.stradaEnqueue = function(instrNo, data, callback, timeout) {
    var lastID = null;
    var outTimeout;
    if (timeout) {
      outTimeout = timeout;
    } else {
      outTimeout = CONNECT_TIMEOUT_MS * 5;
    }
    strada.clearQueue();
    // console.log('queue.length: ' + queue.length);
    if (!PLCConnected) {
      console.log('instrNo: ' + instrNo);
      console.log('PLC nie polaczony');
      callback({error: 'PLC nie polaczony'});
      return 1;
    }
    if (queue.length === 0) {
      // console.log(' strada.sendFunction from enqueue');
      lastID = strada.sendFunction(instrNo, data);
    }
    if (!callback) { callback = console.log; }
    // console.log('push');
    queue.push({instrNo: instrNo, data: data, callback: callback,
      timeout: outTimeout, time: new Date(), instrID: lastID});
    if (queue.length > 2) {
      console.log('queue.length = ' + queue.length + ' instrNo = ' + instrNo);
    }
    if (queue.length > 20) {
      throw new Error({'opis': 'Przepełnienie kolejki'});
    }
  }

  Strada.prototype.sendNext = function(dane, asyn) {
    // console.log('strada.sendNext');
    var el = queue[0];
    var tempDate = new Date();
    if (el) {
      if (asyn) {
//        console.log(el);
//        console.log(tempDate - el.time);
        if (el.instrNo.length === 2) { el.instrNo = el.instrNo[0]; }
        strada.stradaEnqueue([el.instrNo, 0x101], el.data, el.callback, el.timeout - (tempDate - el.time));
      } else {
        el.callback(dane);
      }
    }
    queue.shift();
    strada.clearQueue();
    if (queue.length > 0) {
      el = queue[0];
      queue[0].instrID = strada.sendFunction(el.instrNo, el.data);
    }
  }

  /**
  * Odebranie danych ze sterownika protokołem Strada
  * @param dane odebrane dane
  */
  Strada.prototype.getData = function(dane) {
    // console.log('strada.getData');
    // console.log(dane.length);
    var DstIDR = dane.readUInt32LE(0);
    var SrcIDR = dane.readUInt32LE(4);
    var DirR = dane.readUInt16LE(8);
    var instrNoR = dane.readUInt16LE(10);
    var instrIDR = dane.readUInt16LE(12);
    var DataLenR = dane.readUInt16LE(14);
    var error = true;

    // console.log(' strada.getData lastSent.instrID = ' + lastSent.instrID);
    if (lastSent) {
      if (DstIDR !== lastSent.SrcID) {
        console.log('Błąd DstID');
      } else if (SrcIDR !== lastSent.DstID) {
        console.log('Błąd SrcID');
      } else if (DirR !== 0x10) {
        console.log('Błąd Dir');
        if (DirR === 0x110) {
          console.log('BOT nr=' + dane.readInt16LE(16) + ': ' + dane.slice(20) + ' (' + dane.slice(20).length + ')');
        } else {
          console.log('Dir = ' + DirR);
        }
      } else if (instrNoR !== lastSent.instrNo) {
        console.log('Błąd instrNo');
      } else if (instrIDR !== lastSent.instrID
          && instrNoR > 0x200
          && instrNoR !== 0x301) {  //ignorowanie błędu STRADA w rozkazach 0x001- 0x1FF oraz 0x301
        console.log('Błąd instrID jest: ' + instrIDR + ' powinno być: ' + lastSent.instrID);
      } else if (dane.length - 16 !== DataLenR) {
        console.log('Błąd DataLenR');
      } else {
        error = null;
      }
    }
    // console.log('odebrano ID=' + instrIDR);
    dane = dane.slice(16);  //przesłanie dalej tylko StradaData

    if (instrNoR < 0x200 || instrNoR === 0x301) {
      strada.sendNext({error: error, Dir: DirR, dane: dane, RawHead: new Buffer([])});
      lastSent = null;
      return;
    }
    // console.log(lastSent);
    if (!error) {
      //SIN
      var StatusInfNo = dane.readInt16LE(0);
      var InstrVer = dane.readUInt16LE(2);
      var InstrID2 = dane.readUInt16LE(4);
      var DataType = dane.readUInt16LE(6);
      var DataLen  = dane.readUInt16LE(8);
      var DataSegmentNo = dane.readUInt16LE(10);
      var rawHead = dane.slice(0, 12);
      dane = dane.slice(12);  //przesłanie dalej tylko SerwerData
      lastSent = null;
      // if (instrNoR === 0x302) {
        // dane302 = {error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead};
      // }
      if (DataType === 0) {
        dane = dane.toString();
      }
      switch (StatusInfNo) {
      case -1:
        strada.sendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead});
        break;
      case -2:
      case -4:
      case -5:
        console.log('StatusInfNo: ' + StatusInfNo + ' - wyslanie ponowne');
        setTimeout(function () {
          strada.sendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead}, true);
          // strada.sendNext({error: error, Dir: 0x101, dane: dane, DataLen: DataLen, RawHead: rawHead}, true);
        }, 100);
        break;
      default:
        // console.log('StatusInfNo: ' + StatusInfNo);
        // console.log('StatusInfNo: ' + StatusInfNo);
        // console.log('InstrVer: ' + InstrVer);
        // console.log('InstrID2: ' + InstrID2);
        // console.log('DataType: ' + DataType);
        // console.log('DataLenR: ' + DataLenR);
        // console.log('DataLen: ' + DataLen);
        // console.log('DataSegmentNo: ' + DataSegmentNo);
        error = StatusInfNo;
        strada.sendNext({error: error, Dir: DirR, dane: dane, DataLen: DataLen, RawHead: rawHead});
        break;
      }
    } else {
      //BOT
      var error2 = dane.readInt16LE(0);  //numer błędu
      var ErrDesc = dane.slice(4);      //opis błędu
      strada.sendNext({error: error2, Dir: DirR, dane: ErrDesc.toString(), DataLen: null, RawHead: null});
    }
  }
  
  // rekurencyjne odczytanie wielu obszarow
  Strada.prototype.readAll = function(instrNo, uiCzytajObszarNr, dane2, callback) {
    var self = this;
    // console.log('readAll');
    // console.log(instrNo);
    // console.log(uiCzytajObszarNr);
    // if (uiCzytajObszarNr[0] === 0) {
    if (uiCzytajObszarNr === 0) {
      self.tempKonf = {dane: new Buffer(0), DataLen: 0};
    }
    // console.log('uiCzytajObszarNr '+uiCzytajObszarNr);
    var enqPar = uiCzytajObszarNr;
    if (dane2) { enqPar = [uiCzytajObszarNr, dane2]; }
    // console.log('readAll');
    // console.log(instrNo);
    // console.log(dane2);
    // console.log(enqPar);
    strada.stradaEnqueue(instrNo, enqPar, function (dane) {
      if (!dane.dane || (typeof dane.dane === 'string')) {
        if (callback) { callback(dane); }
      } else {
        self.tempKonf.dane = new Buffer.concat([self.tempKonf.dane, dane.dane]);
        self.tempKonf.DataLen = dane.DataLen;
        if (uiCzytajObszarNr > 3) {
          console.log('nie ma końca - (uiCzytajObszarNr > 3)');
          return;
        }
        if (self.tempKonf.dane.length < self.tempKonf.DataLen) {
          self.readAll(instrNo, uiCzytajObszarNr + 1, dane2, callback);
        } else {
          if (callback) { callback(self.tempKonf.dane); }
        }
      }
    });
  }
  
  var strada = new Strada(socket);

  require('./strada_rozk.js')(strada, socket);

  socket.on('get_gpar', function (msg) {
    console.log(' on get_gpar');

    // jezeli freshPar -> wyslij
    // if (!force && freshPar > 0) {
      // socket.emit('gpar', gpar);
      // return;
    // }
    //do zmiany (przemyslenia)
    // freshPar = 1;
    
    //dodac callback z zapisem(store + emit)
    // console.log('odswierzParametry ', force, ' ', freshPar);
    // parametry.
    strada.odswierzParametry(msg);
  });

  //mechanizm do usuniecia (zastepuje go usluga systemowa)
  if (argv.clock) {
    socket.on('strada_req_time', function () {
      console.log('Sterownik rzada daty');
      if (ntpDate === -1) {
        console.log('data dla PLC: ', new Date());
        ntpDate = 1;
      }
    });
  }

  strada.stopInterval();
  client
    .on('data', strada.getData)
    .on('connect', function () {
      console.log('Strada Polaczono ....');
      PLCConnected = true;
      strada.stopInterval();
      strada.clearQueue(true);
      strada.startInterval(argv.interval);
    //dodac callback z zapisem(store + emit)
      // parametry.
      strada.odswierzParametry(false);
    })
    .on('error', function (err) {
      console.log('Strada ErRoR: ' + err.code);
      socket.emit('dane', {error: 'Strada client ErRoR: ' + err.code });
      PLCConnected = false;
    })
    .on('close', function () {
      // console.log('client close');
      client.destroy();
      if (PLCConnected) {
        PLCConnected = false;
        socket.emit('dane', {error: 'Strada Connection closed'});
        strada.stopInterval();
        strada.clearQueue(true);
      }
    });

  client.connect(20021, '192.168.3.30');

}());
