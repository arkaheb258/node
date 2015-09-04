#!/bin/sh
date >> /tmp/start.log
sudo cpufreq-set -g performance
export GOOGLE_API_KEY="no"
export GOOGLE_DEFAULT_CLIENT_ID="no"
export GOOGLE_DEFAULT_CLIENT_SECRET="no"
xdotool mousemove --sync 0 0 &
sleep 10
chromium -kiosk -incognito http://127.0.0.1:8888/ --disable-translate &

# tail -c 40MB syslog > syslog.tmp 2>&1
# mv syslog syslog.x
# mv syslog.tmp syslog
# rm syslog.x

# tail -c 40MB daemon.log > daemon.tmp 2>&1
# mv daemon.log daemon.x
# mv daemon.tmp daemon.log
# rm daemon.x

#node /home/debian/kopex/node/x_agent.js > /tmp/log_x.txt &

#xdotool mousemove --sync 1024 300 &
#rm /home/olimex/.mozilla/firefox/*.default/sessionstore.js
#rm /home/olimex/.mozilla/firefox/*.default/sessionstore.bak
#sleep 5 && iceweasel -fullscreen http://127.0.0.1:8888

#sleep 16 && xdotool mousemove --sync 465 20 click 1 && sleep 1 && xdotool mousemove --sync 0 0 &

#hostname -I
#whoami 
#export DISPLAY=':0'

# ifconfig eth0 192.168.3.51 netmask 255.255.255.0 up
# ip addr add 192.168.3.51 dev eth0
# /etc/init.d/networking restart
# echo "nameserver 8.8.8.8" >> /etc/resolv.conf

# cd /home/debian/kopex/
# git reset --hard HEAD
# git pull
# chmod +x /home/debian/kopex/start_x.sh
# chmod +x /home/debian/kopex/start.sh
