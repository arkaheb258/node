#!/bin/sh
sudo cpufreq-set -g performance
#echo 'lxde' >> /tmp/my_log_x
echo 'x' > /home/debian/kopex/log/start.log
date >> /home/debian/kopex/log/start.log
#date >> /tmp/my_log_x
export GOOGLE_API_KEY="no"
export GOOGLE_DEFAULT_CLIENT_ID="no"
export GOOGLE_DEFAULT_CLIENT_SECRET="no"
sleep 10
chromium -kiosk -incognito http://127.0.0.1:8888/ --disable-translate &
xdotool mousemove --sync 0 0 &
date >> /home/debian/kopex/log/start.log
#node /home/debian/kopex/node/x_agent.js > /tmp/log_x.txt &

# /sbin/route add -net 0.0.0.0 gw 192.168.3.1 eth0
# cd /home/debian/kopex/
# git reset --hard HEAD
# git pull
# chmod +x /home/debian/kopex/start_x.sh
# chmod +x /home/debian/kopex/start.sh
# chmod +xs /home/debian/kopex/scripts/*
