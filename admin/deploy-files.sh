#!/bin/sh

M1=root@198.211.120.227
L1=root@178.62.207.191
L2=root@165.227.175.203

set -x

sshpass -f ../../private/pass-l-1 scp setup-swap.sh $L1:~/
sshpass -f ../../private/pass-l-2 scp setup-swap.sh $L2:~/
sshpass -f ../../private/pass-m-1 scp setup-swap.sh $M1:~/

sshpass -f ../../private/pass-l-1 ssh $L1 'wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.7.3-4bb3c89d.tar.gz && tar xzf geth-linux-amd64-1.7.3-4bb3c89d.tar.gz && mv geth-linux-amd64-1.7.3-4bb3c89d/geth . && rm -rf geth-linux-amd64-1.7.3-4bb3c89d*'
sshpass -f ../../private/pass-l-2 ssh $L2 'wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.7.3-4bb3c89d.tar.gz && tar xzf geth-linux-amd64-1.7.3-4bb3c89d.tar.gz && mv geth-linux-amd64-1.7.3-4bb3c89d/geth . && rm -rf geth-linux-amd64-1.7.3-4bb3c89d*'

