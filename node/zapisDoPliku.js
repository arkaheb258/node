/**
 *  @file zapisDoPliku.js
 *  @brief Logowanie danych z pracy maszyny
 */
(function () {
  console.log('start zapisDoPliku.js');
  'use strict';
  require('cache-require-paths');
  var argv = require('minimist')(process.argv.slice(2));
  argv.port = argv.port || 8888;
  var fs = require('fs');
  var socket = require('socket.io-client')('http://127.0.0.1:' + argv.port);
  var common = require('./common.js');
  var cp = require('child_process');
  var logger_dir = argv.dir || null;
  var prev_data = null;

  /**
   * Tworzenie folderu 
   * @method createDir 
   * @param {string} dirName
   * @param {Callback} callback
   */
  //(docelowo zamienic na skrypt)
  function createDir(dirName, callback) {
    fs.readdir(dirName, function (err) {
      if (err) {
        if (err.code === 'ENOENT') {
          fs.mkdir(dirName, function () {
            if (callback) { callback(); }
          });
        } else { console.log(err); }
      } else {
        if (callback) { callback(); }
      }
    });
  }

  /**
   *  Tworzenie pustego pliku do zapisu danych (z nagłówkiem)
   *  @method createFile
   *  @param {string} fileName Nazwa pliku
   *  @param {Number} czas Epoch w sekundach
   */
  function createFile(fileName, czas) {
    console.log('Tworzenie pustego pliku danych: ' + fileName);
    createDir(logger_dir, function () {
      var parametry = common.getGpar();
      if (parametry) {
        var outBuff = new Buffer(255);
        var adr = 0;
        outBuff.fill(0x20);
        outBuff.write('Typ kombajnu:\t\t' + parametry.sKonfTypKombajnu, adr);
        adr += 15 + 31;
        outBuff.write('\r\nNr komisji:\t\t' + parametry.sKonfNrKomisji, adr);
        adr += 15 + 31;
        outBuff.write('\r\nNazwa kopalni:\t\t' + parametry.sKonfNazwaKopalni, adr);
        adr += 18 + 31;
        outBuff.write('\r\nNr sciany:\t\t' + parametry.sKonfNrSciany, adr);
        adr += 14 + 31;
        outBuff.write('\r\nWersja programu:\t' + parametry.sKonfWersjaProgramu, adr);
        adr += 19 + 31;
        outBuff.write('\r\nCzas star.:', adr);
        adr += 13;
        outBuff.writeUInt32LE(czas, adr);//epoch w sekundach
        adr += 4;
        outBuff.write('\r\n', adr);
        adr += 2;
        fs.writeFile(fileName, outBuff);
      } else {
        socket.emit('get_gpar');
        console.log('Brak parametrów do utworzenia pliku');
      }
    });
  }

  function EmptyData() {
    return {
      TimeStamp_js: 0,
      Analog: [],
      Bit: [],
      Mesg: [],
      MesgType: [],
      MesgStatus: [],
      BlockUsr: [],
      BlockSrvc: [],
      BlockAdv: []
    };
  }

  function CopyData(src) {
    return {
      TimeStamp_js: src.TimeStamp_js,
      Analog: src.Analog.slice(),
      Bit: src.Bit.slice(),
      Mesg: src.Mesg.slice(),
      MesgType: src.MesgType.slice(),
      MesgStatus: src.MesgStatus.slice(),
      BlockUsr: src.BlockUsr.slice(),
      BlockSrvc: src.BlockSrvc.slice(),
      BlockAdv: src.BlockAdv.slice()
    };
  }

  function EncodeBlock(data, prev, offset, sign) {
    var len = data.length;
    var count = 0;
    var outBuff = new Buffer(4 * len);
    var i;
    for (i = 0; i < len; i += 1) {
      if (prev[i] === undefined || prev[i] !== data[i]) {
        outBuff.writeUInt16LE(i + offset, 4 * count);//id zmiennej
        if (sign) {
          outBuff.writeInt16LE(data[i], 4 * count + 2);//wartosc zmiennej
        } else {
          outBuff.writeUInt16LE(data[i], 4 * count + 2);//wartosc zmiennej
        }
        count += 1;
      }
    }
    return outBuff.slice(0, count * 4);
  }

  function appendFrame(data, forceAll) {
    var fileName;
    var outBuff = new Buffer(10);
    var parametry = common.getGpar();
    var adr = 0;
    var outBuffDane;
    var countChange;
    var d = new Date();

    if (!data) {
      console.log('Brak danych');
      return;
    }

    if (!parametry) {
      socket.emit('get_gpar');
      console.log('Błąd parametrów przy zapisie do pliku');
      return;
    }

    if (!logger_dir) {
      // console.log('skip logger');
      return;
    }

    //TODO: zamienic na skrypt .sh
    if (logger_dir === 'USB') {
      console.log('usb logger ' + logger_dir);
      logger_dir = null;
      if (process.platform === 'linux') {
        cp.exec('df | grep ^/dev/sd', function (error, stdout, stderr) {
          var poz = stdout.search('%');
          if (poz !== -1) {
            var pen = stdout.substring(poz + 2).trim();
            console.log('Znaleziono PENDRIVE: ' + pen);
            cp.exec('mkdir ' + pen + '/Rejestracja',
              function (error, stdout, stderr) {
                console.log(stdout);
                logger_dir = pen + '/Rejestracja';
                if (stderr) { console.log('stderr: ' + stderr); }
                if (error) { console.log('error 1: ' + error); }
              });
          }
          if (stderr) { console.log('stderr: ' + stderr); }
          if (error) { console.log('error 2: ' + error); }
        });
      }
      return;
    }

    d.setTime(data.TimeStamp_js);
    fileName = d.toISOString()
      .substring(0, (parametry.rZapisTyp === 0) ? 13 : 10)
      .replace(/[\-T]/mg, '_') + '.dat';

    if (logger_dir) { fileName = logger_dir + '/' + fileName; }

    if (!fs.existsSync(fileName)) {
      createFile(fileName, data.TimeStamp_s);
      prev_data.TimeStamp_js = 0;
      forceAll = true;
    }

    if (typeof parametry.tZapisCzasZrzutu !== 'number') {
      console.log('parametry.tZapisCzasZrzutu');
      console.log(parametry.tZapisCzasZrzutu);
      console.log(typeof parametry.tZapisCzasZrzutu);
    }

    var czas_zrzutu = parametry.tZapisCzasZrzutu;
    if (!czas_zrzutu) {czas_zrzutu = 60000; }
    if (forceAll || !prev_data || ((data.TimeStamp_js - prev_data.TimeStamp_js) > czas_zrzutu)) {
      prev_data = new EmptyData();  // tylko przy zapisie całej ramki
      outBuff.writeUInt32LE(0xffffffff, adr);
      adr += 4;
    }

    outBuff.writeUInt32LE(data.TimeStamp_ms, adr);        //milisekund od polnocy
    adr += 4;

    outBuffDane = new Buffer.concat([
      new EncodeBlock(data.Analog, prev_data.Analog, 1000, true),
      new EncodeBlock(data.Bit, prev_data.Bit, 2000),
      new EncodeBlock(data.Mesg, prev_data.Mesg, 3000),
      new EncodeBlock(data.MesgType, prev_data.MesgType, 4000),
      new EncodeBlock(data.MesgStatus, prev_data.MesgStatus, 5000),
      new EncodeBlock(data.BlockUsr, prev_data.BlockUsr, 6000),
      new EncodeBlock(data.BlockSrvc, prev_data.BlockSrvc, 7000),
      new EncodeBlock(data.BlockAdv, prev_data.BlockAdv, 8000)
    ]);

    //ilosc zmienionych danych
    outBuff.writeUInt16LE(outBuffDane.length / 4, adr);
    adr += 2;
    outBuff = outBuff.slice(0, adr);
    outBuff = Buffer.concat([outBuff, outBuffDane]);
    countChange = outBuffDane.length / 4;
    // console.log('countChange: ' + countChange);
    if (countChange) {
      fs.appendFile(fileName, outBuff, function () {
        if (prev_data.TimeStamp_js === 0) {
          console.log('Zapis całej ramki do pliku: ', fileName,
            ', zmian = ', countChange);
        } else {
          console.log('Zapis zmian do pliku: ', fileName,
            ', zmian = ', countChange);
        }
      });
    }
    prev_data = new CopyData(data);
  }
  prev_data = new EmptyData();

  socket
    .on('connect', function (dane) {
      socket.emit('nazwa', 'zapis');
    })
    .on('dane', function (dane) {
      // console.log('dane zapis');
      if (!dane.error) {
        appendFrame(dane);
      }
    })
    .on('gpar', function (gpar) {
      console.log('zapis on gpar');
      common.storeGpar(gpar);
    });
}());
