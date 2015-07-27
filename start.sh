#!/bin/sh
### BEGIN INIT INFO
# Provides:          kopex_web_server
# Required-Start:    $local_fs $network
# Required-Stop:     $local_fs
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Serwer dla wizualizacji
# Description:       Serwer dla wizualizacji node.js 
### END INIT INFO

chmod +xs /home/debian/kopex/scripts/*
cd /home/debian/kopex/
#nice -n10 node node/forever.js node/webServer.js --dir=../source &
node node/forever.js node/webServer.js &
node node/forever.js node/strada.js &
node node/forever.js node/zapisDoPliku.js &

# date >> /tmp/my_log_w
# cd /home/debian/kopex/
# npm run web &
# pwd >> /tmp/my_log_w
# hwclock -f /dev/rtc1 >> /tmp/my_log_w

#echo ds1307 0x68>/sys/class/i2c-adapter/i2c-1/new_device
#hwclock -s -f /dev/rtc1
#hwclock -w
