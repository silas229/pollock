"use strict";

import { Router } from "express";

import { isAuthenticated, canChangeUser } from "../middlewares.js";
import UserController from "../controllers/UserController.js";

const user = new Router();

user.post("/", UserController.store);
user.post("/key", isAuthenticated, UserController.key);
user.get("/:name", UserController.show);
user.delete("/:name", [isAuthenticated, canChangeUser], UserController.destroy);

export default user;
