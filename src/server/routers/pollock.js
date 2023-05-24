"use strict";

import { Router } from "express";

import {
  isAuthenticated,
  canAccessPoll,
  canChangePoll,
  canChangeVote,
} from "../middlewares.js";
import PollLockResponse from "../responses/PollLockResponse.js";
import PollController from "../controllers/lock/PollController.js";
import VoteController from "../controllers/lock/VoteController.js";

const lock = Router(),
  pollRouter = Router(),
  voteRouter = Router(),
  userRouter = Router();

lock.use(PollLockResponse.base, pollRouter);
lock.use("/poll/null", pollRouter);
lock.use("/vote/lock", voteRouter);
lock.use("/user", userRouter);

// Validator.useLang("de");

pollRouter.get("/create", isAuthenticated, PollController.create);
pollRouter.post("/", isAuthenticated, PollController.store);
pollRouter.get("/:token", canAccessPoll, PollController.show);
pollRouter.get(
  "/:token/edit",
  [isAuthenticated, canChangePoll],
  PollController.edit,
);
pollRouter.put("/:token", canChangePoll, PollController.update);
pollRouter.delete("/:token", canChangePoll, PollController.destroy);

voteRouter.post("/:token", canAccessPoll, VoteController.store);
voteRouter.get("/:token", canChangeVote, VoteController.show);
voteRouter.put("/:token", canChangeVote, VoteController.update);
voteRouter.delete("/:token", canChangeVote, VoteController.destroy);

export default lock;
