#!/bin/sh

dir="/tmp/json"

rm $dir -r
mkdir $dir
cd $dir

ncftpls -u admin -p admin ftp://192.168.3.30/flash/json/* > $dir/list

while read p; do
  echo $p
  mkdir $dir/$p
  cd $dir/$p
  ncftpget -u admin -p admin ftp://192.168.3.30/flash/json/$p/*
done < $dir/list
