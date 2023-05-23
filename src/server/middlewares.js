"use strict";

import Poll from "./models/Poll.js";
import Vote from "./models/Vote.js";
import User from "./models/User.js";
import Response from "./responses/Response.js";
import PollResponse from "./responses/PollResponse.js";
import VoteResponse from "./responses/VoteResponse.js";
import UserResponse from "./responses/UserResponse.js";

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  if (res.locals.user) {
    next();
  } else {
    if (req.expectsJson) {
      return res.status(401).json(Response.messages[401]);
    } else {
      res.redirect("/poll/lack/create");
    }
  }
};

export const validateApiKey = (req, res, next) => {
  const apiKey = req.header("API-KEY");

  if (!apiKey) {
    return res.status(401).json(Response.messages[401]);
  }

  // Check if the API key exists in the database
  User.apiKeyDB.findOne({ _id: apiKey }, async (err, doc) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!doc) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    try {
      res.locals.user = await User.getByName(doc.user, true);

      // API key is valid, proceed to the next middleware
      next();
    } catch (e) {
      return res.status(400).json(UserResponse.messages[400]);
    }
  });
};

export const authorizeByCredentials = async (req, res, next) => {
  try {
    User.getByCredentials(req.body.name, req.body.password);
    next();
  } catch (e) {
    return res.status(401).json(Response.messages[401]);
  }
};

export const checkAcceptsHeader = async (req, res, next) => {
  const apiTypes = ["application/json", "*/*"];
  req.expectsJson =
    !req.header("Accept") || apiTypes.includes(req.header("Accept"));

  next();
};

export const getUser = async (req, res, next) => {
  // By API key
  if (req.expectsJson && req.header("API-KEY")) {
    const doc = await User.apiKeyDB.findOneAsync({
      _id: req.header("API-KEY"),
    });
    try {
      if (doc) {
        res.locals.user = await User.getByName(doc.user, true);
      }
    } catch {}
  }

  // By session
  else if (req.session && req.session.user) {
    try {
      res.locals.user = await User.getByName(req.session.user);
    } catch (e) {
      res.locals.user = null;
    }
  }

  // By credentials in body
  else if (req.body.name && req.body.password) {
    try {
      res.locals.user = await User.getByCredentials(
        req.body.name,
        req.body.password,
      );
    } catch {}
  }

  // Not logged in
  else {
    res.locals.user = null;
  }

  next();
};

export const canAccessPoll = async (req, res, next) => {
  try {
    const poll = await Poll.getByToken(req.params.token);

    if (!poll.is_open) {
      res.status(410).json(PollResponse.messages[410]);
      return;
    }

    if (poll.visibility == "lock") {
      if (poll.users.length > 0) {
        if (
          res.locals.user.name != poll.owner &&
          !poll.users.includes(res.locals.user.name)
        ) {
          return res.status(403).json(PollResponse.messages[403]);
        }
      }
    }

    req.poll = poll;
    next();
  } catch {
    res.status(404).json(PollResponse.messages[404]);
  }
};

export const canChangePoll = async (req, res, next) => {
  try {
    const poll = await Poll.getByAdminToken(req.params.token);

    // Not needed because admin token is used
    // if (poll.owner !== res.locals.user.name && !poll.users.includes(res.locals.user.name)) {
    //   return res.status(403).json(PollResponse.messages[403]);
    // }

    req.poll = poll;
    next();
  } catch {
    res.status(404).json(PollResponse.messages[404]);
  }
};

export const canChangeVote = async (req, res, next) => {
  try {
    const vote = await Vote.getByToken(req.params.token);

    // Not needed because secret token is used
    // if (vote.owner !== res.locals.user.name) {
    //   return res.status(403).json(VoteResponse.messages[403]);
    // }

    req.vote = vote;
    next();
  } catch {
    res.status(404).json(VoteResponse.messages[404]);
  }
};

export const canChangeUser = async (req, res, next) => {
  if (!res.locals.user || res.locals.user.name !== req.params.name) {
    return res.status(403).json(UserResponse.messages[403]);
  }

  next();
};
