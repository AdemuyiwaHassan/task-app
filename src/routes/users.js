const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../model/user");
const { sendWelcomeEmail, sendDelectionAlert } = require("../email/account");

// Get all Users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send();
  }
});

//Create user
router.post("/users", async (req, res) => {
  const newUser = new User(req.body);

  const token = await newUser.generateAuthToken();

  newUser
    .save()
    .then(() => {
      res.status(201).send({ user: newUser, token });
      sendWelcomeEmail(newUser.email, newUser.name);
    })
    .catch((error) => {
      res.status(400).send(error);
    });
});

//Get me
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// Upload middleware
const upload = multer({
  limits: {
    fileSize: 1000000, // 1 MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(null, true);
  },
}).single("avatar");

//Upload Profile Pics
router.post(
  "/users/me/avatar",
  auth,
  upload,
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();

    res.status(200).send(req.file.originalname);
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// Get user by ID

router.get("/users/:id", auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

//Update me
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

// Update User by ID
router.patch("/users/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "age", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).send();
  }

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    return res.status(500).send();
  }
});

//Delete Me
router.delete("/users/me", auth, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    res.send(deletedUser);
    sendDelectionAlert(deletedUser.email, deletedUser.name);
  } catch (error) {
    return res.status(500).send();
  }
});

//Delete user by ID
router.delete("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(req.user);
  } catch (error) {
    return res.status(500).send();
  }
});

// Get Image
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

//Delete Profile Pics
router.delete("/users/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
});

module.exports = router;
