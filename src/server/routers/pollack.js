"use strict";

import { Router } from "express";
import PollResponse from "../responses/PollResponse.js";
import VoteResponse from "../responses/VoteResponse.js";
import PollController from "../controllers/lack/PollController.js";
import VoteController from "../controllers/lack/VoteController.js";

const lack = Router(),
  pollRouter = Router(),
  voteRouter = Router();

lack.use(PollResponse.base, pollRouter);
lack.use(VoteResponse.base, voteRouter);

// Validator.useLang("de");

pollRouter.get("/create", PollController.create);

pollRouter.get("/:token/edit", PollController.edit);

pollRouter.post("/", PollController.store);

pollRouter.get("/:token", PollController.show);

pollRouter.put("/:token", PollController.update);

pollRouter.delete("/:token", PollController.destroy);

voteRouter.post("/:token", VoteController.store);

voteRouter.get("/:token", VoteController.show);

voteRouter.put("/:token", VoteController.update);

voteRouter.delete("/:token", VoteController.destroy);

export default lack;
