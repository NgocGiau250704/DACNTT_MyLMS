import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { getMyNotifications } from "../controller/notification.controller.js";
export const router = Router();

router.get(
  "/notifications",
  getMyNotifications
);
