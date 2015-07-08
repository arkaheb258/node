/**
 *  @file webServer.js
 *  @brief Brief
 */
(function () {
  'use strict';
  var argv = require('minimist')(process.argv.slice(2));
  var port = argv.port || 8888;
  var http = require('http');
  var express = require('express');
  // var connect = require('connect');
  // var serveStatic = require('serve-static')
  // var app = connect();
  // var server = http.createServer(app);
  var app = express();
  var server = http.Server(app);
  var socketIo = require('socket.io-client')('http://127.0.0.1:' + port);
  var io = require('socket.io')(server);
  var fs = require('fs');
  var os = require('os');
  var url = require('url');
  var common = require('./common.js');
  var jsonFiles = require('./jsonFiles.js');
  var instrID = 0;

  // argv.debug = true;

  if (argv.debug) {
    app.use(function (req, res, next) {
      console.log(req.connection.remoteAddress + ' -> ' + req.url);
      next();
    });
  }

  //przekierowanie
  // app.get('/', function (req, res) {
    // res.redirect('/index.html');
  // });

  //test.html
  app.use('/test', express.static(__dirname + '/../test'));

  //tresc statyczna na poczatku routowania
  app.use(express.static(__dirname + '/' + (argv.dir || '../build')));
  
  //mapowanie FTP sterownika
  // app.use('/ftp', ftp_routes);

  //obsluga rozkazow dla PLC
  app.get('/rozkaz', function (req, res, next) {
    var get = url.parse(req.url, true).query;
    instrID = (instrID + 1) % 0x10000;
    get.instrID = instrID;
    if (get.rozkaz === 'ustawCzas' && isNaN(get.wartosc)) {
      res.jsonp('NaN');
      return;
    }
    socketIo.emit('rozkaz', get);
    socketIo.on('odpowiedz', function (msg) {
    //TODO: last_get jako zmienna globalna (mechanizm kolejkowania jak w strada)
    // socketIo.once('odpowiedz', function (msg) {
      if (msg.instrID == get.instrID) { res.jsonp(msg.dane); }
    });
  });

  // Pliki z parametrami z folderu /json
  app.use('/json', function (req, res, next) {
    // var file = req.url.match(/\/(.*)\.json/); //pętla przekierowań
    var file = req.url.match(/\/([a-zA-Z]+)\.json/);
    // console.log('/json/* match', file, req.url);
    if (!file || file.index) {
      next();
      return;
    }
    if (file[1] == 'hardware') {
      var ip = '192.168.x.x';
      if (process.platform === 'linux') {
        // execute('cat /etc/dogtag', console.log);
         // /sbin/ifconfig eth0 | sed '/inet\ /!d;s/.*r://g;s/\ .*//g'
        // fs.readFile('~/kopex/git-revision.sh', 'utf8', function (err,gitVer) {
          // console.log(gitVer);
        if (os.networkInterfaces().eth0 && os.networkInterfaces().eth0[0]) {
          ip = os.networkInterfaces().eth0[0].address;
        }
      }
      fs.readFile(__dirname + '/../json/soft.json',
        'utf8',
        function (err, text) {
          var js = {};
          if (!err) {
            js = JSON.parse(text);
          }
          common.runScript('git-revision', null, function (gitVer) {
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
    var fileToRead = '/../json';
    var sKonfTypKombajnu = gpar.sKonfTypKombajnu.trim().replace(' ', '_').toLowerCase();
    if (sKonfTypKombajnu !== '') {
      fileToRead += '/' + sKonfTypKombajnu;
    }
    fileToRead += '/' + file[1];
    if (gpar.rKonfWersjaJezykowa !== undefined) {
      fileToRead +=  '_' + gpar.rKonfWersjaJezykowa;
    }
    fileToRead += '.json';
    switch (file[1]) {
      case 'sygnaly': {
        jsonFiles.czytajPlikSygnalow(fileToRead, common.getGpar(), function(dane){
          res.jsonp(dane);
        });
        break;
      }
      case 'parametry': {
        jsonFiles.czytajPlikParametrowWiz(fileToRead, common.getGpar(), function(dane){
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
              res.redirect(fileToRead);
            } else {
              res.jsonp(jsonFiles.czytajPlikKomunikatow(text, false));
            }
          });
        break;
      }
      case 'diagnostykaBlokow': {
        //przekierowanie do odpowiedniego folderu bez wersji językowych
        res.redirect('/../json/' + sKonfTypKombajnu + '/diagnostykaBlokow.json');
        break;
      }
      default:
        res.redirect(fileToRead);
        break;
    }
  });

  // Pliki statyczne z folderu /json
  app.use('/json', express.static(__dirname + '/../json'));
  
  //wystartowanie serwera
  server.listen(port, function () {
    console.log('HTTP Server listening on port ' + port);
  });

  //Broadcast danych i parametrow
  io.on('connection', function (socket) {
    if (argv.debug) { console.log('Nowy socket: ', socket.conn.id); }
    //dane do wyslania dla nowo-podlaczonych
    // socket.emit('dane', {error: 'Dane nie gotowe - oczekiwanie na PLC'});
    var gpar = common.getGpar();
    if (gpar) { socket.emit('gpar', gpar); } else { io.emit('get_gpar'); }

    socket
    // .on('strada', function (msg) { console.log('strada: ' + msg); })
      .on('rozkaz', function (msg) { socket.broadcast.emit('rozkaz', msg); })
      .on('odpowiedz', function (msg) { socket.broadcast.emit('odpowiedz', msg); })
      .on('dane', function (msg) { socket.broadcast.emit('dane', msg); })
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
      .on('getDefSyg', function(msg) {
        jsonFiles.czytajPlikSygnalow(__dirname + '/' + (argv.dir || '../build') + '/default/sygnaly.json', common.getGpar(), function(dane){
          socket.emit('defSyg', dane);
        });
      })
      .on('getDefPar', function(msg) {
        jsonFiles.czytajPlikParametrowWiz(__dirname + '/' + (argv.dir || '../build') + '/default/parametry.json', common.getGpar(), function(dane){
          socket.emit('defPar', dane);
        });
      });
  });
}());
