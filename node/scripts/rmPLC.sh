#!/bin/sh

# rdir="/flash/json"
# ddir="ktw"

rdir=$1
ddir=$2

ncftp -u admin -p admin 192.168.3.30<<EOF
cd $rdir
ls
rm -rf $ddir
ls
quit
EOF
