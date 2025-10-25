const express = require("express");
const router = express.Router();
const User = require("../model/user");
const auth = require("../middleware/auth");

const { sendLoginAlert, sendLogoutAlert } = require("../email/account");

router.post("/login", async (req, res) => {
  try {
    const user = await User.findbyCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
    sendLoginAlert(user.email, user.name);
  } catch (e) {
    res.status(401).send(e);
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token != req.token;
    });

    await req.user.save();
    sendLogoutAlert(req.user.email, req.user.name);

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
