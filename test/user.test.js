const request = require("supertest");
const app = require("../src/app");
const User = require("../src/model/user");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
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

// Before each test, clear the users collection
beforeEach(async () => {
  await User.deleteMany();
  await new User(sampleUser).save();
});

test("Should login existing user", async () => {
  await request(app)
    .post("/login")
    .send({ email: sampleUser.email, password: sampleUser.password })
    .expect(200);
});
test("Should not login non-existent user", async () => {
  await request(app)
    .post("/login")
    .send({ email: "nonexistent@example.com", password: "WrongPass123!" })
    .expect(401);
});

test("Should create a new user", async () => {
  const response = await request(app)
    .post("/users")
    .send({
      name: "Test User",
      email: "testuser@example.com",
      password: "MyPass777!",
    })
    .expect(201);
  // Additional assertions can be added here
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();
  expect(response.body).toMatchObject({
    user: {
      name: "Test User",
      email: "testuser@example.com",
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe("MyPass777!");
});

test("Should show user profile", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not show profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete user account", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
