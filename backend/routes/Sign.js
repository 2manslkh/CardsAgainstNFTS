const express = require("express");
const router = express.Router();

const { mint } = require("../controllers/Signer");

router.route("/").get(mint);

module.exports = router;
