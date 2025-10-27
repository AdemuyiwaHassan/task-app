const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/model/user");
const Task = require("../../src/model/task");
require("dotenv").config();
const userId = new mongoose.Types.ObjectId();

const sampleUser = {
  _id: userId,
  name: "Sample User",
  email: "sampleuser@example.com",
  password: "SamplePass123!",
  tokens: [
    {
      token: jwt.sign({ _id: userId }, process.env.JWT_SECRET),
    },
  ],
};

const sampleTask = {
  _id: new mongoose.Types.ObjectId(),
  description: "Sample Task",
  completed: false,
  author: userId,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(sampleUser).save();
  await new Task(sampleTask).save();
};
module.exports = {
  sampleUser,
  setupDatabase,
  userId,
  sampleTask,
};
