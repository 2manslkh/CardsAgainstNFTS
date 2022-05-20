import "dotenv/config";

import { deployments, ethers, network } from "hardhat";

import { BigNumber } from "ethers";
import { CardsAgainstNFTS } from "./../typechain/CardsAgainstNFTS";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

/**
 * Creates a signature and a unique nonce
 * @param {Address} address - Whitelisted Address
 * @returns {bytes32, bytes32} signature , nonce
 */
const signMessage = (
  sender: any,
  tokenId: any,
  response: any,
  votes: any,
  signing_key: any
) => {
  console.log(new ethers.Wallet(signing_key));
  const signingKey = new ethers.utils.SigningKey(signing_key);
  const msgHash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "string", "uint256"],
    [sender, tokenId, response, votes]
  );
  const digest = signingKey.signDigest(msgHash);
  const signature = ethers.utils.joinSignature(digest);
  return { signature: signature };
};

async function getCurrentBlockTimestamp(): Promise<BigNumber> {
  let currentBlockNumber = await ethers.provider.getBlockNumber();
  return BigNumber.from(
    (await ethers.provider.getBlock(currentBlockNumber)).timestamp
  );
}

async function skipTo(startTime: BigNumber, days: Number): Promise<any> {
  await network.provider.send("evm_setNextBlockTimestamp", [
    startTime.add(BigNumber.from(days).mul(86400)).add(1).toNumber(),
  ]);
  await network.provider.send("evm_mine");
  console.log(`🕓 | Skipped ${days} days`);
}

describe("ERC721ATemplate", function () {
  let owner: SignerWithAddress;
  let can: CardsAgainstNFTS;

  before(async function () {
    // Get Signers
    [owner] = await ethers.getSigners();

    // Setup Test
    await deployments.fixture(["CAN"]);
    can = await ethers.getContract("CardsAgainstNFTS", owner);
  });

  it("Mint", async function () {
    console.log(owner.address);
    console.log(await can.deployer());

    let signature = signMessage(
      owner.address,
      1,
      "Test",
      1337,
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    );
    console.log("🚀 | signature", signature);

    await expect(
      can.mint(1, "Test", 1337, signature.signature)
    ).to.be.revertedWith("CardsAgainstNFTs: Round is not over!");

    // Skip 1 day
    let currentTime = await getCurrentBlockTimestamp();
    console.log("🚀 | currentTime", currentTime);

    await skipTo(currentTime, 2);
    currentTime = await getCurrentBlockTimestamp();
    console.log("🚀 | currentTime", currentTime);

    await can.mint(1, "Test", 1337, signature.signature);

    expect(await can.totalSupply()).to.equal(1);
    expect(await can.balanceOf(owner.address)).to.equal(1);
  });
});
