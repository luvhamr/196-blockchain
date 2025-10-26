// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleAuction {
    // Parameters of the auction
    address payable public beneficiary; // Auction beneficiary
    uint public auctionEndTime;      // Auction end time

    // Current state of the auction
    address public highestBidder;        // Address of the highest bidder
    uint public highestBid;              // Highest bid amount

    mapping(address => uint) pendingReturns;  // Track funds to return to previous bidders
    bool ended;                             // If the auction has ended

    // Events
    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    // Constructor to set the beneficiary and auction end time
    constructor(uint _biddingTime, address payable _beneficiary) {
        beneficiary = _beneficiary;
        auctionEndTime = block.timestamp + _biddingTime;
    }
    // Bid function for participants to bid in the auction
    function bid() public payable {
        // Revert the call if the auction has already ended
        require(block.timestamp <= auctionEndTime, "Auction already ended.");

        // If the bid is not higher than the highest bid, revert
        require(msg.value > highestBid, "There already is a higher bid.");

        // Refund the previous highest bidder
        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        // Update the highest bidder and bid
        highestBidder = msg.sender;
        highestBid = msg.value;

        emit HighestBidIncreased(msg.sender, msg.value);
    }
    // Withdraw bids that were outbid
    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;    // this is a simulation and in real-life, you will send back the amount to the bidder. 

            // Send the amount back to the bidder
            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    // End the auction and send the highest bid to the beneficiary
    function auctionEnd() public {
        // Check if auctionEnd has already been called
        require(block.timestamp >= auctionEndTime, "Auction not yet ended.");
        require(!ended, "auctionEnd has already been called.");

        ended = true;

        emit AuctionEnded(highestBidder, highestBid);

        // Send the highest bid to the beneficiary
        beneficiary.transfer(highestBid);
        
    }
}
