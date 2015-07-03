#!/bin/sh
if [ -z "$1" ] || [ -z "$2" ]; then
  echo ' brak parametrow! przyklad: ./*.sh /tmp/json /flash/json'
else
  l_dir=$1
  r_dir=$2

  rm $l_dir -r
  mkdir $l_dir
  cd $l_dir

  ncftpls -u admin -p admin ftp://192.168.3.30/$r_dir/* > $l_dir/f_list.txt

  while read p; do
    echo $p
    mkdir $l_dir/$p
    cd $l_dir/$p
    ncftpget -u admin -p admin ftp://192.168.3.30/$r_dir/$p/*
  done < $l_dir/f_list.txt
  
fi