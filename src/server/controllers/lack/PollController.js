"use strict";

import Poll from "../../models/Poll.js";
import Validator from "validatorjs";
import { baseUrl } from "../../main.js";
import PollResponse from "../../responses/PollResponse.js";

export default class PollController {
  static async create(req, res) {
    res.render("lack/poll/create", {
      title: "New Anonymous Poll",
    });
  }

  static async store(req, res) {
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
  }

  static async show(req, res) {
    try {
      const poll = await Poll.getByToken(req.params.token);

      if (!poll.is_open) {
        res.status(410).json(PollResponse.messages[410]);
        return;
      }

      if (req.expectsJson) {
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

      res.render("lack/poll/show", {
        title: poll.title,
        poll: poll,
        votes: votes,
      });
    } catch (e) {
      console.error(e);
      res.status(404).json(PollResponse.messages[404]);
    }
  }

  static async edit(req, res) {
    try {
      const poll = await Poll.getByAdminToken(req.params.token);

      res.render("lack/poll/edit", {
        title: "Edit: " + poll.title,
        admin_token: req.params.token,
        poll: poll,
      });
    } catch (e) {
      res.status(404).json(PollResponse.messages[404]);
    }
  }

  static async update(req, res) {
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
  }

  static async destroy(req, res) {
    try {
      const admin_token = req.params.token;
      const poll = await Poll.getByAdminToken(admin_token);

      poll.delete();

      res.status(200).json(PollResponse.messages[200]);
    } catch (e) {
      res.status(404).json(PollResponse.messages[404]);
    }
  }
}
