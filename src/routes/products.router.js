import { Router } from "express";
import {
  addProduct,
  getProductsRealTime,
  updateProducts,
  deleteProducts,
  getProducts,
  getProductByID
} from "../controllers/products.controller.js";
import {
  authorizationRol,
  authorizationStrategy,
  extractNonSensitiveUserInfo,
} from "../utils/utils.js";
import passport from "passport";

const router = Router();

router.post("/", passport.authenticate("jwt", { session: false }), authorizationRol(["Premium", "Admin"]), 
addProduct);

router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  updateProducts
);
router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  deleteProducts
);

router.get(
  "/realtimeProducts",
  passport.authenticate("jwt", { session: false }),
  getProductsRealTime
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getProducts
);

router.get(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  getProductByID
);

export default router;
