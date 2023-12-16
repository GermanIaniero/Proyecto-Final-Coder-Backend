import { Router } from "express";
import passport from "passport";
import { generateToken, generateProducts } from "../utils.js";
import { getProfile, loginUser, renderLogin, renderRegister } from "../controllers/session.controllers.js";
import {
  getProducts, getProductByID
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("home", {});
});

router.get("/failregister", async (req, res) => {
  res.send({ error: "failed" });
});

router.get("/register", renderRegister)
  
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getProfile
);
router.get(
  "/login-github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);
router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    console.log("Callback: ", req.user);
    const access_token = generateToken(req.user);
    res
      .cookie("keyCookieForJWT", (req.user.token = access_token), {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
      })
      .redirect("/profile");
  }
);
router.get(
  "/login-google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
  async (req, res) => {}
);
router.get(
  "/googlecallback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    const access_token = generateToken(req.user);
    res
      .cookie("keyCookieForJWT", access_token, {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
      })
      .redirect("/profile");
  }
);

router.get("/mockingproducts", async (req, res) => {
  let products = [];
  for (let i = 0; i < 100; i++) {
    products.push(generateProducts());
  }
  res.send({ status: "success", payload: products });
});

router.get("/loggerTest", (req, res) => {
  req.logger.info("Info");
  req.logger.debug("Debug");
  req.logger.http("Http");
  req.logger.error("Error");
  req.logger.fatal("Fatal");
  req.logger.warning("Warning");
  res.send("Logger testing");
});


router.get("/login", renderLogin);

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