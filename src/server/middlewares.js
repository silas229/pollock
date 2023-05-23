"use strict";

import User from "./models/User.js";
import Response from "./responses/Response.js";
import UserResponse from "./responses/UserResponse.js";

// Middleware to check if user is authenticated
export const isAuthenticated = async (req, res, next) => {
  if (!req.header("Accept") || req.header("Accept") === "application/json") {
    return validateApiKey(req, res, next);
  } else {
    if (req.session && res.locals.user) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated, redirect to pollack creation page
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
  req.expectsJson =
    !req.header("Accept") || req.header("Accept") === "application/json";

  next();
};

export const getUser = async (req, res, next) => {
  if (!req.session || !req.session.user) {
    res.locals.user = null;
  } else {
    try {
      res.locals.user = await User.getByName(req.session.user);
    } catch (e) {
      res.locals.user = null;
    }
  }

  next();
};
