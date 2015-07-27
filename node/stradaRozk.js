/**
*  @file stradaRozk.js
*  @brief Obsługa rozkazów z socket.io
*/
'use strict';
var common = require('./common.js');
var BlockRW = require('./blockrw.js');
var decode = require('./decode.js');
module.exports = function (strada) {

  function emitSIN(dane, msg, ok) {
    if (!ok) {ok = 'OK'; }
    if ((dane.error === 0) || (dane.error === null) || (dane.error === undefined)) {
      msg.dane = ok;
    } else if (dane.dane) {
      if (dane.error < 0) {
        msg.dane = dane.dane.toString('utf8');
      } else {
        msg.dane = dane.dane;
      }
    } else if (dane.error) {
      msg.dane = dane.error;
    } else {
      msg.dane = 'Error Node SIN';
    }
    strada.socket.emit('odpowiedz', msg);
  }

  strada.socket.on('rozkaz', function (get) {
    console.log('on rozkaz', get);
    if (strada.master) { console.log(strada.master.connected2); }
    if (strada.master && strada.master.connected2) {
      strada.master.emit('rozkaz', get);
      strada.master.once('odpowiedz', function(msg){
          console.log('master on odpowiedz', msg);
          strada.socket.emit('odpowiedz', msg);
      });
      return;
    }
    var msg = {};
    msg.instrID = get.instrID;
    
    switch (get.rozkaz) {
      case 'podajHistorie': {
        strada.readAll(0x308, [0, 0], function (dane) {
          // console.log(dane);
          msg.dane = decode.decodeStrada308(dane.dane);
          strada.socket.emit('odpowiedz', msg);
        });
        break;
      }
      case 'ustawCzas': {
        var off = common.summerTimeOffset(get.wartosc);
        var temp = get.wartosc / 1000;
        var dataa = new Date();
        //konwersja czas lokalny -> UTC
        // var d = new Date(temp * 1000);
        // var n = d.getTimezoneOffset();

        // d.setMonth(0);
        // n -= d.getTimezoneOffset();
        var gpar = common.getGpar();
        if (gpar) {
          if (gpar.rKonfCzasStrefa !== undefined) {
            temp -= (gpar.rKonfCzasStrefa - 12) * 3600;
          }
          // if (gpar.rKonfCzasLetni) { temp += n * 60; }
          if (gpar.rKonfCzasLetni) { temp += off * 60; }
        }
        if (temp < 0) {
          msg.dane = 'NaN';
          strada.socket.emit('odpowiedz', msg);
        } else {
          dataa.setTime(temp * 1000);
          console.log('Ustawienie nowego czasu: ', dataa);
          var str = dataa.toISOString().split('T');
          //TODO: obsluga bledow skryptu
          common.runScript(['setTime.sh', str[0], str[1].substring(0, 8)], function () {});
          strada.stradaEnqueue(0x201, temp, function (dane) {
            console.log('dane 201', dane);
            if (!dane.error) {
              msg.dane = 'OK';
              strada.socket.emit('odpowiedz', msg);
            }
          });
        }
        break;
      }
      case 'ustawBlokade': {
        if (get.dostep === 'User') {
          get.dostep = 'Usr';
        }
        var blok = 'Block' + get.dostep;
        var tempBlock = strada.dane[blok];
        if (!tempBlock || !tempBlock.length) {
          console.log('ustawBlokade error');
          msg.dane = 'Brak danych z PLC';
          strada.socket.emit('odpowiedz', msg);
          return;
        }
        temp = {};
        if (get.wartosc === '666' && get.dostep === 'Adv') {
          temp['BlockUsr'] = Array.apply(null, new Array(strada.dane['BlockUsr'].length)).map(Number.prototype.valueOf,0);
          temp['BlockSrvc'] = Array.apply(null, new Array(strada.dane['BlockSrvc'].length)).map(Number.prototype.valueOf,0);
          temp['BlockAdv'] = Array.apply(null, new Array(strada.dane['BlockAdv'].length)).map(Number.prototype.valueOf,0);
        } else if (get.wartosc === '1') {
          tempBlock[parseInt(get.slowo, 10)] |= 1 << get.bit;
          temp[blok] = tempBlock;
        } else if (get.wartosc === '0') {
          tempBlock[parseInt(get.slowo, 10)] &= ~(1 << get.bit);
          temp[blok] = tempBlock;
        } else {
          console.log('Block error', get.wartosc, get.dostep);
          msg.dane = 'Nieprawidłowa wartość';
          strada.socket.emit('odpowiedz', msg);
          return;
        }
        strada.stradaEnqueue(0x202, decode.encodeStrada202(temp), function (dane) {
          console.log('dane 202');
          console.log(dane);
          emitSIN(dane, msg, 'BLOK_OK');
        });
        break;
      }
      case 'ustawParametr': {
        var typ = 'STRING';
        if (get.typ === 'pCzas') {
          typ = 'TIME'; //wartosc w sekundach
        } else if (get.typ === 'pLiczba') {
          typ = 'REAL';
        } else if (get.typ === 'pLista') {
          // Błąd w dokumentacji Strada do wersji (1.2.2 włącznie)
          // typ = 'LISTA';
          typ = 'REAL';
        }
        strada.stradaEnqueue(0x500, {NAZ: get.id, TYP: typ, WART: get.wartosc},
          function (dane) {
            console.log('dane 500');
            console.log(dane);
            emitSIN(dane, msg, 'PAR_OK');
            if (!dane.error) {
              strada.odswierzParametry(true);
            }
          }, 10000);
        break;
      }
      case 'ustawPlik': {
        var plik = 0;
        var kierunek = 0;
        switch (get.plik) {
          case 'default':
            plik = 1;
            break;
          case 'user1':
            plik = 2;
            break;
          case 'user2':
            plik = 3;
            break;
          case 'user3':
            plik = 4;
            break;
          case 'user4':
            plik = 5;
            break;
          case 'user5':
            plik = 6;
            break;
        }
        if (get.akcja === 'load') {
          kierunek = 1;
        } else if (get.akcja === 'save') {
          kierunek = 2;
        }
        strada.stradaEnqueue(0x502, [plik, kierunek], function (dane) {
          console.log('dane 502');
          console.log(dane);
          emitSIN(dane, msg);
          // if (!dane.error) {
            // strada.odswierzParametry(true);
          // }
        });
        break;
      }
      case 'kalibracja': {
        console.log('kalibracja 2');
        console.log(get.napedId);
        console.log(get.pozycja * 100);
        strada.stradaEnqueue(0x701, [parseInt(get.napedId, 10), parseFloat(get.pozycja) * 100],
          function (dane) {
            console.log('dane 701');
            console.log(dane);
            // console.log(typeof dane.dane);
            // console.log(dane.dane.toString('utf8'));
            emitSIN(dane, msg);
          }, 10000);
        console.log('kalibracja end');
        break;
      }
      case 'liczniki': {
        console.log('liczniki');
        console.log(get.rozkazId);
        console.log(get.wartosc);
        strada.stradaEnqueue(0x702, [parseInt(get.rozkazId, 10), parseFloat(get.wartosc)],
          function (dane) {
            console.log('dane 702');
            console.log(dane);
            emitSIN(dane, msg);
          });
        console.log('liczniki end');
        break;
      }
      case 'statusWeWyBloku_310': {
        console.log(get.rozkaz);
        console.log(get.wartosc);
        // console.log(get.wID);
        console.log(get.sID);
        if (!get.sID) {
          msg.dane = 'Brak parametru sID';
          strada.socket.emit('odpowiedz', msg);
        } else {
          if (!get.wartosc || get.wartosc < 200) {
            msg.dane = 'Błąd parametru "wartosc"';
            strada.socket.emit('odpowiedz', msg);
            return;
          }
          if (strada.daneDiagn && strada.daneDiagn.sID == get.sID) {
            strada.daneDiagn.lastReq = Date.now();
          } else {
            strada.daneDiagn = {sID: get.sID, interval: get.wartosc, lastReq: Date.now()};
            setInterval(function () {
              if (Date.now() - strada.daneDiagn.lastReq > 3000) {
                console.log('interval ', strada.daneDiagn.sID, ' timeout');
                strada.daneDiagn = null;
                clearInterval(this);
              } else {
                // console.log(strada.daneDiagn);
                strada.readAll(0x310, [0, strada.daneDiagn.sID],
                  function (dane) {
                    // console.log('dane 310');
                    if (!dane.length) {
                      strada.socket.emit('broadcast', ['daneDiag', {error : dane.dane}]);
                      console.log('dane 310 ', dane);
                      return;
                    }
                    var br = new BlockRW();
                    var DigitData = br.read(dane);
                    var AnalogData = br.read(dane);
                    // console.log({DigitData: DigitData, AnalogData: AnalogData});
                    strada.socket.emit('broadcast', ['daneDiag', {sID: get.sID, DigitData: DigitData, AnalogData: AnalogData}]);
                  });
              }
            }, get.wartosc);
            msg.dane = 'OK';
            strada.socket.emit('odpowiedz', msg);
          }
        }
        // msg.dane = 'Nieznany rozkaz';
        // strada.socket.emit('odpowiedz', msg);
        break;
      }
      case 'eks_520': {
        console.log(get.rozkaz);
        // identyfikator rozkazu (np 2001 dla prac miesięcznych)
        console.log(get.wActivID);
        strada.stradaEnqueue(0x520, [parseInt(get.wActivID, 10)],
          function (dane) {
            console.log('dane 520');
            console.log(dane);
            emitSIN(dane, msg, 'EKS_OK');
          });
        break;
      }
      case 'trybSerwisowy': {
        console.log(get.rozkaz);
        console.log(get.aktywuj);
        console.log(get.wTrybCiagnikowId);
        msg.dane = 'Nieznany rozkaz';
        strada.socket.emit('odpowiedz', msg);
        break;
      }
      case 'miejsceSterPosuw_207':
      case 'trybPracyPosuw_208':
      case 'trybPracyCiagniki_209':
      case 'calkDystKomb_20C':
      case 'kanalSSRK_216':
      case 'typSkrawu_21B':
      case 'fazaSkrawu_21C':
      case 'autoFazaSkrawu_21D':
      case 'zewnSystSter_221':
      case 'trybHydr_222':
      case 'daneWizDodatkowe_31A':
      case 'testHamulca_401':
      case 'podajNazwyPlikow_601':
      case 'podajNazwePliku_603': {
        console.log(get.rozkaz);
        console.log(get.wWartosc);
        strada.stradaEnqueue(parseInt(get.rozkaz.split('_')[1], 16), [parseInt(get.wWartosc, 10), 0], function (dane) {
          console.log(dane);
          emitSIN(dane, msg);
        });
        break;
      }
      case 'nrSekcji_204':
      case 'czasPracy_20A':
      case 'czasJazdy_20B':
      case 'sterReflektorami_402':
      case 'kalibracjeEnk_404': {
        console.log(get.rozkaz);
        console.log(get.wWartosc);
        console.log(get.wID);
        strada.stradaEnqueue(parseInt(get.rozkaz.split('_')[1], 16), [parseFloat(get.wWartosc), parseInt(get.wID, 10)],
          function (dane) {
            console.log(dane);
            emitSIN(dane, msg);
          });
        break;
      }
      case 'plikSkrawuWz_600':
      case 'skasujPlik_604':
      case 'nowyPlik_606': {
        console.log(get.rozkaz);
        console.log(get.sWartosc);
        strada.stradaEnqueue(parseInt(get.rozkaz.split('_')[1], 16), get.sWartosc,
          function (dane) {
            console.log(dane);
            emitSIN(dane, msg);
          });
        break;
      }
      case 'zerujLicznikiDzien_403':
      case 'skasujAktywnyPlik_602': {
        console.log(get.rozkaz);
        strada.stradaEnqueue(parseInt(get.rozkaz.split('_')[1], 16), null,
          function (dane) {
            console.log(dane);
            emitSIN(dane, msg);
          });
        break;
      }
      case 'zmienNazwePliku_605': {
        console.log(get.rozkaz);
        console.log(get.sNazwaPlikuOld);
        console.log(get.sNazwaPlikuNew);
        strada.stradaEnqueue(parseInt(get.rozkaz.split('_')[1], 16), [get.sNazwaPlikuOld, get.sNazwaPlikuNew],
          function (dane) {
            console.log(dane);
            emitSIN(dane, msg);
          });
        break;
      }
      default: {
        msg.dane = 'Nieznany rozkaz';
        strada.socket.emit('odpowiedz', msg);
        break;
      }
    }
  });
};
