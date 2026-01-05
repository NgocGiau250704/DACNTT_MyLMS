import express from "express";
import { listMessages } from "../controller/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// router.use(isAuthenticated);

router.get("/:conversationId", listMessages);

export default router;
