"use strict";

import { Router } from "express";
import lack from "./pollack.js";
import lock from "./pollock.js";
import User from "./models/User.js";
import bodyParser from "body-parser";
import { isAuthenticated } from "./middlewares.js";

const router = Router();
const frontend = Router();

frontend.use(bodyParser.urlencoded({ extended: true }));

frontend.get("/", isAuthenticated, async (req, res) => {
  const polls = await (await User.getByName("user")).polls;
  polls.map(async (p) => (p.numVotes = (await p.votes).length));

  res.render("index", {
    title: "Your polls",
    user: req.user,
    polls: polls,
  });
});

frontend.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login",
  });
});

frontend.post("/login", async (req, res) => {
  try {
    const user = await User.getByCredentials(req.body.name, req.body.password);

    req.session.user = user.name;
    req.session.save();
    res.redirect("/");
  } catch (e) {
    console.error(e);
  }
});

frontend.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.use(lack);
router.use(lock);
router.use(frontend);

export default router;
