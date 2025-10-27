const request = require("supertest");
const app = require("../src/app");
const User = require("../src/model/user");
const { sampleUser, userId, setupDatabase } = require("./fixtures/db");

// const userId = new mongoose.Types.ObjectId();

// const sampleUser = {
//   _id: userId,
//   name: "Sample User",
//   email: "sampleuser@example.com",
//   password: "SamplePass123!",
//   tokens: [
//     {
//       token: jwt.sign({ _id: userId }, process.env.JWT_SECRET),
//     },
//   ],
// };

// Before each test, clear the users collection
beforeEach(setupDatabase);

test("Should login existing user", async () => {
  await request(app)
    .post("/login")
    .send({ email: sampleUser.email, password: sampleUser.password })
    .expect(200);

  const user = await User.findOne({ email: sampleUser.email });
  expect(user).not.toBeNull();
  expect(user.tokens.length).toBe(2);
  expect(user.tokens[1].token).toBeDefined();
  expect(user.tokens[1].token).not.toBe(sampleUser.tokens[0].token);
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
  const user = await User.findById(userId);
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .attach("avatar", "test/fixtures/Ten10 Logo - Profile01.png")
    .expect(200);
  const user = await User.findById(userId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send({
      name: "Updated User",
      email: "updateduser@example.com",
    })
    .expect(200);
  const user = await User.findById(userId);
  expect(user.name).toBe("Updated User");
  expect(user.email).toBe("updateduser@example.com");
});
test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send({
      location: "New Location",
    })
    .expect(400);
});
