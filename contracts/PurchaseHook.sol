// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@unlock-protocol/contracts/dist/PublicLock/IPublicLockV13.sol";
import "hardhat/console.sol";

contract PurchaseHook {
    mapping(address => address payable) public referals;
    mapping(address => uint256) public referalAmounts;

    /** Constructor */
    constructor() {}

    // set referal
    function setReferal(address _recipient, address payable _referrer) public {
        referals[_recipient] = _referrer;
    }

    // get referal
    function getReferal(address _user) public view returns (address payable) {
        return referals[_user];
    }

    // get referal amount
    function getReferalAmount(address _referr) public view returns (uint256) {
        return referalAmounts[_referr];
    }

    // set referal amount
    function setReferalAmount(address _referr, uint256 _amount) public {
        referalAmounts[_referr] = _amount;
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
        address payable referrer,
        bytes calldata /*data*/,
        uint256 /*minKeyPrice*/,
        uint256 /*pricePaid*/
    ) external {
        console.log("onKeyPurchase");
        // Do nothing
        setReferal(recipient, referrer);
        console.log("referrer", referrer);
        IPublicLockV13(msg.sender).withdraw(msg.sender, referrer, 1000);
    }

    function onKeyExtend(
        uint256 /* _tokenId*/,
        address from,
        uint256 /* newTimestamp */,
        uint256 /* old expirationTimestamp */
    ) external {
        // No-op
        console.log("onKeyExtend");
        uint256 price = IPublicLockV13(msg.sender).keyPrice();
        console.log("price", price);
        address payable referrer = getReferal(from);
        IPublicLockV13(msg.sender).withdraw(msg.sender, referrer, 1000);
    }
}
