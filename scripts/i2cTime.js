var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;

function decToBcd(val) { return( (val-val%10)/10*16 + (val%10) ); }
function bcdToDec(val) {val='0x'+val; return( (val&0xf0)/16*10 + (val&0x0f) ); }
function bcdToDec2(val) { return( (val&0xf0)/16*10 + (val&0x0f) ); }

if (argv['_'].length) {
  var d = new Date(Date.parse(argv['_'].join(' ')+' GMT'));
  var arr = [];
  arr.push( '0x' + d.getUTCSeconds());
  arr.push( '0x' + d.getUTCMinutes());
  arr.push( '0x' + d.getUTCHours());
  arr.push( '0x' + d.getUTCDay());
  arr.push( '0x' + d.getUTCDate());
  arr.push( '0x' + (d.getUTCMonth()+1));
  arr.push( '0x' + (d.getUTCFullYear()%100));
  console.log(d);
  // console.log('i2cset -y 1 0x68 0 ' + arr.join(' ') + ' i');
  exec('i2cset -f -y 1 0x68 0 ' + arr.join(' ') + ' i', function (error, stdout, stderr) {
    console.log(error, stdout, stderr);
  });
} else {
  exec('i2cdump -f -y 1 0x68 | grep "00:"', function (error, stdout, stderr) {
    var arr = stdout.split(' ');
    // arr = [ '00:', '45', '23', '12', '01', '02', '03', '15', 'b3' ];
    // console.log(arr);
    if (error || !arr[1] || arr[1] == 'XX') { process.exit(1); }
    var d = new Date();
    d.setUTCFullYear(2000 + bcdToDec(arr[7]));
    d.setUTCMonth(bcdToDec(arr[6] - 1));
    d.setUTCDate(bcdToDec(arr[5]));
    d.setUTCHours(bcdToDec(arr[3] & 0x3f));
    d.setUTCMinutes(bcdToDec(arr[2]));
    d.setUTCSeconds(bcdToDec(arr[1] & 0x7f));
    d.setUTCMilliseconds(0);
    // console.log(d);
    console.log(d.getTime()/1000);
  });
}
