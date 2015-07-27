/**
*  @file strada.js
*  @brief Komunikacja z PLC
*/
'use strict';
console.log('start strada.js');
require('cache-require-paths');
var net = require('net');
var argv = require('minimist')(process.argv.slice(2));
var common = require('./common.js');
var decode = require('./decode.js');
// argv.debug = true;

/**
 *  @brief Konstruktor klasy
 *  Creates a new Person.
 *  @class
 *  @constructor
 *  @param [in] socket Socket.io
 *  @param [in] client TCP Socket
 */
function Strada() {
  var self = this;
  argv = argv || {};
  argv.port = argv.port || 8888;
  self.socket = require('socket.io-client')('http://127.0.0.1:' + argv.port);
  self.interval = 200;
  self.parFilename = 'default.json';
  self.PLCConnected = false;
  self.lastSent = null;
  self.queue = [];
  self.instrID = 0;
  self.ntpDate = -1;
  self.emitEnable = true;
  self.dane = [];

  require('./stradaPar.js')(Strada);
  require('./stradaConn.js')(Strada);

  //TODO: wystartowanie interwału w osobnej metodzie, a nie w konstruktorze
  self.myInterval = new common.MyInterval(self.interval, function () {
    // if (!strada.master || !strada.master.connected) {
    self.stradaEnqueue(0x302, 0, function (dane) {
      if (!dane.error) {
        dane = new decode.DecodeStrada302(dane.dane);
        if (!dane) {console.log('DecodeStrada302 null'); return; }
        if (dane.wDataControl === 1) {
          if (argv.debug) { console.log('Sterownik rzada daty'); }
          if (self.ntpDate === -1) {
            self.ntpDate = -2;
            common.runScript(['getTime.sh'], function (data) {
              if (data.error === 0) {
                self.ntpDate = data.stdout.replace(/[ \n\r]*/mg, '') + '000';
              } else {
                self.ntpDate = -1;
              }
            });
          }
        }
      }
      self.dane = dane;
      if (self.emitEnable) { self.socket.emit('broadcast', ['dane', dane]); }
    });
    // }
  });

  self.socket.on('get_gpar', function (msg) {
    // console.log(' on get_gpar', self.PLCConnected);
    if (self.master && self.master.connected) {
      self.master.on('gpar', function(msg){
          self.socket.emit('gpar', msg);
      });
    } else {
      if (self.PLCConnected) { self.odswierzParametry(msg); }
    }
  });

  require('./stradaRozk.js')(self);
  if (argv.master) {
    if (argv.master.search('http://') !== 0) { argv.master = 'http://' + argv.master; }
    console.log('master= ',argv.master);
    self.setMaster(require('socket.io-client')(argv.master, {reconnectionDelay: 500, reconnectionDelayMax: 1000, timeout: 500}));
  }
  if (argv.interval !== undefined) { self.setInterval(argv.interval); }
}

/**
* @memberof! Strada#
*/
Strada.prototype.setInterval = function (interval) {
  this.interval = interval;
  this.emitEnable = (this.interval !== 0);
  if (!this.emitEnable) {
    console.log('Emitowanie danych wyłączone');
    this.interval = 200;
  } else {
    console.log('Zmiana interwału na', this.interval, 'ms.');
  }
  if (this.interval < 50) {
    console.log('Błędny interwał -> ustawiono 200ms');
    this.interval = 200;
  }
  if (this.PLCConnected) { this.myInterval.setInterval(this.interval); }
};

/**
* @memberof! Strada#
*/
Strada.prototype.setMaster = function (master) {
  var self = this;
  self.master = master;
  if (self.master) {
    self.master
      .on('gpar', function(msg){
        self.socket.emit('gpar', msg);
        if (!self.master.connected2) {
          console.log('master reconnected ??', self.master.connected2);
          self.master.connected2 = true;
        }
      })
      .on('dane', function(dane){
        self.lastMasterEmit = Date.now();
        // console.log('d',self.lastMasterEmit, self.master.connected2); 
        if (!self.master.connected2) {
          console.log('master reconnected ??', self.master.connected2);
          self.master.connected2 = true;
        }
        // if (self.emitEnable) { self.socket.emit('broadcast', ['dane', dane]); }
      })
      .on('connect', function(){
        self.master.connected2 = true;
        console.log('master connected');
        if (self.masterInterval) { clearInterval(self.masterInterval); }
        self.masterInterval = setInterval(function(){
          if (self.master.connected2 && Date.now() - self.lastMasterEmit > 1000) {
            console.log('master not connected ??', self.master.connected2);
            self.master.connected2 = false;
          }
        }, 1000);
      })
      // .on('reconnect', function(val){
        // console.log('master reconnected', val);
      // })
      .on('reconnect_attempt', function(){
        // console.log('master try');
      })
      .on('disconnect', function(){
        console.log('master disconnected =', !self.master.connected);
      })
      ;
  }
};

/**
* @memberof! Strada#
*/
Strada.prototype.connect = function (err) {
  var self = this;
  if (!self.numerator) { self.numerator = 1; }
  if (self.client && !self.client.destroyed) {
    console.log('Client destroy', self.client.numer);
    self.client.destroy();
  }
  self.client = new net.Socket();
  self.client.numer = self.numerator++;
  self.client
    .on('data', function (dane) {
      self.getData(dane);
    })
    .on('connect', function () {
      console.log('Strada Polaczono ....', self.client.numer);
      self.socket.emit('nazwa', 'strada');
      self.PLCConnected = true;
      self.odswierzParametry(true);
      self.myInterval.setInterval(self.interval);
    })
    .on('error', function (err) {
      if (argv.debug) { console.log('error', err); }
    })
    .on('close', function (err) {
      // console.log('Client close', err, self.client.numer,self.client.destroyed);
      if (argv.debug) { console.log('close', err); }
      if (err === true && self.client && !self.client.destroyed) {
        self.client.destroy();
      } else {
        // console.log('client close', self.client.numer);
        setTimeout(function () {
          console.log('timeout self.connect');
          self.connect();
        }, 1000);
      }
    });

  self.client.setTimeout(1000, function () {
    // console.log('client timeout', self.client.numer);
    var dane = {error: 'Strada client error: ' + 'timeout' };
    if (argv.debug) { console.log(dane.error); }
    if (self.emitEnable) { self.socket.emit('broadcast', ['dane', dane]); }
    if (self.PLCConnected) {
      console.log('PLC nie połączony');
      self.myInterval.setInterval(1000);
      self.PLCConnected = false;
    }
    self.lastSent = null;
    // czyszczenie kolejki wiadomosci
    self.clearQueue(true);
    self.client.destroy();
  });
  
  self.client.connect(20021, '192.168.3.30');
  return self.client;
}

/**
* Wysłanie instrukcji do sterownika protokołem Strada
* @memberof! Strada#
* @param instrNo kod instrukcji
* @param data dane do wyslania
*/
Strada.prototype.send = function (instrNo, instrID, data) {
  var self = this;
  if (argv.debug) { console.log('sendData', instrNo.toString(16), instrID); }
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
    case 0x0: { // External instrNo
      instrNo = data[0];
      outBuff.writeUInt16LE(instrNo, 10);
      tempOutBuff = data[1];
      data = null;
      break;
    }
    case 0x201: { // Zapisz datę i czas.
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt32LE(data, 4);
      break;
    }
    case 0x202: { // Zapisz aktualne blokady.
      if (!data || !data.length) { data = [0, 0, 0, 0]; }
      tempOutBuff = new Buffer(4);    // naglowek Iver >=4bajty
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(data.length, 2);
      break;
    }
    case 0x203: // Zapisz aktualny język.
    case 0x204: // Zapisz aktualny numer sekcji.
    case 0x207: // Zapisz miejsce sterowanie posuwem.
    case 0x208: // Zapisz tryb pracy posuwu.
    case 0x209: // Zapisz tryb pracy ciągników.
    case 0x20A: // Zapisz całkowity czas pracy kombajnu.
    case 0x20B: // Zapisz całkowity czas jazdy kombajnu.
    case 0x20C: // Zapisz całkowity dystans kombajnu.
    case 0x216: // Zapisz kanał radiowy SSRK. (1-69)
    case 0x21B: // Zapisz typ skrawu wzorcowego.
    case 0x21C: // Zapisz fazę skrawu wzorcowego.
    case 0x21D: // Zapisz auto fazę skrawu wzorcowego.
    case 0x221: // Zapisz miejsce sterowania kombajnu przez zewnętrzny system sterowania
    case 0x222: // Zapisz tryb pracy pomp hydrauliki.
    case 0x307: // Odczytanie obszaru danych konfiguracyjnych
    case 0x308: // Podaj historię zdarzeń.
    case 0x401: // Testuj hamulec.
    case 0x402: // Sterowanie reflektorami.
    case 0x404: // Kalibracja czujnika położenia napędów hydraulicznych
    case 0x502: // Obsluga plików parametrów
    case 0x601: // Podaj nazwy plików Skrawu Wzorcowego.
    case 0x603: { // Podaj nazwę aktualnego pliku Skrawu Wzorcowego.
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeUInt16LE(data[1], 6);
      data = null;
      break;
    }
    case 0x701: { // Kalibracja czujników położenia napędów hydraulicznych kombajnów chodnikowych
      tempOutBuff = new Buffer(8);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(4, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeInt16LE(data[1], 6); // !! Int zamiast UInt
      data = null;
      break;
    }
    case 0x702: { // Ustawianie liczników czasu pracy dla kombajnów chodnikowych.
      tempOutBuff = new Buffer(12);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(8, 2);
      tempOutBuff.writeUInt16LE(data[0], 4);
      tempOutBuff.writeUInt16LE(0, 6);
      tempOutBuff.writeInt32LE(data[1], 8);
      data = null;
      break;
    }
    case 0x403: // Zeruj liczniki dzienne.
    case 0x602: { // Skasuj aktywny plik Skrawu Wzorcowego i usuń dane Skrawu z pamięci.
      tempOutBuff = new Buffer(4);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(0, 2);
      data = null;
      break;
    }
    case 0x600: // Zapisz nazwę pliku Skrawu Wzorcowego wybranego przez użytkownika.
    case 0x604: // Skasuj plik Skrawu Wzorcowego (inny niż aktywny).
    case 0x606: { // Stwórz nowy plik Skrawu Wzorcowego
      tempOutBuff = new Buffer(26);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(24, 2);
      tempOutBuff.write(data, 4);
      data = null;
      break;
    }
    case 0x605: { // Zmień nazwę pliku Skrawu Wzorcowego
      tempOutBuff = new Buffer(50);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(24, 2);
      tempOutBuff.write(data[0], 4);
      tempOutBuff.write(data[1], 28);
      data = null;
      break;
    }
    case 0x302: { // Odczytanie obszaru danych wizualizacyjnych kombajnu
      tempOutBuff = new Buffer(16);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(12, 2);
      // console.log('uiCzytajObszarNr: '+data);
      tempOutBuff.writeUInt16LE(data, 4); // uiCzytajObszarNr
      if (self.ntpDate > 0) {
        if (argv.debug) { console.log('Sterownik dostaje date', self.ntpDate); }
        tempOutBuff.writeUInt16LE(1, 6);
        tempOutBuff.writeUInt32LE(Math.round(self.ntpDate / 1000), 8);
        self.ntpDate = -3;
        setTimeout(function() {
          self.ntpDate = -1;
        }, 1000);
      }
      break;
    }
    case 0x310: { // Podaj status wejść/wyjść wybranego bloku.
      console.log(data);
      tempOutBuff = new Buffer(32);
      tempOutBuff.fill(0);
      tempOutBuff.writeUInt16LE(1, 0);  // instrVer
      tempOutBuff.writeUInt16LE(28, 2); // ClientDataLen
      tempOutBuff.writeUInt16LE(data[0], 4);  // uiCzytajObszarNr
      tempOutBuff.writeUInt16LE(0, 6);  // Rezerwa
      tempOutBuff.write(data[1], 8);
      data = null;
      break;
    }
    case 0x500: { // Zapisz parametr
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
          data.WART = parseFloat(temp).toFixed(1); // .toString();
        } else {
          data.WART = temp;
        }
        tempOutBuff.write(data.WART, 68);
      } else if (data.TYP === 'TIME') {
        // tempOutBuff.write('"T#' + common.msToCodesysTime(data.WART) + 'ms"', 68);
        // console.log('"T#' + (data.WART*1000) + 'ms"');
        // tempOutBuff.write('"T#' + (data.WART * 1000) + 'ms"', 68);
        tempOutBuff.write('"' + common.msToCodesysTime(data.WART * 1000) + '"', 68);
      } else {
        console.log('0x500 - Błąd TYPU');
        tempOutBuff.write(data.WART, 68);
      }
      break;
    }
    default: { // Funkcja domyślnie jako parametr przyjmuje tablicę
      // "instrNo" dla rozkazow SSN, SSO i Tiefenbach
      if (instrNo < 0x200 || instrNo === 0x301) { break; }
      if (!data || !data.length) { data = [0, 0, 0, 0]; }
      tempOutBuff = new Buffer(4);    // Nagłówek Iver >=4bajty
      tempOutBuff.writeUInt16LE(1, 0);
      tempOutBuff.writeUInt16LE(data.length, 2);
      break;
    }
  }

  if (tempOutBuff && tempOutBuff.length) {
    outBuff = Buffer.concat([outBuff, tempOutBuff]);
  }
  if (data && data.length) { outBuff = Buffer.concat([outBuff, new Buffer(data)]); }
  outBuff.writeUInt16LE(outBuff.length - 16, 14); // Rozmiar StradaData
  if (self.lastSent) { console.log('nadpisanie lastSent'); }
  self.lastSent = {
    DstID: DstID,
    SrcID: SrcID,
    Dir: Dir,
    instrNo: instrNo,
    instrID: instrID,
    time: new Date()
  };
  if (self.client) { self.client.write(outBuff); } else { console.log('client error'); }
  // console.log('wysłano ID=', instrID, 'instrNo:', instrNo, 'self.lastSent.instrID =', self.lastSent.instrID);
};

module.exports = Strada;

var s = new Strada();
s.connect();
