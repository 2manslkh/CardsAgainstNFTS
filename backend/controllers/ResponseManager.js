const { ethers } = require("ethers");

const Response = require("../models/Response.model");

require("dotenv").config();

const SIGNER_KEY = process.env.SIGNER_KEY;

// Verify Sender
const verifyResponse = (baseId, response, respondee, signature) => {
  // Initialize Domain
  const domain = {
    name: "Cards Against NFTs",
    version: "1",
  };

  // The named list of all type definitions
  const types = {
    Response: [
      { name: "baseId", type: "uint256" },
      { name: "response", type: "string" },
      { name: "respondee", type: "address" },
    ],
  };

  try {
    signingAddress = ethers.utils.verifyTypedData(
      domain,
      types,
      { baseId: baseId, response: response, respondee: respondee },
      signature
    );
    return true;
  } catch (error) {
    console.log("🚀 | verifyResponse | error", error);
    return false;
  }
};

// Verify Vote
const verifyVote = (baseId, response, vote, votee, signature) => {
  // Initialize Domain
  const domain = {
    name: "Cards Against NFTs",
    version: "1",
  };

  // The named list of all type definitions
  const types = {
    AirdropRequest: [
      { name: "baseId", type: "uint256" },
      { name: "response", type: "string" },
      { name: "vote", type: "uint256" },
      { name: "votee", type: "address" },
    ],
  };

  try {
    signingAddress = ethers.utils.verifyTypedData(
      domain,
      types,
      { baseId: baseId, response: response, vote: vote, votee: votee },
      signature
    );
    console.log("🚀 | exports.sendSelection= | signingAddress", signingAddress);
    return true;
  } catch (error) {
    console.log("🚀 | verifyResponse | error", error);
    return false;
  }
};

// Sign Save Function
const signMessage = (sender, tokenId, response, votes, signing_key) => {
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

/**
 * GET All Responses based on baseId
 */
exports.getAllResponses = async (req, res, next) => {
  let baseId = req.params.baseId;

  try {
    let responses = await Response.find({ baseId: baseId }, { __v: 0, _id: 0 });

    return res.status(200).json({
      success: true,
      data: { responses: responses },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err,
    });
  }
};

/**
 * POST Receive user's response
 * @param {string} baseId - baseId of the base phrase the reponse is directed to
 * @param {string} response - Response given by respondee
 * @param {string} respondee - Address of respondee
 */
exports.respond = async (req, res, next) => {
  let baseId = req.body.baseId;
  let response = req.body.response;
  let respondee = req.body.respondee;
  let signature = req.body.signature;

  // Verify correct address
  let wallet;
  try {
    wallet = ethers.utils.getAddress(address);
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: { error: "Invalid Address" },
    });
  }

  // Verify Signature
  if (!verifyResponse(baseId, response, respondee, signature)) {
    return res.status(400).json({
      success: false,
      data: { error: "Invalid Signature!" },
    });
  }

  // Create new response, update response if already submitted by user
  try {
    await Response.findOneAndUpdate(
      { baseId: baseId, respondee: wallet },
      { response: response },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: { message: "Response Submitted!" },
    });
  } catch (err) {
    //handle error here
    console.log(err);
  }
};

exports.vote = async (req, res, next) => {
  let baseId = req.body.baseId;
  let responseId = req.body.response;
  let votee = req.body.respondee;

  // Address Input Verification
  // Verify correct address
  let wallet;
  try {
    wallet = ethers.utils.getAddress(address);
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: { error: "Invalid Address" },
    });
  }

  // Get Response from Response Id
  let response = await Response.findOne({ baseId: baseId, _id: responseId });

  // Verify Signature
  if (!verifyVote(baseId, response, votee, signature)) {
    return res.status(400).json({
      success: false,
      data: { error: "Invalid Signature!" },
    });
  }

  // Check if user has not voted before
  if (response.voters.includes(votee)) {
    return res.status(400).json({
      success: false,
      data: { error: "Duplicate Vote!" },
    });
  }

  // Update response
  try {
    // Increase vote count by 1 and add votee to list of voters
    response.votes += 1;
    response.voters.push(wallet);
    await response.save();

    return res.status(200).json({
      success: true,
      data: { message: "Vote Success!" },
    });
  } catch (err) {
    //handle error here
    console.log(err);
  }
};
