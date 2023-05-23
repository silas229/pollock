"use strict";

import { Router } from "express";
import Poll from "./models/Poll.js";
import Vote from "./models/Vote.js";
import Validator from "validatorjs";
import { baseUrl } from "./main.js";
import PollResponse from "./responses/PollResponse.js";
import VoteResponse from "./responses/VoteResponse.js";
import Response from "./responses/Response.js";
import { authorizeByCredentials, isAuthenticated } from "./middlewares.js";
import User from "./models/User.js";
import UserResponse from "./responses/UserResponse.js";
import PollLockResponse from "./responses/PollLockResponse.js";
import CredentialsError from "./errors/CredentialsError.js";

const lock = Router(),
  pollRouter = Router(),
  voteRouter = Router(),
  userRouter = Router();

lock.use(PollLockResponse.base, pollRouter);
lock.use("/poll/null", pollRouter);
lock.use("/vote/lock", voteRouter);
lock.use("/user", userRouter);

// Validator.useLang("de");

pollRouter.post("/", isAuthenticated, async (req, res) => {
  try {
    req.body.owner = req.user.name;
    if (req.body.users) {
      req.body.users = req.body.users.map((u) => u.name);
    }

    Validator.register(
      "poll_number_of_voices",
      (value) => {
        return value <= req.body.options.length;
      },
      "The number of votes may not be higher than the number of options.",
    );

    const validation = new Validator(req.body, Poll.lock_rules);

    if (validation.fails()) {
      res
        .status(405)
        .json(
          Object.assign(
            { errors: validation.errors.all() },
            PollResponse.messages[405],
          ),
        );
      // Alternatively:
      // throw new Error("Validation Error");

      return;
    }

    new Poll(req.body).save().then((poll) =>
      res.json({
        admin: {
          link: `${baseUrl + req.originalUrl}/${poll.admin_token}/edit`,
          value: poll.admin_token,
        },
        share: {
          link: `${baseUrl + req.originalUrl}/${poll._id}`,
          value: poll._id,
        },
      }),
    );
  } catch (e) {
    console.log(e);
    res.status(405).json(PollResponse.messages[405]);
  }
});

pollRouter.get("/:token", async (req, res) => {
  try {
    const poll = await Poll.getByToken(req.params.token);

    if (!poll.is_open) {
      res.status(410).json(PollLockResponse.messages[410]);
      return;
    }

    console.log(req.header("Accept"));
    if (!req.header("Accept") || req.header("Accept") === "application/json") {
      return await PollLockResponse.generate(poll).then((r) => res.json(r));
    }

    let votes = await poll.votes;
    votes = await votes.map((v) => {
      v.choice = v.choice.map((c) => {
        c.text = poll.options.find((o) => o.id === c.id).text;
        return c;
      });
      return v;
    });

    res.render("show", {
      title: poll.title,
      poll: poll,
      votes: votes,
    });
  } catch (e) {
    res.status(404).json(PollLockResponse.messages[404]);
  }
});

pollRouter.put("/:token", isAuthenticated, async (req, res) => {
  try {
    const admin_token = req.params.token;
    let poll = await Poll.getByAdminToken(admin_token);

    try {
      Object.assign(poll, req.body);
      const validation = new Validator(poll, Poll.rules);

      if (validation.fails()) {
        res
          .status(405)
          .json(
            Object.assign(
              { errors: validation.errors.all() },
              PollResponse.messages[405],
            ),
          );

        return;
      }

      poll.save().then(() => res.json(PollResponse.messages[200]));
    } catch (e) {
      res.status(405).json(PollResponse.messages[405]);
    }
  } catch (e) {
    res.status(404).json(PollResponse.messages[404]);
  }
});

pollRouter.delete("/:token", isAuthenticated, async (req, res) => {
  try {
    const admin_token = req.params.token;
    const poll = await Poll.getByAdminToken(admin_token);

    poll.delete();

    res.status(200).json(PollResponse.messages[200]);
  } catch (e) {
    res.status(404).json(PollResponse.messages[404]);
  }
});

voteRouter.post("/:token", async (req, res) => {
  try {
    const poll = await Poll.getByToken(req.params.token);

    try {
      Validator.register(
        "poll_valid_option",
        (value) => {
          return poll.options.find((o) => o.id === value);
        },
        "Choice :attribute is not a valid option for this poll.",
      );

      Validator.register(
        "poll_worst_allowed",
        (value) => !value || poll.setting.worst === true,
        "'Worst' is not allowed for this poll.",
      );

      const validation = new Validator(req.body, Vote.rules);

      if (validation.fails()) {
        res
          .status(405)
          .json(
            Object.assign(
              { errors: validation.errors.all() },
              VoteResponse.messages[405],
            ),
          );
        // Alternatively: (to hide errors and comply to spec)
        // throw new Error("Validation Error");

        return;
      }

      req.body.poll_token = poll.token;

      new Vote(req.body).save().then((vote) =>
        res.json({
          edit: {
            link: VoteResponse.getLink(vote._id),
            value: vote._id,
          },
        }),
      );
    } catch (e) {
      res.status(405).json(VoteResponse.messages[405]);
    }
  } catch (e) {
    res.status(404).json(PollResponse.messages[404]);
  }
});

voteRouter.get("/:token", async (req, res) => {
  try {
    const vote = await Vote.getByToken(req.params.token);

    if (req.header("accept") === "text/html") {
      // TODO: Send html
    }

    await vote.response.then((r) => res.json(r));
  } catch (e) {
    res.status(404).json(VoteResponse.messages[404]);
  }
});

voteRouter.put("/:token", async (req, res) => {
  try {
    const vote = await Vote.getByToken(req.params.token);
    const poll = await vote.poll;

    try {
      Validator.register(
        "poll_valid_option",
        (value) => {
          return poll.options.find((o) => o.id === value);
        },
        "Choice :attribute is not a valid option for this poll.",
      );

      Validator.register(
        "poll_worst_allowed",
        (value) => !value || poll.setting.worst === true,
        "'Worst' is not allowed for this poll.",
      );

      Object.assign(vote, req.body);
      const validation = new Validator(vote, Vote.rules);

      if (validation.fails()) {
        res
          .status(405)
          .json(
            Object.assign(
              { errors: validation.errors.all() },
              VoteResponse.messages[405],
            ),
          );
        // Alternatively: (to hide errors and comply to spec)
        // throw new Error("Validation Error");

        return;
      }

      vote.save().then(() => res.json(VoteResponse.messages[200]));
    } catch (e) {
      res.status(405).json(VoteResponse.messages[405]);
    }
  } catch (e) {
    res.status(404).json(VoteResponse.messages[404]);
  }
});

voteRouter.delete("/:token", async (req, res) => {
  try {
    const token = req.params.token;
    const vote = await Vote.getByToken(token);

    vote.delete();

    res.status(200).json(VoteResponse.messages[200]);
  } catch (e) {
    res.status(404).json(VoteResponse.messages[404]);
  }
});

userRouter.post("/", async (req, res) => {
  try {
    const validation = new Validator(req.body, User.rules);

    if (validation.fails()) {
      res
        .status(405)
        .json(
          Object.assign(
            { errors: validation.errors.all() },
            Response.messages[405],
          ),
        );
      // Alternatively: (to hide errors and comply to spec)
      // throw new Error("Validation Error");
    }

    if (await User.exists(req.body.name)) {
      // Return 400 if already exists
      return res.status(400).json(UserResponse.messages[400]);
    }

    req.body.lock = true;
    req.body.password = await User.passwordHash(req.body.password);

    const user = new User(req.body);
    user.save();

    return res.json((await user.createApiToken())._id);
  } catch (e) {
    console.error(e);
    res.status(405).json(Response.messages[405]);
  }
});

userRouter.post("/key", async (req, res) => {
  try {
    const user = await User.getByCredentials(req.body.name, req.body.password);
    return res.json((await user.createApiToken())._id);
  } catch (e) {
    return res.status(401).json(Response.messages[401]);
  }
});

userRouter.get("/:name", async (req, res) => {
  try {
    const user = await User.getByName(req.params.name, true);

    await user.response.then((r) => res.json(r));
  } catch (e) {
    return res.status(404).json(UserResponse.messages[404]);
  }
});

userRouter.delete("/:name", isAuthenticated, async (req, res) => {
  try {
    const user = await User.getByName(req.params.name, true);

    await user.delete();
    return res.status(200).json(UserResponse.messages[200]);
  } catch (e) {
    return res.status(400).json(UserResponse.messages[404]);
  }
});

export default lock;
