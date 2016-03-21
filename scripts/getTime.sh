#!/bin/sh
sudo /usr/bin/node i2cTime.js
rc=$?;
exit $rc
sudo /sbin/hwclock -s -f /dev/rtc1 > /dev/null
rc=$?; if [ $rc != 0 ]; then 
  sudo /sbin/hwclock -s -f /dev/rtc0 > /dev/null
  rc=$?; if [ $rc != 0 ]; then 
    echo brak RTC
    exit $rc
  fi
fi
date +%s
exit 0;
