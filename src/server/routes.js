"use strict";

import { Router } from "express";
import lack from "./routers/pollack.js";
import lock from "./routers/pollock.js";
import frontend from "./routers/frontend.js";

const router = Router();

router.use(lack);
router.use(lock);
router.use(frontend);

export default router;
