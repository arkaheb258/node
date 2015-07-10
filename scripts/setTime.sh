#!/bin/sh
if [ -z "$1" ] || [ -z "$2" ]; then
  echo 'brak parametrow! przyklad: ./*.sh 2015-07-08 09:15:16' >&2
  echo 'nazwa_skryptu.sh data czas' >&2
  exit 1
else
  #pierwszy parametr data
  #drugi parametr czas
  sDate=$1
  sTime=$2
  # echo $sDate
  # echo $sTime
  date -u --set $sDate && date -u --set $sTime
  hwclock -w
  hwclock -w -f /dev/rtc1
fi
