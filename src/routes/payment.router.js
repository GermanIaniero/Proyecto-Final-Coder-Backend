import { Router } from "express";
import {
  creacteCheckoutSession,
  paymentCancel,
  paymentSuccess,
} from "../controllers/payment.controller.js";
import { authorizationRol, authorizationStrategy } from "../utils.js";

const router = Router();

router.post("/createCheckoutSession/:cid", creacteCheckoutSession);

router.get(
  "/success/:cid",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Premium", "Usuario"]),
  paymentSuccess
);

router.get("/cancel/:cid", paymentCancel);

export default router;