const { ethers } = require("ethers");
const { getContract } = require("../config/contracts");
const { pinata } = require("../config/pinata");
const { default: axios } = require("axios");

require("dotenv").config();

const SIGNER_KEY = process.env.SIGNER_KEY;

// Sign Save Function
const signMessage = (respondee, tokenId, response, votes, signing_key) => {
  console.log(new ethers.Wallet(signing_key));
  const signingKey = new ethers.utils.SigningKey(signing_key);
  const msgHash = ethers.utils.solidityKeccak256(
    ["address", "uint256", "string", "uint256"],
    [respondee, tokenId, response, votes]
  );
  const digest = signingKey.signDigest(msgHash);
  const signature = ethers.utils.joinSignature(digest);
  return { signature: signature };
};

/**
 * Generate Signature for Minting
 *
 * 1. User's response must be the top voted for the baseID
 * 2. NFT must not be minted
 * 3. Only owner of the response can receive the signed message
 */
exports.sign = async (req, res, next) => {
  const { baseId, respondee } = req.params;

  // Validate address
  try {
    respondee = ethers.utils.getAddress(respondee);
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: { error: "Invalid Address" },
    });
  }

  // Get all responses for the baseId
  let responses = await Response.find({ baseId: baseId });

  // Sort responses by votes in ascending order
  responses = responses.sort((a, b) => {
    return a.votes - b.votes;
  });

  let topResponses = responses.filter((response) => {
    return response.votes === responses[0].votes;
  });

  // Check if respondee has the highest voted response
  if (
    topResponses.length > 0 &&
    topResponses.find((response) => {
      return response.respondee === respondee;
    })
  ) {
    // Get the response
    let response = topResponses.find((response) => {
      return response.respondee === respondee;
    });

    // Get the tokenId
    let tokenId = response.tokenId;

    // Get the response
    let responseString = response.response;

    // Get the votes
    let votes = response.votes;

    // Get the signing key
    let signing_key = response.signing_key;

    // Sign the message
    let signedMessage = signMessage(
      respondee,
      tokenId,
      responseString,
      votes,
      signing_key
    );

    // Return the signed message
    return res.status(200).json({
      success: true,
      data: {
        respondee: respondee,
        tokenId: tokenId,
        responseString: responseString,
        votes: votes,
        signedMessage: signedMessage,
      },
    });
  } else {
    return res.status(400).json({
      success: false,
      data: { error: "No response found" },
    });
  }
};
