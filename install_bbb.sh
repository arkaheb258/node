#!/bin/sh

apt-get update
apt-get -y install xdotool
apt-get -y install unclutter
apt-get -y --force-yes upgrade

#strefa czasowa
echo "Europe/Warsaw" > /etc/timezone 
dpkg-reconfigure -f noninteractive tzdata

# pobranie serwera i wizualizacji
# mkdir /home/debian/kopex
cd /home/debian
git clone git://github.com/arkaheb258/node.git kopex
#git clone -b wydawka_borynia git://github.com/arkaheb258/node.git node
#git clone http://192.168.30.12:81/Bonobo.Git.Server/wizu.git build

cd /home/debian/kopex
npm install

# autostart node
chmod +x /home/debian/kopex/start_x.sh
echo "/home/debian/kopex/start_x.sh" > /etc/xdg/lxsession/LXDE/autostart 
ln -s /home/debian/kopex/start.sh /etc/init.d/kopex
chmod +x /home/debian/kopex/start.sh
update-rc.d kopex defaults

# prawa zapisu do folderu kopex dla wszystkich
chmod -R a+w /home/debian/kopex

ln -s /home/debian /var/lib/cloud9/debian_home

#wylaczenie niepotrzebnych uslug
systemctl disable bonescript.service
systemctl disable bonescript.socket
systemctl disable bonescript-autorun.service

#local network discovery
systemctl disable avahi-daemon.service

update-rc.d apache2 disable
update-rc.d udhcpd disable

#restart
#shutdown -r now

#pobranie aktualnego czasu i zapisanie do RTC
ntpdate -b -s -u pl.pool.ntp.org
hwclock -w -f /dev/rtc1

exit 0

#RTC DS1307 jako usluga 
mkdir /usr/share/rtc_ds1307
echo 'echo ds1307 0x68>/sys/class/i2c-adapter/i2c-1/new_device' > /usr/share/rtc_ds1307/clock_init.sh
echo 'hwclock -s -f /dev/rtc1' >> /usr/share/rtc_ds1307/clock_init.sh
echo 'hwclock -w' >> /usr/share/rtc_ds1307/clock_init.sh

echo '[Unit]' > /lib/systemd/system/rtc-ds1307.service
echo 'Description=DS1307 RTC Service' >> /lib/systemd/system/rtc-ds1307.service
echo '[Service]' >> /lib/systemd/system/rtc-ds1307.service
echo 'Type=simple' >> /lib/systemd/system/rtc-ds1307.service
echo 'WorkingDirectory=/usr/share/rtc_ds1307' >> /lib/systemd/system/rtc-ds1307.service
echo 'ExecStart=/bin/bash clock_init.sh' >> /lib/systemd/system/rtc-ds1307.service
echo 'SyslogIdentifier=rtc_ds1307' >> /lib/systemd/system/rtc-ds1307.service
echo '[Install]' >> /lib/systemd/system/rtc-ds1307.service
echo 'WantedBy=multi-user.target' >> /lib/systemd/system/rtc-ds1307.service

systemctl enable rtc-ds1307.service






#apt-get install ncftp 

# statyczne IP 192.168.3.51
echo "allow-hotplug eth0" >> /etc/network/interfaces
echo "auto eth0" >> /etc/network/interfaces
echo "iface eth0 inet static" >> /etc/network/interfaces
echo "address 192.168.3.51" >> /etc/network/interfaces
echo "netmask 255.255.255.0" >> /etc/network/interfaces
#echo "network 192.168.3.0" >> /etc/network/interfaces
#echo "broadcast 192.168.3.255" >> /etc/network/interfaces
#echo "gateway 192.169.3.1" >> /etc/network/interfaces
echo "dns-nameservers 192.169.3.1 8.8.8.8" >> /etc/network/interfaces

#echo "nameserver 8.8.8.8" >> /etc/resolv.conf
#netstat -nr

#!!! naprawa "unknown host"
#/sbin/route add -net 0.0.0.0 gw 192.168.3.1 eth0





# autostart node
#http://raspberrypi.stackexchange.com/questions/8734/execute-script-on-start-up





# update Bootloader + Kernel
cd /opt/scripts/tools
git pull
/opt/scripts/tools/developers/update_bootloader.sh 
/opt/scripts/tools/update_kernel.sh
shutdown -r now



#ustawienie tapety
su debian
export DISPLAY=:0
pcmanfm --set-wallpaper=test.png

#wylaczenie niepotrzebnych uslug
#http://kacangbawang.com/beagleboneblack-revc-debloat-part-1/
#http://www.element14.com/community/community/designcenter/single-board-computers/next-gen_beaglebone/blog/2013/11/20/beaglebone-web-server--setup
#systemctl disable cloud9.service
systemctl disable gateone.service
systemctl disable bonescript.service
systemctl disable bonescript.socket
systemctl disable bonescript-autorun.service
#local network discovery
systemctl disable avahi-daemon.service
systemctl disable gdm.service
#music player
systemctl disable mpd.service
update-rc.d apache2 disable
update-rc.d udhcpd disable

#!!! zapis do eMMC !!!
#/boot/uEnv.txt
#cmdline=init=/opt/scripts/tools/eMMC/init-eMMC-flasher-v3.sh



nano /etc/xdg/lxsession/LXDE/autostart 
@lxpanel --profile LXDE
@pcmanfm --desktop --profile LXDE


user: zzm
pass: wihajster

user: root
pass: wihajster1234

#udostepnianie internetu przez USB (start script)
route add default gw 192.168.7.1
echo "nameserver 8.8.8.8" >> /etc/resolv.conf

#wylaczenie diod (start script)
echo 0 > '/sys/class/leds/beaglebone:green:usr0/brightness'
echo 0 > '/sys/class/leds/beaglebone:green:usr1/brightness'
echo 0 > '/sys/class/leds/beaglebone:green:usr2/brightness'
echo 0 > '/sys/class/leds/beaglebone:green:usr3/brightness'

#VNC server
sudo apt-get install x11vnc
x11vnc -bg -o %HOME/.x11vnc.log.%VNCDISPLAY -auth /var/run/lightdm/root/:0 -forever

#użycie pamięci
top

#usb camera
apt-get install motion
apt-get install v4l-conf v4l-utils v4l2ucp
