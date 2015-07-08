#!/bin/sh
if [ -z "$1" ] || [ -z "$2" ]; then
  echo 'brak parametrow! przyklad: ./*.sh /flash/json /tmp/json' >&2
  echo 'nazwa_skryptu.sh folder_plc folder_lokalny' >&2
  exit 1
else
  r_dir=$1
  l_dir=$2

  # rm $l_dir -r
  mkdir $l_dir
  cd $l_dir

  ncftpls -u admin -p admin ftp://192.168.3.30/$r_dir/* > $l_dir/f_list.txt

  while read p; do
    echo $p
    rm $l_dir/$p -r
    mkdir $l_dir/$p
    cd $l_dir/$p
    ncftpget -u admin -p admin ftp://192.168.3.30/$r_dir/$p/*
    cd ..
  done < $l_dir/f_list.txt
  rm $l_dir/f_list.txt
fi
