"use strict";

import { Router } from "express";
import apiLack from "./pollack.js";

const router = Router();
const frontend = Router();

frontend.get("/", (req, res) => {
  res.render("index", {
    title: "Test",
  });
});

router.use(apiLack);
router.use(frontend);

export default router;
