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


    console.log("Lock address", lock.address);
    console.log("user is manager? address", await lock.isLockManager(user.address));
    console.log("owner is manager? address", await lock.isLockManager(owner.address));
    console.log("refer is manager? address", await lock.isLockManager(refer.address));

    // Attach the hook to our lock
    // You will also need to set the hook address fot renewals, right?
    console.log(await lock.onKeyPurchaseHook())
    console.log(await lock.onKeyCancelHook())
    console.log(await lock.onValidKeyHook())
    console.log(await lock.onTokenURIHook())
    console.log(await lock.onKeyTransferHook())
    console.log(await lock.onKeyExtendHook())
    console.log(await lock.onKeyGrantHook())
    console.log(await lock.onKeyGrantHook())


    await (
      await lock.setEventHooks(
        ethers.constants.AddressZero, // _onKeyPurchaseHook
        ethers.constants.AddressZero, // _onKeyCancelHook
        ethers.constants.AddressZero, // _onValidKeyHook
        ethers.constants.AddressZero, // _onTokenURIHook
        ethers.constants.AddressZero, // _onKeyTransferHook
        ethers.constants.AddressZero, // _onKeyExtendHook
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
