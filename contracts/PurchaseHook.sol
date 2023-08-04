// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "hardhat/console.sol";

contract PurchaseHook {
    struct Referal {
        address referrer;
        uint256 amount;
    }

    mapping(address => Referal) public referals;

    /** Constructor */
    constructor() {}

    // set referal
    function setReferal(
        address _recipient,
        address _referrer,
        uint256 _amount
    ) public {
        referals[_recipient] = Referal(_referrer, _amount);
    }

    // get referal
    function getReferal(address _user) public view returns (Referal memory) {
        return referals[_user];
    }

    /**
     * Function that is called at the begining of the
     * `purchase` function on the Public Lock contract.
     * It is expected to return the price that has to be
     * paid by the purchaser (as a uint256). If this
     * reverts, the purchase function fails.
     */
    function keyPurchasePrice(
        address /* from */,
        address /* recipient */,
        address /* referrer */,
        bytes calldata /* data */
    ) external view returns (uint256 minKeyPrice) {
        return IPublicLockV13(msg.sender).keyPrice();
    }

    /**
     * Function that is called at the end of the `purchase`
     * function and that can be used to record and store
     * elements on the hook. Similarly, if this reverts, the
     * purchase function fails.
     */
    function onKeyPurchase(
        uint256 /* tokenId */,
        address /* from */,
        address recipient,
        address referrer,
        bytes calldata /*data*/,
        uint256 /*minKeyPrice*/,
        uint256 /*pricePaid*/
    ) external {
        console.log("onKeyPurchase");
        // Do nothing
        setReferal(recipient, referrer, 1);
    }

    function onKeyExtend(
        uint256 /* _tokenId*/,
        address /* from */,
        uint256 /* newTimestamp */,
        uint256 /* old expirationTimestamp */
    ) {
        // No-op
    }
}
