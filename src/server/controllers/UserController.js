"use strict";

import Validator from "validatorjs";
import User from "../models/User.js";
import UserResponse from "../responses/UserResponse.js";

export default class UserController {
  static async store(req, res) {
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
      await user.save();

      if (req.expectsJson) {
        return res.json((await user.createApiToken())._id);
      }

      req.session.user = user.name;
      req.session.save();
      return res.redirect("/");
    } catch (e) {
      console.error(e);
      res.status(405).json(UserResponse.messages[405]);
    }
  }

  static async key(req, res) {
    try {
      const user = await User.getByCredentials(
        req.body.name,
        req.body.password,
      );
      return res.json((await user.createApiToken())._id);
    } catch (e) {
      return res.status(401).json(UserResponse.messages[401]);
    }
  }

  static async show(req, res) {
    try {
      const user = await User.getByName(req.params.name, true);

      await user.response.then((r) => res.json(r));
    } catch (e) {
      return res.status(404).json(UserResponse.messages[404]);
    }
  }

  static async destroy(req, res) {
    try {
      const user = await User.getByName(req.params.name, true);

      await user.delete();
      return res.status(200).json(UserResponse.messages[200]);
    } catch (e) {
      return res.status(400).json(UserResponse.messages[404]);
    }
  }
}
