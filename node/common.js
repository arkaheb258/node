/**
*  @file common.js
*  @brief Funkcje wykorzystywane przez wiele modułów
*/
'use strict';
var exec = null;
var spawn = null;
var gpar = null;
var dane = null;

/**
 *  @param [in] args Parameter_Description
 *  @param [in] callback_end Parameter_Description
 *  @return ChildProcess object
 */
module.exports.runScript = function (args, callback_end, interpreter) {
  if (!exec) { exec = require('child_process').exec; }
  if (!spawn) { spawn = require('child_process').spawn; }
  var opts = {cwd: __dirname + '/../scripts'};
  // opts.timeout = 2000;
  interpreter = interpreter || 'sh';
  var proc = spawn(interpreter, args, opts);
  var stdout = '';
  var stderr = '';
  proc.stdout.on('data', function (data) { stdout += data; });
  proc.stderr.on('data', function (data) { stderr += data; });
  proc.on('close', function (code) {
    callback_end({
      stderr: stderr,
      stdout: stdout,
      error: code
    });
  });
  return proc;
};

/**
 * Description
 * @method pobierzPlikFTP
 * @param {} con_par
 * @param {} callback
 * @param {} cache
 zamienic na wykonanie skryptu ftp.js
 */
function pobierzPlikFTP(con_par, callback) {
  var Ftp = require('ftp');
  var c = new Ftp();
  c.on('ready', function () {
    c.get(con_par.path, function (err, stream) {
      if (err) {
        console.log('FTP error', err);
        callback(null);
        return;
      }
      var string = '';
      stream.on('data', function (response) {
        string += response;
      });
      stream.once('close', function () {
        console.log('FTP: pobrano plik ', con_par.path);
        callback(string);
        c.end();
      });
    });
  });
  c.on('timeout', function () {
    console.log('FTP timeout');
    callback(null);
  });
  c.on('error', function (err) {
    console.log('FTP error', err);
    callback(null);
  });
  c.connect({host: con_par.host,
    user: con_par.user, password: con_par.password,
    connTimeout: 2000, pasvTimeout: 2000});
}

/**
 * Konwersja czasu w milisekundach do fotmatu Codesys ('T#...')
 * @method msToCodesysTime
 * @param {Number} ms
 * @return {string} out
 */
module.exports.msToCodesysTime = function (ms) {
  var out = 'T#0ms';
  if (parseInt(ms, 10) > 0) {
    out = 'T#' + (Math.floor(ms / 86400000) ? (Math.floor(ms / 86400000)) + 'd' : '');
    out += (((Math.floor(ms / 3600000)) % 24) ? ((Math.floor(ms / 3600000)) % 24) + 'h' : '');
    out += (((Math.floor(ms / 60000)) % 60) ? ((Math.floor(ms / 60000)) % 60) + 'm' : '');
    out += (((Math.floor(ms / 1000)) % 60) ? ((Math.floor(ms / 1000)) % 60) + 's' : '');
    out += (ms % 1000 ? (ms % 1000) + 'ms' : '');
  }
  return out;
};

/**
 * Czas w fotmacie Codesys ('T#...') w milisekundach
 * @method codesysTimeToMs
 * @param {string} time
 * @return Number
 */
module.exports.codesysTimeToMs = function (time) {
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
};

/**
 * Description
 * @method readStringTo0
 * @param {} buf
 * @param {} start
 * @param {} len
 * @return CallExpression
 */
module.exports.readStringTo0 = function (buf, start, len) {
  var i;
  if (!buf) {return null;}
  for (i = start; i < start + len; i += 1) {
    if (buf[i] === 0) {
      break;
    }
  }
  return buf.toString('utf8', start, i).substr(0, len);
};

/**
 * Interwał utrzymujący stałą średnią ilość wywołań
 * @class MyInterval
 * @constructor
 * @param {function} fun Funkcja wywoływana cyklicznie
 * @param {Number} interval Interwał wywoływania funkcji
 */
function MyInterval(interval, fun) {
  this.interval = interval;
  // console.log('MyInterval start interval:', this.interval);
  this.fun = fun;
  this.nextAt = Date.now();
  this.nextTick(true);
}

/**
* @memberof! MyInterval#
*/
MyInterval.prototype.nextTick = function (restart) {
  var self = this;
  var delay = this.nextAt - Date.now();
  // console.log('delay = '+delay + 'ms', this.interval);
  if (delay < -1000 || delay > 60000) {
    console.log('MyInterval delay error');
    // delay = 1000;
    restart = true;
  }
  if (restart) {
    var temp = Date.now();
    //zaokrglenie czasu startu
    this.nextAt = temp - (temp % this.interval);
    delay = this.nextAt - Date.now();
  }
  this.nextAt += this.interval;
  this.timeout = setTimeout(function () {
    self.nextTick();
  }, delay);
  this.fun();
};

/**
* @memberof! MyInterval#
*/
MyInterval.prototype.setInterval = function (interval) {
  this.interval = interval;
  console.log('MyInterval new interval:', this.interval);
  var temp = Date.now();
  //zaokrglenie czasu startu
  this.nextAt = temp - (temp % this.interval);
  if (this.timeout) { clearTimeout(this.timeout); }
  this.nextTick(true);
};

module.exports.summerTimeOffset = function (epoch) {
  var lato = -60;
  var zima = 0;
  epoch = Number(epoch);
  if (epoch < 1445738400000) return lato;       // 2015-10-25 03:00:00
  else if (epoch < 1459040400000) return zima;  // 2016-03-27 02:00:00
  else if (epoch < 1477357200000) return lato;  // 2016-10-25 03:00:00
  else if (epoch < 1490572800000) return zima;  // 2017-03-27 02:00:00
  else if (epoch < 1508893200000) return lato;  // 2017-10-25 03:00:00
  else if (epoch < 1522108800000) return zima;  // 2018-03-27 02:00:00
  else if (epoch < 1540429200000) return lato;  // 2018-10-25 03:00:00  
  else return zima;

  // var d = new Date(Number(epoch));
  // var n = d.getTimezoneOffset();
  // d.setMonth(0);
  // n -= d.getTimezoneOffset();
  // return n;
}

module.exports.dirLangPar = function (gpar, fileName) {
  var ret = {dir: '', lang: '', file: ''};
  var sKonfTypKombajnu = gpar.TYP.trim().replace(' ', '_').toLowerCase();
  if (sKonfTypKombajnu !== '') { ret.dir = '/' + sKonfTypKombajnu; }
  if (gpar.rKonfWersjaJezykowa !== undefined) {
    ret.lang = '_' + gpar.rKonfWersjaJezykowa;
  }
  if (fileName) { ret.file = ret.dir + '/' + fileName + ret.lang; }
  return ret;
};

module.exports.MyInterval = MyInterval;
module.exports.pobierzPlikFTP = pobierzPlikFTP;

module.exports.storeGpar = function (p) {
  // console.log('storeGpar', p === null);
  gpar = p;
};
module.exports.getGpar = function () {
  // console.log('getGpar');
  return gpar;
};
