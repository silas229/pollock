"use strict";

import { Router } from "express";
import apiLack from "./api-lack.js";
import Nedb from "@seald-io/nedb";
import { dbFile } from "./server.js";

const router = Router();

export const db = new Nedb({ filename: dbFile, autoload: false }); // You can await db.autoloadPromise to catch a potential error when autoloading.
db.loadDatabase();

router.use(apiLack);

export default router;
