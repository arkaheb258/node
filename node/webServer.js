/**
 *  @file webServer.js
 *  @brief Serwer HTTP dla wizualizacji
 */
(function () {
  console.log('start webServer.js');
  'use strict';
  require('cache-require-paths');
  var http = require('http');
  var express = require('express');
  var app = express();
  var server = http.Server(app);
  
  var common = require('./common.js');
  var instrID = 0;
  var fs, os, url, jsonFiles, socketIo;

  var argv = require('minimist')(process.argv.slice(2));
  argv.port = argv.port || 8888;
  argv.dir = argv.dir || '../build';
  // argv.debug = 2;

  app.enable("jsonp callback");  

  // Pliki statyczne z folderu /jsonDefault
  app.use('/jsonDefault', function (req, res, next){
    if (!fs) { fs = require('fs'); }
    var file = req.url.match(/\/([a-zA-Z]+)\.json/);
    fs.readFile(__dirname + '/../jsonDefault' + file[0],
      'utf8',
      function (err, text) {
        if (err) { res.json({err:err}); }
        else { res.jsonp(JSON.parse(text)); }
    });
  });
  
  app.use(function (req, res, next) {
    if (argv.debug > 1 || req.url === '/') {
      console.log(req.connection.remoteAddress + ' -> ' + req.url);
    }
    next();
  });

  app.use('/test', express.static(__dirname + '/../test'));
  app.use('/logs', express.static(__dirname + '/../logs'));

  function jsonp_file(req,res,next){
    if (!fs) { fs = require('fs'); }
    // res.jsonp({url:req.baseUrl,file:__dirname + '/..' + req.baseUrl}); return;
    fs.readFile(__dirname + '/..' + req.baseUrl,
      'utf8',
      function (err, text) {
        var json = {error:"parse Error"};
        try {
          json = JSON.parse(text);
        }
        catch(err) {
          json.desc = err+"";
          // console.log(err);
        }
        if (err) { res.json({err:err}); }
        else { res.jsonp(json); }
    });
  }
  
  //obsluga rozkazow dla PLC
  app.get('/rozkaz', function (req, res, next) {
    if (!socketIo) { socketIo = require('socket.io-client')('http://127.0.0.1:' + argv.port); }
    if (!url) { url = require('url'); }
    var get = url.parse(req.url, true).query;
    instrID = (instrID + 1) % 0x10000;
    get.instrID = instrID;
    if (get.rozkaz === 'ustawCzas' && isNaN(get.wartosc)) {
      res.jsonp('NaN');
      return;
    }
    socketIo.emit('rozkaz', get);
    socketIo.once('odpowiedz', function (msg) {
    //TODO: last_get jako zmienna globalna (mechanizm kolejkowania jak w strada)
    // socketIo.once('odpowiedz', function (msg) {
      try {
        if (msg.instrID == get.instrID) { res.jsonp(msg.dane); }
      }
      catch (err) {
        console.log(err);
      }
    });
  });

  // Pliki z parametrami z folderu /json
  app.use('/json', function (req, res, next) {
    // var file = req.url.match(/\/(.*)\.json/); //pętla przekierowań
    if (!fs) { fs = require('fs'); }
    if (!os) { os = require('os'); }
    if (!jsonFiles) { jsonFiles = require('./jsonFiles.js'); }

    var file = req.url.match(/\/([a-zA-Z]+)\.json/);
    // console.log('/json/* match', file, req.url);
    if (!file || file.index) {
      next();
      return;
    }
    if (file[1] === 'hardware') {
      var ip = null;
      var temp = os.networkInterfaces();
      for (var x in temp) {
        for (var y in temp[x]) {
          var temp_adr = temp[x][y].address;
          if (temp_adr.search('192[.]168[.]3[.][0-9]{1,3}') != -1) {
            ip = temp_adr;
          }
          if (ip) break;
        }
        if (ip) break;
      }
      if (!ip) { ip = '192.168.x.x'; }
      fs.readFile(__dirname + '/../json/soft.json',
        'utf8',
        function (err, text) {
          var js = {};
          if (!err) {
            js = JSON.parse(text);
          }
          common.runScript(['git-revision.sh'], function (data) {
            var gitVer = '0.9.x';
            if (data.error === 0) {
              gitVer = data.stdout.replace(/[ \n\r]*/mg, '');
            }
            js.os = process.platform;
            js.verSerwer = gitVer;
            js.ip = ip;
            js.host = os.hostname();
            res.jsonp(js);
          });
        });
      return;
    }
    var gpar = common.getGpar();
    if (!gpar) {
      res.jsonp('Brak połączenia z PLC -> brak parametrów');
      return;
    }

    var fileToRead = '/json';
    var dirLang = common.dirLangPar(gpar, file[1]);
    fileToRead += dirLang.file + '.json';
    switch (file[1]) {
    case 'sygnaly': {
      jsonFiles.czytajPlikSygnalow('/..'+fileToRead, common.getGpar(), function (dane) {
        res.jsonp(dane);
      });
      break;
    }
    case 'parametry': {
      jsonFiles.czytajPlikParametrowWiz('/..'+fileToRead, common.getGpar(), function (dane) {
        res.jsonp(dane);
      });
      break;
    }
    case 'komunikaty': {
      //jezeli jest plik *.EXP to generuje komunikaty z niego,
      //inaczej przekierowuje do odpowiedniego folderu
      fs.readFile(__dirname + '/../json/STR_KOMUNIKATY.EXP',
        'utf8',
        function (err, text) {
          if (err) {
            req.baseUrl = fileToRead;
            jsonp_file(req, res, next);
            // res.redirect(fileToRead);
          } else {
            res.jsonp(jsonFiles.czytajPlikKomunikatow(text, false));
          }
        });
      break;
    }
    case 'diagnostykaBlokow': {
      // przekierowanie do odpowiedniego folderu bez wersji językowych
      req.baseUrl = '/json' + dirLang.dir + '/diagnostykaBlokow.json';
      jsonp_file(req, res, next);
      // res.redirect('/../json' + dirLang.dir + '/diagnostykaBlokow.json');
      break;
    }
    default:
      // next();
      if (fileToRead.search(/\.json/i) > 2) {
        req.baseUrl = fileToRead;
        jsonp_file(req, res, next);
      } else {
        res.redirect(fileToRead);
      }
      /*
      console.log('default');
      fs.readFile(__dirname + '/../json' + file[0],
        'utf8',
        function (err, text) {
          if (err) { res.json({err:err}); }
          else { res.jsonp(JSON.parse(text)); }
      });
      */
      break;
    }
  });

  // app.use('/json', function (req, res, next){
  app.use(/^\/json\/.*\.json/, jsonp_file);

  //tresc statyczna na poczatku routowania
  app.use(express.static(__dirname + '/' + argv.dir));
  
  //wystartowanie serwera
  server.listen(argv.port, function () {
    console.log('HTTP Server listening on', argv.port);
    if (!socketIo) { socketIo = require('socket.io-client')('http://127.0.0.1:' + argv.port); }
    socketIo
      .on('connect', function (dane) {
        console.log('socketIo connect');
        socketIo.emit('nazwa', 'webServer');
      })
    //Broadcast danych i parametrow
    var io = require('socket.io')(server);
    io.on('connection', function (socket) {
      if (!jsonFiles) { jsonFiles = require('./jsonFiles.js'); }
      if (argv.debug) { console.log('Nowy socket: ', socket.conn.id); }
      // Wyslania gpar dla nowo-podlaczonych
      var gpar = common.getGpar();
      if (gpar) { socket.emit('gpar', gpar); } else { io.emit('get_gpar'); }

      socket
        .on('nazwa', function (msg) { console.log('Nazwa: ', socket.conn.id, msg); })
        .on('rozkaz', function (msg) { socket.broadcast.emit('rozkaz', msg); })
        .on('odpowiedz', function (msg) { socket.broadcast.emit('odpowiedz', msg); })
        // .on('dane', function (msg) { socket.broadcast.emit('dane', msg); })
        .on('io_emit', function (msg) { io.emit(msg[0], msg[1]); })
        .on('broadcast', function (msg) { socket.broadcast.emit(msg[0], msg[1]); })
        .on('get_gpar', function (msg) {
          if (argv.debug) { console.log('web on get_gpar', msg); }
          var gpar = common.getGpar();
          if (gpar) {
            socket.emit('gpar', gpar);
          } else {
            socket.broadcast.emit('get_gpar', msg);
            // io.emit('get_gpar', msg);
          }
        })
        .on('gpar', function (gpar) {
          if (argv.debug) { console.log('webServer on gpar'); }
          common.storeGpar(gpar);
          socket.broadcast.emit('gpar', gpar);
        })
        .on('getDefSyg', function () {
          jsonFiles.czytajPlikSygnalow('/' + argv.dir + '/jsonDefault/sygnaly.json', common.getGpar(), function (dane) {
            socket.emit('defSyg', dane);
          });
        })
        .on('getDefPar', function () {
          jsonFiles.czytajPlikParametrowWiz('/' + argv.dir + '/jsonDefault/parametry.json', common.getGpar(), function (dane) {
            socket.emit('defPar', dane);
          });
        })
        .on('getPar', function () {
          var gpar = common.getGpar();
          if (!gpar) { return; }
          var dirLang = common.dirLangPar(gpar, 'parametry');
          jsonFiles.czytajPlikParametrowWiz('/../json' + dirLang.file + '.json', gpar, function (dane) {
            socket.emit('actPar', dane);
          });
        })
        .on('getSyg', function () {
          var gpar = common.getGpar();
          if (!gpar) { return; }
          var dirLang = common.dirLangPar(gpar, 'sygnaly');
          jsonFiles.czytajPlikSygnalow('/../json' + dirLang.file + '.json', gpar, function (dane) {
            socket.emit('actSyg', dane);
          });
        })
        .on('zarzadzaniePlikami', function(msg) {
          console.log('zarzadzaniePlikami', msg);
          var args = [msg + '.sh'];
          if (msg == 'jsonZPLC' || msg == 'jsonNaPLC') {
            args.push('/flash/json');
            args.push('../json');
          }
          common.runScript(args,
            function (data) {
              if (argv.debug) { console.log('data', data); }
              if (data.error !== 0) { socket.emit('zarzadzaniePlikamiOdp', 'error'); }
              // socket.emit('zarzadzaniePlikamiOdp', (data.error !== 0) ? 'error' : 'OK');
            })
          .stdout.on('data', function (chunk) {
            if (argv.debug) { console.log(chunk.toString('utf8')); }
            // var chunk2 = chunk.toString().match(/.*Cmd: MDTM(.*)/g);
            // if (!chunk2) {
              // chunk2 = chunk.toString().match(/.*Cmd: CWD(.*)/g);
            // }
            // if (chunk2) {
              // socket.emit('zarzadzaniePlikamiOdp', chunk2[0].substring(9));
            // }
            socket.emit('zarzadzaniePlikamiOdp', chunk.toString());
          });
        });
    });
  });
}());
