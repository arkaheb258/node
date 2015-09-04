var ftpClient = require('ftp-client'),
    config = {
        host: '192.168.3.30',
        port: 21,
        user: 'admin',
        password: 'admin'
    },
    options = {
        logging: 'basic'
    },
    client = new ftpClient(config, options);
 
client.connect(function () {
    client.upload(['**'], '/flash/test', {
        baseDir: 'test',
        overwrite: 'all'
    }, function (result) {
        console.log(result);
    });
 
    // client.download('/flash/json/', 'test2/', {
        // overwrite: 'all'
    // }, function (result) {
        // console.log(result);
    // });
 
});