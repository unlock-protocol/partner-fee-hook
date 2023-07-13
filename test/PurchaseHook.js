const { expect } = require("chai");
const { ethers, unlock } = require("hardhat");

describe("PurchaseHook", function () {
  let lock;
  let hook;
  before(async () => {
    const [user, owner, refer] = await ethers.getSigners();
    // Deploy the core Unlock protocol
    await unlock.deployProtocol();
    // Deploy a lock
    const result = await unlock.createLock({
      expirationDuration: 60 * 60 * 24 * 7,
      maxNumberOfKeys: 100,
      keyPrice: 0,
      beneficiary: owner.address,
      name: "My NFT membership contract",
    });
    lock = result.lock;

    console.log("Lock address", lock.address);

    // Deploy the hook
    const PurchaseHook = await ethers.getContractFactory("PurchaseHook");
    hook = await PurchaseHook.deploy();
    await hook.deployed();
    console.log("Hook address", hook.address);

    // Attach the hook to our lock
    await (
      await lock.setEventHooks(
        hook.address, // The first address is the onKeyPurchase hook
        ethers.constants.AddressZero, // Other non-used hooks
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
        ethers.constants.AddressZero,
      )
    ).wait();

    await (await lock.addLockManager(hook.address)).wait();
      
    // And now make a purchase
    expect(lock.address).to.be.properAddress;
    expect(hook.address).to.be.properAddress;
    
    console.log(user.address, owner.address, refer.address);
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

  });



  it('should set refer on purchase', async () => {
    

    const referals = await hook.referals(user.address);
    console.log(referals);
  });

  

});