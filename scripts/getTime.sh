#!/bin/bash
sys=`uname`
if [[ "$sys" == "Linux" ]]; then
  sudo /usr/bin/node i2cTime.js
  rc=$?;
  exit $rc
  sudo /sbin/hwclock -s -f /dev/rtc1 > /dev/null
  rc=$?; if [ $rc != 0 ]; then 
    echo brak RTC
    exit $rc
  fi
  date +%s
  exit 0;
else
  echo 'System nie obslugiwany'
  exit 1; 
fi
