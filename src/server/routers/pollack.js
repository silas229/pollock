"use strict";

import { Router } from "express";
import PollResponse from "../responses/PollResponse.js";
import VoteResponse from "../responses/VoteResponse.js";
import PollController from "../controllers/lack/PollController.js";
import VoteController from "../controllers/lack/VoteController.js";
import { canAccessPoll, canChangePoll, canChangeVote } from "../middlewares.js";

const lack = Router(),
  pollRouter = Router(),
  voteRouter = Router();

lack.use(PollResponse.base, pollRouter);
lack.use(VoteResponse.base, voteRouter);

// Validator.useLang("de");

pollRouter.get("/create", PollController.create);
pollRouter.post("/", PollController.store);
pollRouter.get("/:token", canAccessPoll, PollController.show);
pollRouter.get("/:token/edit", canChangePoll, PollController.edit);
pollRouter.put("/:token", canChangePoll, PollController.update);
pollRouter.delete("/:token", canChangePoll, PollController.destroy);
pollRouter.post("/:token/delete", canChangePoll, PollController.destroy);

voteRouter.post("/:token", canAccessPoll, VoteController.store);
voteRouter.get("/:token", canChangeVote, VoteController.show);
voteRouter.put("/:token", canChangeVote, VoteController.update);
voteRouter.delete("/:token", canChangeVote, VoteController.destroy);
voteRouter.post("/:token/delete", canChangeVote, VoteController.destroy);

export default lack;
