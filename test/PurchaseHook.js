const { expect } = require("chai");
const { ethers, unlock } = require("hardhat");

describe("PurchaseHook", function () {
  before(async () => {
    await unlock.deployProtocol();
  });

  it("should set refer on purchase", async () => {
    const [user, owner, refer] = await ethers.getSigners();
    console.log(
      `Owner: ${owner.address}\nRecipient: ${user.address}\nRefer: ${refer.address}`
    );
    // Deploy a lock
    const { lock } = await unlock.createLock({
      expirationDuration: 60 * 60 * 24 * 7,
      maxNumberOfKeys: 100,
      keyPrice: 0,
      name: "My NFT membership contract",
    });

    // Deploy the hook
    const PurchaseHook = await ethers.getContractFactory("PurchaseHook");
    const hook = await PurchaseHook.deploy();
    await hook.deployed();
    console.log("Hook address", hook.address);

    await (
      await lock.setEventHooks(
        hook.address, // _onKeyPurchaseHook
        ethers.constants.AddressZero, // _onKeyCancelHook
        ethers.constants.AddressZero, // _onValidKeyHook
        ethers.constants.AddressZero, // _onTokenURIHook
        ethers.constants.AddressZero, // _onKeyTransferHook
        hook.address, // _onKeyExtendHook
        ethers.constants.AddressZero  // _onKeyGrantHook
      )
    ).wait();
    console.log("Hook attached to lock");

    await (await lock.addLockManager(hook.address)).wait();
    console.log("Hook added as lock manager");

    // And now make a purchase
    expect(lock.address).to.be.properAddress;
    expect(hook.address).to.be.properAddress;

    console.log('Ready for purchase')
    await (
      await lock.purchase(
        [0],
        [user.address], //recipient
        [owner.address], // key manager
        [refer.address], // refer
        [[]],
        { value: 0 }
      )
    ).wait();

    const referals = await hook.referals(user.address);
    console.log(referals);
  });
});
