"use strict";

import { Router } from "express";
import bodyParser from "body-parser";
import { isAuthenticated } from "../middlewares.js";
import User from "../models/User.js";
import UserController from "../controllers/UserController.js";
import AuthController from "../controllers/AuthController.js";

const frontend = Router();

frontend.use(bodyParser.urlencoded({ extended: true }));

frontend.get("/", isAuthenticated, async (req, res) => {
  const polls = await res.locals.user.polls;
  polls.map(async (p) => (p.numVotes = (await p.votes).length));

  res.render("index", {
    title: "Your polls",
    polls: polls,
  });
});

frontend.get("/login", AuthController.login);

frontend.post("/login", AuthController.authenticate);

frontend.get("/register", AuthController.register);

frontend.post("/register", UserController.store);

frontend.post("/logout", isAuthenticated, AuthController.logout);

export default frontend;
