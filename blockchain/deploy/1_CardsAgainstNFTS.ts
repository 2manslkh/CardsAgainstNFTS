import "dotenv/config";

import { GasLogger } from "../utils/helper";
import { ethers } from "hardhat";

const gasLogger = new GasLogger();

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  const [owner] = await ethers.getSigners();

  let ownerAddress = owner.address;

  // Config
  console.log(`Deploying CardsAgainstNFTS Contract... from ${ownerAddress}`);

  let can = await deploy("CardsAgainstNFTS", {
    from: ownerAddress,
    args: [],
  });

  gasLogger.addDeployment(can);
};

module.exports.tags = ["CardsAgainstNFTS", "CAN"];
