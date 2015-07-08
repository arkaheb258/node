/**
 *  @file common.js
 *  @brief Brief
 */
(function () {
  'use strict';
  var exec = require('child_process').exec;
  var Ftp = require('ftp');
  var gpar = null;
  var dane = null;

  function runScript(script_name, args, callback) {
    var opts = {cwd: __dirname + '/../scripts'};
    var script = script_name + '.sh';
    if (process.platform === 'linux') { script = 'chmod +x * && ./' + script; }
    switch (script_name) {
      // TODO:
      case 'getTime': {
        opts.timeout = 2000;
        // if (callback) { callback(Date.now()); }
        break;
      }
      case 'jsonZPLC':
      case 'jsonNaPLC': {
        args = '/flash/json ../json';
        break;
      }
      default:
        break;
    }
      
    if (args) { script += ' ' + args; }
    exec(script, opts, function (error, stdout, stderr) {
      switch (script_name) {
        case 'git-revision': {
          var gitVer = '0.9.x';
          if (!error) { gitVer = stdout.replace(/[ \n\r]*/mg, ''); }
          if (callback) {callback(gitVer); }
          break;
        }
        case 'getTime': {
          var data = 0;
          console.log(script, args);
          if (!error) { 
            data = stdout.replace(/[ \n\r]*/mg, '')+'000'; 
          }
          if (callback) {callback(data); }
          break;
        }
        default: {
          console.log(script, args);
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          console.log('error: ' + error);
          if (callback) {callback((error) ? stderr : 'OK'); }
        }
        break;
      }
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
        }
        var string = '';
        stream.on('data', function (response) {
          string += response;
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
    this.fun = fun;
    this.nextAt = Date.now();
    this.nextTick(true);
  }

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

  MyInterval.prototype.setInterval = function (interval) {
    this.interval = interval;
    console.log('MyInterval new interval:', this.interval);
    var temp = Date.now();
    //zaokrglenie czasu startu
    this.nextAt = temp - (temp % this.interval);
    if (this.timeout) clearTimeout(this.timeout);
    this.nextTick(true);
  };

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