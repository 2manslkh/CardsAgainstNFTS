const express = require("express");
const router = express.Router();

const {
  getAllResponses,
  respond,
  vote,
} = require("../controllers/ResponseManager");

// router.route("/:baseId").get(getAllResponses);
// router.route("/:baseId/respond").post(respond);
// router.route("/:baseId/vote").post(vote);

module.exports = router;
