#!/bin/sh
#exec 2>>/dev/null
#dir="`fdisk -l | grep ^/dev/sd`"
dir="`blkid -c /dev/null | grep sda`"
#dir=`expr match "$dir" '\(.*\)\*'`
#echo "$dir"
dir=`expr match "$dir" '\(.*\)\:'`
mkdir /mnt/USB
mount $dir /mnt/USB/
rc=$?
if [[ "$dir" != "" ]]; then
  echo "/mnt/USB<"
#  echo "$dir<"
else
  exit $rc
fi

#echo "/mnt/USB<"
#echo $?