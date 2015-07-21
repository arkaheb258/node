/**
 *  @file main.js
 *  @brief zarządzanie uruchomieniem programu i logowanie do plikow
 */
(function () {
  'use strict';
  require('cache-require-paths');
  var spawn = require('child_process').spawn;
  var opts = {cwd: __dirname + '/../scripts'};
  // opts.timeout = 2000;
  var proc = spawn('../npm', ['run','strada'], opts);  
  console.log('test log');
  console.error('test err');
  // require('./strada.js');
}());
