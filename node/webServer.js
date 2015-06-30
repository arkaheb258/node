// webServer.js
(function () {
  'use strict';
  var argv = require('minimist')(process.argv.slice(2));
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var port = argv.port || 8888;
  var socketIo = require('socket.io-client')('http://127.0.0.1:' + port);
  var io = require('socket.io')(server);
  var fs = require('fs');
  var os = require('os');
  var url = require('url');
  var common = require('./common.js');
  var jsonFiles = require('./jsonFiles.js');
  var web_dir = argv.dir || '../build';
  var instrID = 0;

  argv.debug = true;
  
  if (argv.debug) {
    app.use(function (req, res, next) {
      console.log(req.connection.remoteAddress + ' -> ' + req.url);
      next();
    });
  }

  //przekierowanie
  app.get('/', function (req, res) {
    res.redirect('/index.html');
  });

  //test.html
  app.use('/test', express.static(__dirname + '/../test'));

  //tresc statyczna na poczatku routowania
  app.use(express.static(__dirname + '/' + web_dir));

  //mapowanie plikow JSON
  // app.use('/json', json_routes);

  //mapowanie FTP sterownika
  // app.use('/ftp', ftp_routes);

  //obsluga rozkazow dla PLC
  app.get('/rozkaz', function (req, res) {
    var get = url.parse(req.url, true).query;
    instrID = (instrID + 1) % 0x10000;
    get.instrID = instrID;
    switch (get.rozkaz) {
    case 'ustawCzas':
      if (isNaN(get.wartosc)) {
        res.jsonp('NaN');
        return;
      }
      break;
    default:
      break;
    }
    socketIo.emit('rozkaz', get);
    socketIo.on('odpowiedz', function (msg) {
      if (msg.instrID == get.instrID) { res.jsonp(msg.dane); }
    });
  });

  app.get('/json/hardware.json', function (req, res) {
    var data = '0.8.34';
    var ip = '192.168.x.x';
    var err = null;
    if (process.platform === 'linux') {
      // execute('cat /etc/dogtag', console.log);
       // /sbin/ifconfig eth0 | sed '/inet\ /!d;s/.*r://g;s/\ .*//g'
      // fs.readFile('~/kopex/git-revision.sh', 'utf8', function (err,data) {
        // console.log(data);
      if (os.networkInterfaces().eth0 && os.networkInterfaces().eth0[0])
        ip = os.networkInterfaces().eth0[0].address;
      if (err) {
        res.jsonp(({'error': err}));
      }
      // });
    }
    res.jsonp(({os: process.platform, verSerwer: data,
      ip: ip, host: os.hostname(), hw: argv.hw || 'PC'}));
  });

  app.get('/json/*', function (req, res, next) {
    var gpar = common.getGpar();
    var file = req.url.match(/\/([a-z]+)\.json/);
    if (!file) {
      next();
      return;
    } 
    if (!gpar) {
      res.jsonp('Brak połączenia z PLC -> brak parametrów');
      return;
    }
    var fileToRead = file[1];
    var dir = '';
    var sKonfTypKombajnu = gpar.sKonfTypKombajnu.trim().replace(' ', '_').toLowerCase();
    if (sKonfTypKombajnu !== '') {
      dir += sKonfTypKombajnu + '/';
    }
    if (gpar.rKonfWersjaJezykowa !== undefined) {
      fileToRead +=  '_' + gpar.rKonfWersjaJezykowa;
    }
    switch (file[1]) {
    case 'sygnaly':
      fs.readFile(__dirname + '/' + web_dir + '/json/' + dir + fileToRead + '.json',
      'utf8',
      function (err, text) {
        if (err) {
          res.jsonp('sygnaly.json error: ' + web_dir + '/json/' + dir + fileToRead + '.json');
        } else {
          res.jsonp(jsonFiles.czytajPlikSygnalow(text, common.getGpar()));
        }
      });
      break;
    case 'parametry':
      fs.readFile(__dirname + '/' + web_dir + '/json/' + dir + fileToRead + '.json',
        'utf8',
        function (err, text) {
          if (err) {
            res.jsonp('parametry.json error: ' + web_dir + '/json/' + dir + fileToRead + '.json');
          } else {
            res.jsonp(jsonFiles.czytajPlikParametrowWiz(text, common.getGpar()));
          }
        });
      break;
    case 'komunikaty':
      fs.readFile(__dirname + '/' + web_dir + '/json/' + 'STR_KOMUNIKATY.EXP',
      'utf8', 
      function (err, text) {
        if (err) {
          res.redirect('/json/' + dir + fileToRead + '.json');
        } else {
          res.jsonp(jsonFiles.czytajPlikKomunikatow(text, false));
        }
      });
      break;
    default:
      res.redirect('/json/' + dir + fileToRead + '.json');
      break;
    }
  });

  //wystartowanie serwera
  server.listen(port, function () {
    console.log('HTTP Server listening on port ' + port);
  });

  //Broadcast danych i parametrow
  io.on('connection', function (socket) {
    console.log('Nowy socket: ', socket.conn.id);
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
      console.log('web on get_gpar', msg);
      var gpar = common.getGpar();
      if (gpar) { 
        socket.emit('gpar', gpar);
      } else {
        socket.broadcast.emit('get_gpar', msg);
        // io.emit('get_gpar', msg);
      }
    })
    .on('gpar', function (gpar) {
      console.log('webServer on gpar');
      common.storeGpar(gpar);
      socket.broadcast.emit('gpar', gpar);
    });
  });
}());
