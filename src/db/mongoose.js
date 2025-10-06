const mongoose = require("mongoose");
require("dotenv").config();

// //     const db = client.db(dbName);

mongoose
  .connect(process.env.MONGODB_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindandModify: false,
    // useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
