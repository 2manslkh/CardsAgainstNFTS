const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const connectDB = require("./config/db");

// ----------------------------------
// Routes Import
// ----------------------------------
const response = require("./routes/Response");
// const sign = require("./routes/Signer");

// ----------------------------------
// Middleware
// ----------------------------------
const app = express();

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// ----------------------------------
// API Routes
// ----------------------------------

app.use("/response", response);
// app.use("/sign", sign);

// ----------------------------------
// Express server
// ----------------------------------
const PORT = process.env.PORT || 5000;
app.db = connectDB();

app.server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
