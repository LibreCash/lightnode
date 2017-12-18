#!/bin/sh

M1=root@198.211.120.227
L1=root@178.62.207.191
L2=root@165.227.175.203

set -x

sshpass -f ../../private/pass-l-1 scp ../../private/common-config.json $L1:~/config.json
sshpass -f ../../private/pass-l-2 scp ../../private/common-config.json $L2:~/config.json
sshpass -f ../../private/pass-m-1 scp ../../private/common-config.json $M1:~/config.json
sshpass -f ../../private/pass-m-1 scp ../../private/m-1-ui-config.js $M1:~/config.js


