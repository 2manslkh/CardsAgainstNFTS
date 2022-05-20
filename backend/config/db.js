const mongoose = require("mongoose");
require("dotenv").config();

const credentials = "./admin.pem";

const connectDB = () => {
  if (process.env.NODE_ENV === "test") {
    console.log("LOCAL DB");
    try {
      mongoose.connect("mongodb://localhost:27017/CardsAgainstNFTS", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        ssl: false,
        retryWrites: true,
        w: "majority",
      });
      return mongoose;
    } catch (error) {
      console.log(`Error connecting to Local DB: ${error.message}`);
      process.exit(1);
    }
  } else if (process.env.NODE_ENV == "dev") {
    console.log("DEV DB");
    try {
      mongoose.connect(
        "mongodb+srv://cluster0.gury7.mongodb.net/CardsAgainstNFTS-Dev",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ssl: true,
          sslKey: credentials,
          sslCert: credentials,
          authMechanism: "MONGODB-X509",
          authSource: "$external",
          retryWrites: true,
          w: "majority",
        }
      );
      return mongoose;
    } catch (error) {
      console.log(`Error connecting to DB: ${error.message}`);
      process.exit(1);
    }
  } else if (process.env.NODE_ENV == "prod") {
    console.log("PROD DB");
    try {
      mongoose.connect(
        "mongodb+srv://cluster0.gury7.mongodb.net/CardsAgainstNFTS",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          ssl: true,
          sslKey: credentials,
          sslCert: credentials,
          authMechanism: "MONGODB-X509",
          authSource: "$external",
          retryWrites: true,
          w: "majority",
        }
      );
      return mongoose;
    } catch (error) {
      console.log(`Error connecting to DB: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log("DB Connection failed");
  }
};

module.exports = connectDB;
