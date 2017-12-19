sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo echo '/swapfile none swap sw 0 0' >> /etc/fstab
sudo echo 'vm.swappiness=30' >> /etc/sysctl.conf
sudo /sbin/shutdown -r now
free -mh

