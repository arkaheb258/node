/**
 *  @file main.js
 *  @brief zarządzanie uruchomieniem programu i logowanie do plikow
 */
(function () {
  'use strict';
  require('cache-require-paths');
  var spawn = require('child_process').spawn;
  var fs = require('fs');
  var argv = process.argv.slice(2);
  var child;
  var fileName = argv[0].match(/.*[\/\\]+(.*).js/);
  if (!fileName) { fileName = 'undefined'; } else { fileName = fileName[1]; }

  try {
    fs.mkdirSync(__dirname + '/../log/');
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }

  var logStream = fs.createWriteStream(__dirname + '/../log/' + fileName + '.log', {flags : 'w'});
  var errStream = fs.createWriteStream(__dirname + '/../log/' + fileName + '.err', {flags : 'a'});
  // console.log(argv);
  // console.log(fileName);
  
  function formatOutput(s) {
    var d =  new Date().toISOString();
    process.stdout.write(d + ': ' + s);
    return d + ': ' + s;
  }
  
	function startApp() {
    child = spawn('node',  argv);
		child.stdout.setEncoding('utf8');
		child.stderr.setEncoding('utf8');
		child.stdout.on('data', function (d) {
      logStream.write(formatOutput(d));
    });
		child.stderr.on('data', function (d) {
      logStream.write(formatOutput(d));
    });
    child.on('close', function (code) {
      errStream.write(formatOutput('child process exited with code ' + code + '\n'));
      setTimeout(function(){
        startApp();
      }, 500);
    });
  }

  startApp();
}());
