"use strict";

import { Router } from "express";
import apiLack from "./api-lack.js";

const router = Router();

router.use(apiLack);

export default router;
