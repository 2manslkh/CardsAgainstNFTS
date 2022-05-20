const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
  respondee: { type: String, required: true },
  baseId: { type: String, required: true },
  votes: { type: String, default: 0 },
  voters: { type: [String] },
  response: { type: String, required: true },
});

module.exports = mongoose.model("Response", responseSchema);
