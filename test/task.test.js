const request = require("supertest");
const Task = require("../src/model/task");
const app = require("../src/app");
const { sampleUser, userId, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should create task for user", async () => {
  const response = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send({
      description: "From my test",
    })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test("Should fetch user tasks", async () => {
  const response = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(1);
});

test("Should not delete other users tasks", async () => {
  const task = await Task.findOne({ author: userId });
  await request(app)
    .delete(`/tasks/${task._id}`)
    .set("Authorization", `Bearer ${sampleUser.tokens[0].token}`)
    .send()
    .expect(200);
  const deletedTask = await Task.findById(task._id);
  expect(deletedTask).toBeNull();
});
