#!/bin/sh
hwclock -r -f /dev/rtc1 > /dev/null
rc=$?; if [ $rc != 0 ]; then 
  echo brak RTC
  exit $rc; 
fi
date +%s