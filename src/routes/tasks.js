const express = require("express");
const router = express.Router();
const Task = require("../model/task");
const auth = require("../middleware/auth");
const {
  sendTaskCreationEmail,
  sendTaskDeletionEmail,
  sendTaskUpdateEmail,
} = require("../email/account");

router.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.send(tasks);
  } catch (error) {
    res.status(500).send();
  }
});

// create task
router.post("/tasks", auth, async (req, res) => {
  // const newTask = new Task(req.body);

  const newTask = new Task({
    ...req.body,
    author: req.user._id,
  });

  try {
    await newTask.save();
    sendTaskCreationEmail(req.user.email, newTask.description, req.user.name);
    res.status(201).send(newTask);
  } catch (error) {
    res.status(400).send(error);
  }
});

// my tasks
router.get("/tasks/me", auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }

  try {
    await req.user.populate({
      path: "tasks",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: {
          createdAt: req.query.sortBy === "desc" ? -1 : 1,
        },
      },
    });

    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.status(404).send(e);
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findById(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

// update my task
router.patch("/tasks/me/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    sendTaskUpdateEmail(req.user.email, task.description, req.user.name),
      await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete my task

router.delete("/tasks/me/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, author: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    sendTaskDeletionEmail(req.user.email, task.description, req.user.name);
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

router.delete("/tasks/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const task = await Task.findByIdAndDelete(_id);
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
