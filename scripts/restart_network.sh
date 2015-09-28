#!/bin/bash
#echo $1
while true
do
	ip=`ifconfig eth0 | grep inet | grep -v inet6 | grep 192.168.3.51`
	#echo $ip
	if [[ "$ip" == "" ]]; then
		echo "Restartowanie sieci"
		/etc/init.d/networking restart
		echo "Nadanie IP"
		ifconfig eth0 192.168.3.51 netmask 255.255.255.0 up
		echo "route"
		/sbin/route add -net 0.0.0.0 gw 192.168.3.1 eth0
		echo "OK"
#	else
#		echo "OK"
	fi
	if [[  "$1" > 0 ]]; then
    	sleep $1
    else
    	break
	fi
done

#*/1 * * * * /home/debian/kopex/scripts/restart_network.sh  
