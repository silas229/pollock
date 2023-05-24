"use strict";

import LackPollController from "../lack/PollController.js";
import Poll from "../../models/Poll.js";
import Validator from "validatorjs";
import { baseUrl } from "../../main.js";
import PollResponse from "../../responses/PollResponse.js";

export default class PollController extends LackPollController {
  static async create(req, res) {
    res.render("poll/lock/create", {
      title: "New Poll",
    });
  }

  static async store(req, res) {
    try {
      req.body.owner = res.locals.user.name;
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
  }

  static async edit(req, res) {
    try {
      const poll = req.poll;

      res.render("poll/lock/edit", {
        title: "Edit: " + poll.title,
        admin_token: req.params.token,
        poll: poll,
      });
    } catch (e) {
      res.status(500).json(PollResponse.messages[500]);
    }
  }

  static async update(req, res) {
    try {
      req.body.owner = res.locals.user.name;
      let poll = req.poll;
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
  }
}
