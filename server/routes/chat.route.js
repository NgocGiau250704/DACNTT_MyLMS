import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { initChat } from "../controller/chat.controller.js";

const router = express.Router();

router.get("/init", isAuthenticated, initChat);

export default router;
