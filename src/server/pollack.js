"use strict";

import { Router } from "express";
import Poll from "./models/Poll.js";
import Vote from "./models/Vote.js";
import Validator from "validatorjs";
import { baseUrl } from "./main.js";
import PollResponse from "./responses/PollResponse.js";
import VoteResponse from "./responses/VoteResponse.js";

const lack = Router(),
  pollRouter = Router(),
  voteRouter = Router();

lack.use(PollResponse.base, pollRouter);
lack.use(VoteResponse.base, voteRouter);

// Validator.useLang("de");

pollRouter.get("/create", (req, res) => {
  res.render("create", {
    title: "New Anonymous Poll",
  });
});

pollRouter.get("/:token/edit", async (req, res) => {
  try {
    const poll = await Poll.getByAdminToken(req.params.token);

    res.render("edit", {
      title: "Edit: " + poll.title,
      admin_token: req.params.token,
      poll: poll,
    });
  } catch (e) {
    res.status(404).json(PollResponse.messages[404]);
  }
});

pollRouter.post("/", async (req, res) => {
  try {
    console.log(req.body);

    Validator.register(
      "poll_number_of_voices",
      (value) => {
        return value <= req.body.options.length;
      },
      "The number of votes may not be higher than the number of options.",
    );

    const validation = new Validator(req.body, Poll.rules);

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
    res.status(405).json(PollResponse.messages[405]);
  }
});

pollRouter.get("/:token", async (req, res) => {
  try {
    const poll = await Poll.getByToken(req.params.token);

    if (!poll.is_open) {
      res.status(410).json(PollResponse.messages[410]);
      return;
    }

    console.log(req.header("Accept"));
    if (!req.header("Accept") || req.header("Accept") === "application/json") {
      await poll.response.then((r) => res.json(r));
      return;
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
    console.error(e);
    res.status(404).json(PollResponse.messages[404]);
  }
});

pollRouter.put("/:token", async (req, res) => {
  try {
    const admin_token = req.params.token;
    let poll = await Poll.getByAdminToken(admin_token);

    try {
      Object.assign(poll, req.body);
      const validation = new Validator(poll, Poll.rules);

      Validator.register(
        "poll_number_of_voices",
        (value) => {
          return value <= req.body.options.length;
        },
        "The number of votes may not be higher than the number of options.",
      );

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
      console.error(e);
      res.status(405).json(PollResponse.messages[405]);
    }
  } catch (e) {
    res.status(404).json(PollResponse.messages[404]);
  }
});

pollRouter.delete("/:token", async (req, res) => {
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
    console.error(e);
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

export default lack;
