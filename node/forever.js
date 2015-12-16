/**
 *  @file main.js
 *  @brief zarządzanie uruchomieniem programu i logowanie do plikow
 */
(function () {
  'use strict';
  require('cache-require-paths');
  var child;
  var logLast = {val:0};
  var errLast = {val:0};
  var logStream;
  var errStream;
  var logBuff = '';
  var errBuff = '';
  var spawn = require('child_process').spawn;
  var argv = process.argv.slice(2);

  function formatOutput(s, last) {
    var d =  new Date();
    if (!last) { last = {val: d.getTime()}; }
    if (last.val == 0) { last.val = d.getTime(); }
    var out = d.toISOString() + ' (' + (d.getTime() - last.val)/1000 + 's): ' + s;
    last.val = d.getTime();
    process.stdout.write(out);
    return out;
  }

  function writeStream(type, msg) {
    if (type === 'err') {
      if (errStream) {
        errStream.write(errBuff + formatOutput(msg, errLast));
        errBuff = '';
      } else {
        errBuff += formatOutput(msg, errLast);
      }
    } else {
      if (logStream) {
        logStream.write(logBuff + formatOutput(msg, logLast));
        logBuff = '';
      } else {
        logBuff += formatOutput(msg, logLast);
      }
    }
  }

  writeStream('log', 'start\n');
	function startApp() {
    writeStream('log', 'startApp()\n');
    child = spawn('node',  argv);
		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');
		child.stdout.on('data', function (d) {
      writeStream('log', d);
    });
		child.stderr.on('data', function (d) {
      writeStream('err', d);
    });
    child.on('close', function (code) {
      writeStream('err', 'child process exited with code ' + code + '\n');
      setTimeout(function () {
        startApp();
      }, 500);
    });
  }

  startApp();
  var fs = require('fs');
  fs.mkdir(__dirname + '/../log/', function (e) {
    if (e.code !== 'EEXIST') {
      console.log('mkdir error');
      return;
    }
    var fileName = argv[0].match(/.*[\/\\]+(.*)\.js/);
    if (!fileName) { fileName = argv[0].match(/(.*)\.js/); }
    if (!fileName) { fileName = 'undefined'; } else { fileName = fileName[1]; }
    logStream = fs.createWriteStream(__dirname + '/../log/' + fileName + '.log', {flags : 'w'});
    errStream = fs.createWriteStream(__dirname + '/../log/' + fileName + '.err', {flags : 'a'});
  });
}());
