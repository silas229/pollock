"use strict";

import { Router } from "express";
import lack from "./pollack.js";
import lock from "./pollock.js";

const router = Router();
const frontend = Router();

frontend.get("/", (req, res) => {
  res.render("create", {
    title: "New Poll",
  });
});

router.use(lack);
router.use(lock);
router.use(frontend);

export default router;
