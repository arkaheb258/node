﻿// common.js
(function () {
  "use strict";
  var http = require('http');
  var fs = require("fs");
  var NTP_HWCLOCK = false;
  var exec = require('child_process').exec;
  var walk = require('walk');
  var NTP_IP_i = 0;
  var Ftp = require("ftp");
  var gpar = null;
  var dane = null;
  
  var cl = function(){};
  // var cl = console.log;

  //dodanie zer wiodących
  function pad(num, size) {
    var s = num.toString();
    while (s.length < size) { s = "0" + s; }
    return s;
  }

  //funkcja usuwajaca duplikaty z tablicy
  var arrayUnique = function (a) {
    return a.reduce(function (p, c) {
      if (p.indexOf(c) < 0) {p.push(c); }
      return p;
    }, []);
  };

  //TODO: kopiowanie zawartosci folderu json na PLC 
  // (dodac parametryzacje folderu json)
  function kopiujJsonNaPLC(callback) {
    var c = new Ftp();
    // var config = {host : "192.168.3.30", user : "admin", password : "admin", port : 21, "connTimeout" : 2000, "pasvTimeout" : 2000};
    var files   = [];
    var dirs   = [];

    // Walker options
    var walker  = walk.walk('./build/json', { followLinks: false });

    walker.on('file', function (root, stat, next) {
      // Add this file to the list of files
      files.push('/' + root.split('\\')[1] + '/' + stat.name);
      dirs.push(root.split('\\')[1]);
      next();
    });

    walker.on('end', function () {
      dirs = arrayUnique(dirs);
      // console.log(files);
      c.connect({host : "192.168.3.30",
        user : "admin", password : "admin",
        connTimeout : 2000, pasvTimeout : 2000});
    });

    c.on('ready', function () {
      // console.log(files);
      // console.log(dirs);
      var f_count = files.length;
      var f_counter = 0;
      var d_count = dirs.length;
      var d_counter = 0;
      for (var d in dirs) {
        // console.log("ftp rmdir ", '/flash/json/' + dirs[d]);
        // c.delete('/flash/json/*', function(err) {
        // c.rmdir('/flash/json/' + dirs[d], true, function(err) {
        c.mkdir('/flash/json/' + dirs[d], function (err) {
          d_counter += 1;
          console.log("ftp mkdir ", d_counter, '/', d_count);
          if (d_count == d_counter) {
            console.log("ftp mkdir end");
            for (var f in files) {
              // console.log(files[f], ' -> ', "ftp put ", '/flash/json/' + files[f]);
              c.put(files[f], '/flash/json' + files[f], function (err) {
                f_counter += 1;
                console.log("ftp put ", f_counter, '/', f_count);
                if (f_count == f_counter) {
                  c.end();
                  console.log("ftp put end");
                  if (callback) { callback("OK"); }
                }
                if (err) {
                  console.log(err);
                  if (callback) { callback("err: " + err); }
                  throw err;
                }
              });
            }
          }
          // if (err) throw err;
          if (err) { console.log(err); }
        });
          // if (err) console.log("rm err ", err);
        // });
      }
    });
    c.on('error', function () {
      console.log("FTP error");
      c.end();
      if (callback) { callback("FTP error"); }
    });
    c.on('timeout', function () {
      console.log("FTP timeout");
      c.end();
      if (callback) { callback("FTP timeout"); }
    });
  }

  /**
   * Description
   * @method pobierzPlikFTP
   * @param {} con_par
   * @param {} callback
   * @param {} cache
   */
  function pobierzPlikFTP(file, con_par, callback) {
    con_par = con_par || {host : '192.168.3.30', user : 'admin', password : 'admin'}
    var c = new Ftp();
    c.on('ready', function () {
      c.get(file, function (err, stream) {
        if (err) {
          console.log("FTP error");
          console.log(err);
          callback(null);
          return;
          // throw err;
        }
        // console.log("ftp");
        c.on('readable', function () {
          var chunk;
          while (null !== (chunk = c.read())) {
            // console.log('got %d bytes of data', chunk.length);
          }
        });
        var string = "";
        stream.on('data', function (response) {
          string += response;
          //console.log(response);
        });
        stream.once('close', function () {
          console.log("FTP: pobrano plik ", file);
          callback(string);
          c.end();
        });
      });
    });
    c.on('timeout', function () {
      console.log("FTP timeout");
      callback(null);
    });
    c.on('error', function () {
      console.log("FTP error");
      callback(null);
    });
    c.connect({host: con_par.host, 
      user: con_par.user, password: con_par.password,
      connTimeout: 2000, pasvTimeout: 2000});
  }

  /**
   * Description
   * @method set_time
   * @param {} dataa
   */
  function set_time(dataa) {
    // TODO: zamienic na ponizsze i przetestowac
    // var str = dataa.toISOString().split('T');
    // sDate = str[0];
    // sTime = str[1].replace(/\..+/, '');
    var sDate = dataa.getUTCFullYear() + "-" + pad(dataa.getUTCMonth() + 1, 2) + "-" + pad(dataa.getUTCDate(), 2);
    var sTime = pad(dataa.getUTCHours(), 2) + ":" + pad(dataa.getUTCMinutes(), 2) + ":" + pad(dataa.getUTCSeconds(), 2);
    if (process.platform === "linux") {
      // console.log('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime);
      exec('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime, function (error, stdout, stderr) {
        console.log('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime);
        // console.log("date 2");
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        console.log("error: " + error);
        // console.log(sDate);
        // console.log(sTime);
        exec("sudo hwclock -w", function (error, stdout, stderr) {
          console.log("sudo hwclock -w");
          console.log("stdout: " + stdout);
          console.log("stderr: " + stderr);
          console.log("error: " + error);
          if (NTP_HWCLOCK) {
            exec("sudo hwclock -w -f /dev/rtc1", function (error, stdout, stderr) {
              console.log("sudo hwclock -w -f /dev/rtc1");
              console.log("stdout: " + stdout);
              console.log("stderr: " + stderr);
              console.log("error: " + error);
            });
          }
        });
      });
    } else if (process.platform === "win32") {
          // child = exec('date ' + dataa.getUTCFullYear() + "/" + dataa.getUTCMonth() + "/" + dataa.getUTCDate(), function (error, stdout, stderr) {
  //          console.log('stdout: ' + stdout);
  //          console.log('stderr: ' + stderr);
  //          if (error !== null) { console.log('exec error: ' + error);  }
          // });
          // child = exec('time ' + dataa.getUTCHours() + ":" + dataa.getUTCMinutes() + ":" + dataa.getUTCSeconds(), function (error, stdout, stderr) {});
    }
    //TODO: obsługa błędu zapisu
  }

  /**
   * Description
   * @method msToCodesysTime
   * @param {} ms
   * @return out
   */
  function msToCodesysTime(ms) {
    var out = "T#0ms";
    if (parseInt(ms, 10) > 0) {
      out = "T#" + (Math.floor(ms / 86400000) ? (Math.floor(ms / 86400000)) + "d" : "")
        + (((Math.floor(ms / 3600000)) % 24) ? ((Math.floor(ms / 3600000)) % 24) + "h" : "")
        + (((Math.floor(ms / 60000)) % 60) ? ((Math.floor(ms / 60000)) % 60) + "m" : "")
        + (((Math.floor(ms / 1000)) % 60) ? ((Math.floor(ms / 1000)) % 60) + "s" : "")
        + (ms % 1000 ? (ms % 1000) + "ms" : "");
    }
    return out;
  }

  /**
   * Description
   * @method codesysTimeToMs
   * @param {} time
   * @return BinaryExpression
   */
  function codesysTimeToMs(time) {
    if (typeof time !== 'string') {
      console.log(time);
      console.log("codesysTimeToMs time error");
      return 0;
    }
//    var regexp = /(\d+)d(\d+)h(\d+)m(\d+)s(\d+)ms/;
    var d = time.match(/(\d+)d/);
    var h = time.match(/(\d+)h/);
    var m = time.match(/(\d+)m/);
    var s = time.match(/(\d+)s/);
    var ms = time.match(/(\d+)ms/);
    if (d) { d = d[1] * 86400000; }
    if (h) { h = h[1] * 3600000; }
    if (m) { m = m[1] * 60000; }
    if (s) { s = s[1] * 1000; }
    if (ms) { ms = parseFloat(ms[1]); }
    return d + h + m + s + ms;
  }

  /**
   * Description
   * @method readStringTo0
   * @param {} buf
   * @param {} start
   * @param {} len
   * @return CallExpression
   */
  function readStringTo0(buf, start, len) {
    for (var i = start; i < start + len; i += 1) {
      if (buf[i] === 0) {
        break;
      }
    }
    return buf.toString('utf8', start, i).substr(0, len);
  }

  /**
   * Description
   * @method szukajPar
   * @param {} gpar
   * @param {} naz
   * @return Literal
   */
  function szukajPar(gpar, naz) {
    if (gpar && gpar.DANE) {
      for (var i in gpar.DANE) {
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
  function czytajPlikParametrowWiz(data, gpar) {
    var temp = null;
    var js;
    try {
      js = JSON.parse(data);
      if (js.DANE) {
        for (var g in js.DANE) {
          if (typeof js.DANE[g] === "object") {
            for (var p in js.DANE[g]) {
              if (typeof js.DANE[g][p] === "object") {
                for (var s in js.DANE[g][p]) {
                  if (typeof js.DANE[g][p][s] === "object" && js.DANE[g][p][s].WART !== undefined) {
                    // if (js.DANE[g][p][s].TYP === "pCzas") console.log(js.DANE[g][p][s].WART);
                    temp = szukajPar(gpar, s);
                    if (temp === null) {
                      // console.log("P - Nie znaleziono parametru \"" + s + "\"");
                    } else if (js.DANE[g][p][s].WART !== temp) {
      //console.log(" "+ s + ": " + js.DANE[g][p][s].WART + " -> " + temp);
                      js.DANE[g][p][s].WART = temp;
                    }
                  }
                }
              }
            }
          }
        }
      }
      return js;
    } catch (err) {
      console.log(data);
      return "Błąd pliku parametrów (JSON parser)";
    }
  }

  /**
   * Description
   * @method czytajPlikSygnalow
   * @param {} data
   * @param {} gpar
   * @return js
   */
  function czytajPlikSygnalow(data, gpar) {
    var temp = null;
    var js = JSON.parse(data);
    if (typeof js === "object") {
      for (var g in js) {
        if (typeof js[g] === "object") {
          for (var p in js[g]) {
            //TODO: Paweł - poprawa reakcji na undefined przy odchudzonym pliku
            // if (js[g][p] === null) {
              // delete js[g][p];
            // } else
            if (typeof js[g][p] === "string") {
              //TODO: Paweł - poprawa reakcji na undefined przy odchudzonym pliku
              // console.log(p+": "+js[g][p]);
              // if (js[g][p] === "") {
                // delete js[g][p];
              // } else
              if (js[g][p].indexOf("_par_") === 0) {
                var s = js[g][p].substr(5);
                temp = szukajPar(gpar, s);
                if (temp === null) {
                  console.log("S - Nie znaleziono parametru \"" + s + "\"");
                } else {
    //              console.log(" "+ s + ": " + js[g][p] + " -> " + temp);
                  js[g][p] = temp;
                }
              }
            }
          }
        }
      }
    }
    return js;
  }

  /**
   * Description
   * @method czytajPlikKomunikatow
   * @param {} text
   * @param {} word
   * @return output
   */
  function czytajPlikKomunikatow(text, word) {
//    text = text.replace(/\t(.*)/mg, "$1");  //usuniecie tabulacji na początku wierszy
    var rows = text.split("\n");
    var output = [];
    var out_string = ""; //do generowania listy komunikatów dla serwisu
    var i = 0;
    for (var l in rows) {
      if (rows.hasOwnProperty(l)) {
        var row = rows[l].trim();
        if (row.search(";") !== -1 && row.search("x") === 0) {
          var nr = (i - (i % 16)) / 16;
          var bit = (i % 16);
          var opis = row.substring(row.search(/\(\*/g) + 2, row.search(/\*\)/g)).trim();
          var nb = 0;
          if (output[nr] === undefined) { output[nr] = {opis: "opis slowa " + nr, nr: nr, bity: []}; }
          if (opis.indexOf("_nb_") === 0) {
            opis = opis.substring(4).trim();
            nb = 1;
          }
    //        output[nr].bity[bit] = {nr: nr, bit: bit, opis: opis};
          out_string += "Kod " + (nr * 16 + bit) + ": " + opis + "\n";
          output[nr].bity[bit] = {nb: nb, bit: bit, opis: opis};
          i += 1;
        }
      }
    }
    if (word) { return out_string; } //else {
    return output; //}
  }

  /**
   * Description
   * @method wyluskajParametry
   * @param {} data
   * @return out
   */
  function wyluskajParametry(data) {
    if (!data) { return null; }
    var js = JSON.parse(data);
    var out = [];
    if (js.DANE) {
      out = js;
      var i;
      for (i in js.DANE) {
        if (js.DANE.hasOwnProperty(i)) {
          var temp = js.DANE[i];
          switch (temp.NAZ) {
          case 'sKonfTypKombajnu':
          case 'rKonfWersjaJezykowa':
          case 'sKonfNrKomisji':
          case 'sKonfNazwaKopalni':
          case 'sKonfNrSciany':
          case 'sKonfWersjaProgramu':
          case 'rKonfCzasLetni':
          case 'rKonfCzasStrefa':
          case 'rZapisTyp':
            out[temp.NAZ] = temp.WART;
            break;
          case 'tZapisCzasZrzutu':
            out[temp.NAZ] = codesysTimeToMs(temp.WART.toString());
            break;
          default:
            break;
          }
        }
      }
    }
    return out;
  }
  
  /**
   * Description
   * @method decodeStrada307
   * @param {Buffer} buf dane ze strady
   * @param {Object} outPar
   * @return outPar
   */
  function decodeStrada307(buf, outPar) {
    var len, ptr = 0, temp, tempStr;
    // var ok = true;
    if (outPar && outPar.DANE) {
      len = outPar.DANE.length;
    } else {
      return null;
    }
    for (var i = 0; i < 5; i += 1) {
      tempStr = outPar.DANE[i];
      // console.log(tempStr);
      if (typeof buf === 'object' && buf.error !== undefined) {
        console.log('Błąd decodeStrada307 ' + i);
        console.log(buf);
        return null;
      }
      temp = readStringTo0(buf, i * 32, 32);
      // console.log(temp);
      if (temp !== tempStr.WART) { 
        console.log('![', i, '] ', tempStr.NAZ, ' zmiana z ', tempStr.WART, ' na ', temp); 
        // ok = false; 
        return null;
      }
    }

    //jeżeli zmiana komisji, typu, itd. to przerwać i zwrócić null
    // if (ok === false) { return null; }

    ptr = 5 * 32;
    for (var i = 5; i < len; i += 1) {
      tempStr = outPar.DANE[i];
      if (buf.length < ptr + tempStr.ROZM * 2) { 
        console.log('błąd ilości parametrów (za mało) ' + i); 
        // ok = false; 
        return null; 
        break; 
      }
  //    console.log(tempStr);
      if (tempStr.NAZ[0] === 's') {
        temp = readStringTo0(buf, ptr, tempStr.ROZM * 2);
      } else if (tempStr.NAZ[0] === 't') {
        if (tempStr.ROZM !== 2) { 
          tempStr.ROZM = 2; 
          console.log('[', i, '] ', tempStr.NAZ, ' - błąd rozmiaru TIME');
        }
        // temp = msToCodesysTime(buf.readInt32LE(ptr));
        temp = buf.readInt32LE(ptr) / 1000;
      } else {
        if (tempStr.ROZM === 1) { temp = buf.readInt16LE(ptr); } 
        else { temp = buf.readInt32LE(ptr); }
        if (tempStr.PREC) { temp /= Math.pow(10, tempStr.PREC); }
      }
      if (tempStr.NAZ[0] === 't' && (typeof tempStr.WART === 'string') && tempStr.WART[0] === 'T') {
        // console.log('[', i, '] ', tempStr.NAZ, ' porownanie ', tempStr.WART, ' z ', temp);
        tempStr.WART = codesysTimeToMs(tempStr.WART);
        outPar.DANE[i].WART = temp;
      }
      if (temp !== tempStr.WART) {
        // console.log('[', i, '] ', tempStr.NAZ, ' zmiana z ', tempStr.WART, ' na ', temp);
        outPar.DANE[i].WART = temp;
      }
      ptr += parseFloat(tempStr.ROZM) * 2;
    }
    if (ptr !== buf.length) { 
      console.log('błąd ilości parametrów ', ptr, ' != ', buf.length);
      // ok = false; 
      return null;
    }      

    //jeżeli błąd w rozmiarze czasu lub różna długość parametrów to przerwać i zwrócić null
    // if (ok === false) { return null; }
    outPar.sKonfTypKombajnu = readStringTo0(buf, 0, 32);
    outPar.sKonfNrKomisji = readStringTo0(buf, 32, 32);
    outPar.sKonfNazwaKopalni = readStringTo0(buf, 64, 32);
    outPar.sKonfNrSciany = readStringTo0(buf, 96, 32);
    outPar.sKonfWersjaProgramu = readStringTo0(buf, 128, 32);
    return outPar;
  }
  
  module.exports.set_time = set_time;
  module.exports.pobierzPlikFTP = pobierzPlikFTP;
  module.exports.pad = pad;
  module.exports.msToCodesysTime = msToCodesysTime;
  module.exports.codesysTimeToMs = codesysTimeToMs;
  module.exports.readStringTo0 = readStringTo0;

  module.exports.decodeStrada307 = decodeStrada307;
  module.exports.wyluskajParametry = wyluskajParametry;
  // module.exports.szukajPar = szukajPar;
  module.exports.czytajPlikParametrowWiz = czytajPlikParametrowWiz;
  module.exports.czytajPlikSygnalow = czytajPlikSygnalow;
  module.exports.czytajPlikKomunikatow = czytajPlikKomunikatow;
  module.exports.kopiujJsonNaPLC = kopiujJsonNaPLC;

  module.exports.storeDane = function (d) { dane = d; };
  module.exports.getDane = function () { return dane; };
  module.exports.storeGpar = function (p) { cl('storeGpar', p == null); gpar = p; };
  module.exports.getGpar = function () { cl('getGpar'); return gpar; };
}());