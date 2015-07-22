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

node node/forever.js node/webServer.js --dir=../source &
node node/forever.js node/strada.js &
node node/forever.js node/zapisDoPliku.js &
# date >> /tmp/my_log_w
# cd /home/debian/kopex/
# npm run web &
# pwd >> /tmp/my_log_w
# hwclock -f /dev/rtc1 >> /tmp/my_log_w

#node /home/debian/kopex/node/webServer.js >> /tmp/my_log_w &

#echo ds1307 0x68>/sys/class/i2c-adapter/i2c-1/new_device
#hwclock -s -f /dev/rtc1
#hwclock -w
#node /home/olimex/kopex/tcp_cl3.js &

#xdotool mousemove --sync 1024 300 &
#rm /home/olimex/.mozilla/firefox/*.default/sessionstore.js
#rm /home/olimex/.mozilla/firefox/*.default/sessionstore.bak
#sleep 5 && iceweasel -fullscreen http://127.0.0.1:8888

#cpufreq-set -g performance
#export GOOGLE_API_KEY="no"
#export GOOGLE_DEFAULT_CLIENT_ID="no"
#export GOOGLE_DEFAULT_CLIENT_SECRET="no"
#chromium -kiosk -incognito http://127.0.0.1:8888/min/ --disable-translate &

#sleep 16 && xdotool mousemove --sync 465 20 click 1 && sleep 1 && xdotool mousemove --sync 0 0 &

#hostname -I
#whoami 
#export DISPLAY=':0'
