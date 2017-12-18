#!/bin/sh

M0=root@198.211.120.227
L1=root@178.62.207.191
L2=root@165.227.175.203

set -x

sshpass -f ../../private/pass-m-1 scp readonly $M0:~/.ssh/id_rsa
sshpass -f ../../private/pass-m-1 scp readonly.pub $M0:~/.ssh/id_rsa.pub
sshpass -f ../../private/pass-m-1 ssh $M0 'chmod go-rw ~/.ssh/id_rsa*'

sshpass -f ../../private/pass-l-1 scp readonly $L1:~/.ssh/id_rsa
sshpass -f ../../private/pass-l-1 scp readonly.pub $L1:~/.ssh/id_rsa.pub
sshpass -f ../../private/pass-l-1 ssh $L1 'chmod go-rw ~/.ssh/id_rsa*'

sshpass -f ../../private/pass-l-2 scp readonly $L2:~/.ssh/id_rsa
sshpass -f ../../private/pass-l-2 scp readonly.pub $L2:~/.ssh/id_rsa.pub
sshpass -f ../../private/pass-l-2 ssh $L2 'chmod go-rw ~/.ssh/id_rsa*'


