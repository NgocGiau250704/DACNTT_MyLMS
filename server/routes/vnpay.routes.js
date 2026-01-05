// server/routes/vnpay.routes.js
import express from "express";
import {
  createVnpayPayment,
  confirmVnpayPayment,
} from "../controller/vnpay.controller.js";

const router = express.Router();

router.post("/vnpay/create", createVnpayPayment);
router.post("/vnpay/confirm", confirmVnpayPayment);

export default router;
