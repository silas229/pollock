"use strict";

import Vote from "../../models/Vote.js";
import Validator from "validatorjs";
import VoteResponse from "../../responses/VoteResponse.js";

export default class VoteController {
  static async store(req, res) {
    try {
      const poll = req.poll;

      if (res.locals.user) {
        req.body.owner = res.locals.user.name;
      } else if (req.body?.owner?.name) {
        req.body.owner = req.body.owner.name;
      }

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
  }

  static async show(req, res) {
    try {
      const vote = req.vote;

      if (req.expectsJson) {
        return await vote.response.then((r) => res.json(r));
      }

      const poll = await vote.poll;

      return res.render("vote", {
        vote: vote,
        poll: poll,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json(VoteResponse.messages[500]);
    }
  }

  static async update(req, res) {
    try {
      const vote = req.vote;
      const poll = await vote.poll;

      if (res.locals.user) {
        req.body.owner = res.locals.user.name;
      } else if (req.body?.owner?.name) {
        req.body.owner = req.body.owner.name;
      }

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
  }

  static async destroy(req, res) {
    try {
      const token = req.params.token;
      const vote = await Vote.getByToken(token);

      vote.delete();

      res.status(200).json(VoteResponse.messages[200]);
    } catch (e) {
      res.status(404).json(VoteResponse.messages[404]);
    }
  }
}
