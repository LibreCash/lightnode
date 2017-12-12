FROM golang:1.7

# for faster download of container, run all commands at once to create only one docker filesystem layer
RUN go get -v github.com/ethereum/go-ethereum/cmd/geth
RUN rm -rf /go/pkg /go/src
RUN mkdir /blockchain

#  go get github.com/ethereum/go-ethereum/cmd/geth && 

VOLUME /blockchain

EXPOSE 30303
EXPOSE 8545

ENTRYPOINT ["/go/bin/geth", "--datadir=/blockchain"]
