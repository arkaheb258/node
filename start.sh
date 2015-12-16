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

echo ds1307 0x68>/sys/class/i2c-adapter/i2c-1/new_device
sudo hwclock -s -f /dev/rtc1
sudo hwclock -w

sudo chmod +xs /home/debian/kopex/scripts/*

/home/debian/kopex/scripts/restart_network.sh 10 &
#ifconfig eth0 192.168.3.51 netmask 255.255.255.0 up
#/sbin/route add -net 0.0.0.0 gw 192.168.3.1 eth0

cd /home/debian/kopex/
node node/forever.js node/webServer.js &
node node/forever.js node/strada.js &
node node/forever.js node/zapisDoPliku.js &
