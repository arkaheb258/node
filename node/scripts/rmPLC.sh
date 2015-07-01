#!/bin/sh
if [ -z "$1" ] || [ -z "$2" ]; then
  echo ' brak parametrow! przyklad: ./*.sh /flash/json ktw'
else
  rdir=$1
  ddir=$2

  ncftp -u admin -p admin 192.168.3.30<<EOF
  cd $rdir
  ls
  rm -rf $ddir
  ls
  quit
  EOF
  
fi
