#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
  echo 'brak parametrow! przyklad: ./*.sh /flash/json /tmp/json' >&2
  echo 'nazwa_skryptu.sh folder_plc folder_lokalny' >&2
  exit 1
else
  r_dir=$1
  l_dir=$2
  node ftp.js $r_dir $l_dir --put
  exit 0
  #ncftpput -R -v -u "admin" -p "admin" -S .tmp 192.168.3.30 $r_dir $l_dir/*
fi
