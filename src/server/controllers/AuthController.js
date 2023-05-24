"use strict";

import User from "../models/User.js";

export default class AuthController {
  static async login(req, res) {
    res.render("auth/login", {
      title: "Login",
    });
  }
  static async authenticate(req, res) {
    try {
      const user = await User.getByCredentials(
        req.body.name,
        req.body.password,
      );

      req.session.user = user.name;
      req.session.save();
      res.redirect("/");
    } catch (e) {
      console.error(e);
    }
  }
  static async register(req, res) {
    res.render("auth/register", {
      title: "Register",
    });
  }
  static async logout(req, res) {
    req.session.destroy();
    res.redirect("/");
  }
}
