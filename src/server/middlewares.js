"use strict";

import User from "./models/User.js";
import Response from "./responses/Response.js";
import Nedb from "@seald-io/nedb";

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (!req.header("Accept") || req.header("Accept") === "application/json") {
    return validateApiKey(req, res, next);
  } else {
    if (req.session && req.session.user) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated, redirect to login page
      res.redirect("/login");
    }
  }
};

export const validateApiKey = (req, res, next) => {
  const apiKey = req.header("API-KEY");

  console.log(apiKey);

  if (!apiKey) {
    return res.status(401).json(Response.messages[401]);
  }

  // Check if the API key exists in the database
  User.apiKeyDB.findOne({ _id: apiKey }, (err, doc) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!doc) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // API key is valid, proceed to the next middleware
    next();
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
