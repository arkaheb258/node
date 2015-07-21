#!/bin/sh
exec 2>>/dev/null
dir="`fdisk -l | grep ^/dev/sd`"
#echo "$tekst"
dir=`expr match "$dir" '\(.*\)\*'`
echo "$dir<"
#echo $?