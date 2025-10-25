const mongoose = require("mongoose");
require("dotenv").config();

// //     const db = client.db(dbName);
let dbURL;
switch (process.env.NODE_ENV) {
  case "production":
    dbURL = process.env.PROD_DB_URL;
    break;
  case "test":
    dbURL = process.env.TEST_DB_URL;
    break;
  default:
    dbURL = process.env.DEV_DB_URL;
    break;
}

mongoose
  .connect(dbURL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindandModify: false,
    // useCreateIndex: true,
  })
  .then(() => {
    console.log(`Connected to ${process.env.NODE_ENV} database`);
  })
  .catch((error) => {
    console.error("Error connecting to database:", error.message);
  });
