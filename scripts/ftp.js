/**
*  @file ftp.js
*  @brief Transfer plików z/do PLC
*/
'use strict';
require('cache-require-paths');
var argv = require('minimist')(process.argv.slice(2));
var Ftp = require('ftp');
var fs = require('fs');
var Walker = require('walker');
var async = require('async');
var c = new Ftp();

function getFile(file, callback) {
  c.get(argv['_'][0] + file, function (err, stream) {
    if (err) {
      console.log('FTP error', err);
      callback();
      return;
    }
    var wstream = fs.createWriteStream(argv['_'][1] + file);
    stream.once('close', function () {
      // console.log('FTP: pobrano plik ', argv['_'][0] + file);
      callback();
    });
    stream.pipe(wstream);
  });
}

function putFile(file, callback) {
  // console.log(argv['_'][0] + file);
  c.put(argv['_'][1] + file, argv['_'][0] + file, callback);
  // callback();
}

function putFolder(wdir, files, recurr, callbackCF) {
  wdir = wdir.replace('/', '\\');
  var len = wdir.length;
  var dirs = [];
  Walker(wdir)
    .on('dir', function(dir, stat) {
      if (dir != wdir) {
        dirs.push(dir.substring(len));
      }
    })
    .on('file', function(file, stat) {
      files.push(file.substring(len));
    })
    .on('end', function() {
      c.mkdir(argv['_'][0], function(){
        async.eachSeries(dirs, function (value, callbackF) {
            // console.log(argv['_'][0] + value);
            c.mkdir(argv['_'][0] + value, callbackF);
        }, function (err) {
          // if (err) console.error(err.message);
          callbackCF();
        });
      });
    });
}

function getFolder(dir, files, recurr, callbackCF) {
  c.list(argv['_'][0] + dir, function(err, list) {
    if (err) throw err;
    async.eachSeries(list, function (value, callbackF) {
      var temp = value.match(/^([\d\-]{10})[\s]+([\d\:]{5})[\s]+(<DIR>)*[\s]+([\d]*)[\s]+(.*)/);
      if (temp[3]) {
        if (temp[5] != '.' && temp[5] != '..') {
          fs.mkdir(argv['_'][1] + dir + temp[5] + '/', function(err){
            if (err && err.code != 'EEXIST') { console.log(err); }
            getFolder(dir + temp[5] + '/', files, recurr + 1, callbackF);
          });
        } else {
          callbackF();
        }
      } else {
        files.push(dir + temp[5]);
        callbackF();
      }
    }, function (err) {
      if (err) console.error(err.message);
      callbackCF();
    })
  });
}

// console.log(argv);
if (argv['_'].length != 2) {
  console.log('blad parametrow! przyklad: ./*.sh /flash/json /tmp/json');
  return;
}

c.on('ready', function () {
  // console.log('0% Listowanie plików');
  var files = [];
  var fileIter = 0;
  if (argv.get) 
    fs.mkdir(argv['_'][1], function(err){
      getFolder('/', files, 0, function(){
        async.eachSeries(files, function (file, callbackF) {
          fileIter += 1;
          console.log(Math.round(100 * fileIter / files.length) + '% ' + file);
          getFile(file, callbackF);
        }, function (err) {
          if (err) console.error(err.message);
          console.log('OK');
          c.end();
        });
      });
    });
  else if (argv.put) {
    putFolder(argv['_'][1], files, 0, function(){
      async.eachSeries(files, function (file, callbackF) {
        fileIter += 1;
        console.log(Math.round(100 * fileIter / files.length) + '% ' + file);
        putFile(file, callbackF);
      }, function (err) {
        if (err) console.error(err.message);
        console.log('OK');
        c.end();
      });
    });
  } else {
    c.end();
  }
});

c.on('timeout', function () {
  console.log('timeout');
});

c.on('error', function (err) {
  console.log('error', err);
});

argv['h'] = argv['h'] || '192.168.3.30';
argv['u'] = argv['u'] || 'admin';
argv['p'] = argv['p'] || 'admin';

c.connect({
  host: argv['h'],
  user: argv['u'],
  password: argv['p'],
  connTimeout: 2000,
  pasvTimeout: 2000
});
