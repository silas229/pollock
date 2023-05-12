"use strict";

import { Router } from "express";
import Poll from "./models/Poll.js";
import AdminToken from "./models/AdminToken.js";
import Vote from "./models/Vote.js";
import Validator from "validatorjs";
import { db } from "./routes.js";
import { baseUrl } from "./server.js";
import PollResponse from "./responses/PollResponse.js";
import VoteResponse from "./responses/VoteResponse.js";

const apiLack = Router(),
  pollRouter = Router(),
  voteRouter = Router();

apiLack.use(PollResponse.base, pollRouter);
apiLack.use(VoteResponse.base, voteRouter);

// Validator.useLang("de");

pollRouter.post("/", (req, res) => {
  try {
    const rules = {
      title: "required|string",
      description: "string",
      options: "required|array",
      "options.*.id": "required|integer|min:0",
      "options.*.text": "required|string",
      setting: {
        voices: "integer|min:0",
        worst: "boolean",
        deadline: "date",
      },
      fixed: "array",
      "fixed.*": "integer|min:0",
    };

    const validation = new Validator(req.body, rules);

    if (validation.fails()) {
      res
        .status(405)
        .json(
          Object.assign(
            { errors: validation.errors.all() },
            PollResponse.error[405],
          ),
        );
      // Alternatively:
      // throw new Error("Validation Error");

      return;
    }

    db.insertAsync(new Poll(req.body)).then((poll) =>{

      db.insertAsync(new AdminToken(poll)).then((admin) =>
        res.json({
          admin: {
            link: `${baseUrl + req.originalUrl}/${admin._id}`,
            value: admin._id,
          },
          share: {
            link: `${baseUrl + req.originalUrl}/${poll._id}`,
            value: poll._id
          }
        })
      )
    }); 
  } catch (e) {
    console.error(e);
    res.status(405).json(PollResponse.error[405]);
  }
});

pollRouter.get("/:token", async (req, res) => {
  try {
    const poll = await Poll.getByToken(req.params.token);

    if (!poll.is_open) {
      res.status(410).json(PollResponse.error[410]);
      return;
    }

    if (req.header("accept") === "text/html") {
      // TODO: Send html
    }

    await poll.response.then((r) => res.json(r));
  } catch (e) {
    console.error(e);
    res.status(404).json(PollResponse.error[404]);
  }
});

pollRouter.delete("/:token", async (req, res) =>{
  try{
    let token = req.params.token;

    let admin = db.findOne({_id: token}, (err, adminDoc) =>{
      if(adminDoc != null){
        db.remove({_id: adminDoc.poll_id});
        db.remove({poll_token: adminDoc.poll_id}, true);
        db.remove({_id: adminDoc._id});
        res.status(200).json({
          code: "200",
          message: "i.O."
        });
      }else{
        res.status(400).json({
          code: "400",
          message: "Invalid poll admin token."
        })
        return;
      }
    });
    
  }catch(e){
    console.error(e);
    res.status(404).json(PollResponse.error[404]);
  }
});

voteRouter.post("/:token", async (req, res) => {
  try {
    const poll = await Poll.getByToken(req.params.token);

    try {
      const rules = {
        "owner.name": "required|string",
        choice: "required|array",
        "choice.*.id": "required|integer|poll_valid_option", // TODO: poll_valid_option
        "choice.*.worst": "boolean|poll_worst_allowed",
      };

      Validator.register(
        "poll_valid_option",
        (value) => {
          console.log(poll.options);

          return poll.options.find((o) => o.id === value);
        },
        "Choice :attribute is not a valid option for this poll.",
      );

      Validator.register(
        "poll_worst_allowed",
        (value) => !value || poll.setting.worst === true,
        "'Worst' is not allowed for this poll.",
      );

      const validation = new Validator(req.body, rules);

      if (validation.fails()) {
        res
          .status(405)
          .json(
            Object.assign(
              { errors: validation.errors.all() },
              VoteResponse.error[405],
            ),
          );
        // Alternatively: (to hide errors and comply to spec)
        // throw new Error("Validation Error");

        return;
      }

      req.body.poll_token = req.params.token;

      db.insertAsync(new Vote(req.body)).then((vote) =>
        res.json({
          edit: {
            link: VoteResponse.getLink(vote._id),
            value: vote._id,
          },
        }),
      );
    } catch (e) {
      console.error(e);
      res.status(405).json(VoteResponse.error[405]);
    }
  } catch (e) {
    console.error(e);
    res.status(404).json(PollResponse.error[404]);
  }
});

voteRouter.get("/:token", async (req, res) => {
  try {
    const vote = await Vote.getByToken(req.params.token);

    if (req.header("accept") === "text/html") {
      // TODO: Send html
    }

    console.log(vote);

    await vote.response.then((r) => res.json(r));
  } catch (e) {
    console.error(e);
    res.status(404).json(VoteResponse.error[404]);
  }
});

export default apiLack;
