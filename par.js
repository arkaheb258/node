// par.js
(function () {
    "use strict";
    var dir = __dirname;
    module.exports = {
		PLC_IP : '192.168.3.30',
		STRADA_PORT : 20021,
		STRADA_INTERVAL_MS : 200,
		WEB_PORT : 8888,
		WEB_DIR : dir + "/build",
		// WEB_PROXY : {host: '127.0.0.1', port: 80, path: '/dane.php' },
		WEB_PAR_FTP : true, //false,//true,
		WEB_SYGN_FTP : false,//true,//false,
		WEB_KOM_FTP : true,
		WEB_REFRESH : 10000,
		// GIVE_TIME : false,
		// FTP_CACHE_DIR : __dirname + "/ftp",
		NODE_MAIN : dir + "/node/main.js",
		NODE_DIAGN_PORT : 8889,
		LOG_DIR : dir + "/log",
		// LOGGER_DIR : "USB",
		LOGGER_DIR : "D:/Rejestracja",
		PARAM_LOC_FILE : dir + "/default.json",
		// NTP_HWCLOCK : true,
		// NTP_IPs : ["192.168.3.51", "ntp1.tp.pl"],		//tablica priorytetowa z serwerami czasu
		WER_NODE	: "1.10.12",
		ADM_WEB_DIR : dir + "/adm"
	};
}());

