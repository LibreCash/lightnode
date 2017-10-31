pragma solidity ^0.4.11;

contract OurOracle {
    event requestUpdate(uint256 timestamp);
    event tickerAdded(uint256 timestamp);
    mapping(address=>bool) isApproverAddress; // TODO: Add to check msg.sender address
    uint256[] public tickersData;
    uint256 public lastUpdateTime;
    bool public updateRequested = false;

    function appendData(uint256 rate)  public {
        tickerAdded(now);
        tickersData.push(rate);
        lastUpdateTime = now;   
        updateRequested = false;
    }

    function doUpdateRequest() public {
        requestUpdate(now);
        updateRequested = true;
    }

}