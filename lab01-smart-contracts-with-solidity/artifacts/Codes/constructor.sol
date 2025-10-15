// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ComputationExample {
    // State variables
    uint public multiplier;
    uint public initialValue;
    uint public computedValue;

    // Constructor to initialize state variables and perform a computation
    constructor(uint _multiplier, uint _initialValue) {
        multiplier = _multiplier;       // Store the multiplier value
        initialValue = _initialValue;   // Store the initial value
        computedValue = compute();      // Perform a computation when contract is deployed
    }

    // Function to compute a value based on state variables
    function compute() private view returns (uint) {
        return initialValue * multiplier;  // Example computation
    }

    // Public function to update multiplier and recompute the value
    function updateMultiplier(uint newMultiplier) public {
        multiplier = newMultiplier;
        computedValue = compute();  // Recompute with new multiplier
    }
}
