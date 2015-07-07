// common.js
(function () {
  'use strict';
  // var http = require('http');
  // var fs = require('fs');
  var NTP_HWCLOCK = false;
  var exec = require('child_process').exec;
  // var walk = require('walk');
  // var NTP_IP_i = 0;
  var Ftp = require('ftp');
  var gpar = null;
  var dane = null;

  //dodanie zer wiodących
  // function pad(num, size) {
    // var s = num.toString();
    // while (s.length < size) { s = '0' + s; }
    // return s;
  // }

  //funkcja usuwajaca duplikaty z tablicy
  // var arrayUnique = function (a) {
    // return a.reduce(function (p, c) {
      // if (p.indexOf(c) < 0) {p.push(c); }
      // return p;
    // }, []);
  // };

  function runScript(script, args, callback) {
    // docelowo skrypt *.sh
    // var opts = {cwd: './scripts'};
    var opts = {cwd: './node/scripts'};
    switch (script) {
    case 'git-revision':
      script = 'git-revision.sh';
      exec('git-revision.sh', opts, function (error, stdout, stderr) {
        // console.log(script, args);
        var gitVer = '0.9.x';
        if (!error) { gitVer = stdout.replace(/[ \n\r]*/mg, ''); }
        if (callback) {callback(gitVer); }
      });
      return;
    // TODO:
    case 'setTime':
      var str = args.toISOString().split('T');
      var sDate = str[0];
      var sTime = str[1].replace(/\..+/, '');
      set_time(args);
      return;
    case 'getTime':
      opts.timeout = 2000;
      if (callback) { callback(Date.now()); }
      return;
      // break;
    default:
      break;
    }
    // if (process.platform === 'linux') { script += '.sh'; }
    if (args) { args = ' ' + args; } else {args = ''; }
    exec(script + args, opts, function (error, stdout, stderr) {
      console.log(script, args);
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      console.log('error: ' + error);
      if (callback) {callback('OK'); }
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
    con_par = con_par || {host : '192.168.3.30', user : 'admin', password : 'admin'};
    var c = new Ftp();
    c.on('ready', function () {
      c.get(file, function (err, stream) {
        if (err) {
          console.log('FTP error');
          console.log(err);
          callback(null);
          return;
          // throw err;
        }
        // console.log('ftp');
        // c.on('readable', function () {
          // var chunk;
          // while (null !== (chunk = c.read())) {
            // console.log('got %d bytes of data', chunk.length);
          // }
        // });
        var string = '';
        stream.on('data', function (response) {
          string += response;
          //console.log(response);
        });
        stream.once('close', function () {
          console.log('FTP: pobrano plik ', file);
          callback(string);
          c.end();
        });
      });
    });
    c.on('timeout', function () {
      console.log('FTP timeout');
      callback(null);
    });
    c.on('error', function () {
      console.log('FTP error');
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
    var str = dataa.toISOString().split('T');
    var sDate = str[0];
    var sTime = str[1].replace(/\..+/, '');
    // var sDate = dataa.getUTCFullYear() + '-' + pad(dataa.getUTCMonth() + 1, 2) + '-' + pad(dataa.getUTCDate(), 2);
    // var sTime = pad(dataa.getUTCHours(), 2) + ':' + pad(dataa.getUTCMinutes(), 2) + ':' + pad(dataa.getUTCSeconds(), 2);
    if (process.platform === 'linux') {
      // console.log('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime);
      exec('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime, function (error, stdout, stderr) {
        console.log('sudo date -u --set ' + sDate + ' && sudo date -u --set ' + sTime);
        // console.log('date 2');
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        console.log('error: ' + error);
        // console.log(sDate);
        // console.log(sTime);
        exec('sudo hwclock -w', function (error, stdout, stderr) {
          console.log('sudo hwclock -w');
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          console.log('error: ' + error);
          if (NTP_HWCLOCK) {
            exec('sudo hwclock -w -f /dev/rtc1', function (error, stdout, stderr) {
              console.log('sudo hwclock -w -f /dev/rtc1');
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              console.log('error: ' + error);
            });
          }
        });
      });
    // } else if (process.platform === 'win32') {
          // child = exec('date ' + dataa.getUTCFullYear() + '/' + dataa.getUTCMonth() + '/' + dataa.getUTCDate(), function (error, stdout, stderr) {
  //          console.log('stdout: ' + stdout);
  //          console.log('stderr: ' + stderr);
  //          if (error !== null) { console.log('exec error: ' + error);  }
          // });
          // child = exec('time ' + dataa.getUTCHours() + ':' + dataa.getUTCMinutes() + ':' + dataa.getUTCSeconds(), function (error, stdout, stderr) {});
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
    var out = 'T#0ms';
    if (parseInt(ms, 10) > 0) {
      out = 'T#' + (Math.floor(ms / 86400000) ? (Math.floor(ms / 86400000)) + 'd' : '');
      out += (((Math.floor(ms / 3600000)) % 24) ? ((Math.floor(ms / 3600000)) % 24) + 'h' : '');
      out += (((Math.floor(ms / 60000)) % 60) ? ((Math.floor(ms / 60000)) % 60) + 'm' : '');
      out += (((Math.floor(ms / 1000)) % 60) ? ((Math.floor(ms / 1000)) % 60) + 's' : '');
      out += (ms % 1000 ? (ms % 1000) + 'ms' : '');
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
      console.log('codesysTimeToMs time error');
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
    var i;
    for (i = start; i < start + len; i += 1) {
      if (buf[i] === 0) {
        break;
      }
    }
    return buf.toString('utf8', start, i).substr(0, len);
  }

  /**
   * Description
   * @method MyInterval
   * @param {function} fun
   * @param {Number} interval
   */
  function MyInterval(interval, fun) {
    this.interval = interval;
    // console.log('MyInterval start interval:', this.interval);
    var temp = Date.now();
    //zaokrglenie czasu startu
    this.nextAt = temp - (temp % this.interval);
    this.fun = fun;

    this.nextTick();
  }

  MyInterval.prototype.nextTick = function () {
    var self = this;
    this.nextAt += this.interval;
    var delay = this.nextAt - Date.now();
    // console.log('delay = '+delay + 'ms', this.interval);
    if (delay < -1000) {
      console.log('MyInterval delay error');
      var temp = Date.now();
      //zaokrglenie czasu startu
      this.nextAt = temp - (temp % this.interval);
      delay = 1000;
    }
    setTimeout(function () {
      self.nextTick();
    }, delay);
    this.fun();
  };

  MyInterval.prototype.setInterval = function (interval) {
    this.interval = interval;
    // console.log('MyInterval new interval:', this.interval);
    var temp = Date.now();
    //zaokrglenie czasu startu
    this.nextAt = temp - (temp % this.interval);
  };

  // module.exports.set_time = set_time;
  // module.exports.kopiujJsonNaPLC = kopiujJsonNaPLC;
  // module.exports.pad = pad;

  module.exports.MyInterval = MyInterval;
  module.exports.pobierzPlikFTP = pobierzPlikFTP;
  module.exports.msToCodesysTime = msToCodesysTime;
  module.exports.codesysTimeToMs = codesysTimeToMs;
  module.exports.readStringTo0 = readStringTo0;
  module.exports.runScript = runScript;

  // mozna zamienic na atrybut klasy Strada
  module.exports.storeDane = function (d) { dane = d; };
  module.exports.getDane = function () { return dane; };

  module.exports.storeGpar = function (p) {
    // console.log('storeGpar', p === null);
    gpar = p;
  };
  module.exports.getGpar = function () {
    // console.log('getGpar');
    return gpar;
  };
}());