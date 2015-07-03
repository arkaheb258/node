#!/bin/sh
if [ -z "$1" ] || [ -z "$2" ]; then
  echo ' brak parametrow! przyklad: ./*.sh /flash/json /tmp/json/*'
else
  ncftpput -R -v -u "admin" -p "admin" 192.168.3.30 $1 $2
fi
