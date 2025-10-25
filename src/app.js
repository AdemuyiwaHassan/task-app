const express = require("express");
const userRouter = require("./routes/users");
const taskRouter = require("./routes/tasks");
const authRouter = require("./routes/auths");
require("./db/mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);
app.use(authRouter);

module.exports = app;
