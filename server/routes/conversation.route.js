import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getOrCreateConversation,
  listMyConversations,
  getInstructorConversations
} from "../controller/conversation.controller.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", getOrCreateConversation);
router.get("/", listMyConversations);


router.get(
  "/instructor",
  isAuthenticated,
  getInstructorConversations
);


export default router;
