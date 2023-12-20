import { Router } from "express";
import {
  addProductCartByID,
  deleteProductOneCartById,
  getCartByUserId,
  updateProductCartById,
  getCarts,
  createCarts,
  getCartByID,
  updateCarts,
  deleteOneCarts,
  deleteCarts,
  finishPurchase
} from "../controllers/carts.controller.js";

import {
  authorizationAddToCart,
  authorizationRol,
  authorizationStrategy,
} from "../utils/utils.js";

const router = Router();

router.get("/", getCarts);

router.get("/:cid", getCartByID);

router.post("/:cid/products/:pid", 
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  authorizationAddToCart,
  updateCarts);

router.delete("/:cid/products/:pid", 
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  deleteOneCarts);

router.delete("/:cid", 
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  deleteCarts);

router.post("/", authorizationStrategy("jwt", { session: false }),
authorizationRol(["Usuario", "Premium"]), createCarts);

router.get(
  "/user",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  getCartByUserId
);

router.get(
  "/pid/:pid",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  addProductCartByID
);

router.get(
  "/delete/:pid",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  deleteProductOneCartById
);

router.put(
  "/:cid/product/:pid",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  updateProductCartById
);

router.get(
  "/:cid/purchase",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Premium"]),
  finishPurchase
);

export default router;
