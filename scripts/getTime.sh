#!/bin/bash
sys=`uname`
if [[ "$sys" == "Linux" ]]; then
  hwclock -s -f /dev/rtc1 > /dev/null
  rc=$?; if [ $rc != 0 ]; then 
    echo brak RTC
    exit $rc; 
  fi
  date +%s
else
  echo 'System nie obslugiwany'
  exit 1; 
fi
