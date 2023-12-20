import { Router } from "express";
import {
  loginUser,
  registerUser,
  getUserCurrent,
  verificarUser,
  resetearPassword,
  resetPasswordForm,
  restart,
  validPassword,
  getProfile,
  logoutUser,
  resetPassword,
  loginGithub
} from "../controllers/session.controllers.js";
import {
  authorizationRol,
  authorizationStrategy,
  extractNonSensitiveUserInfo,
} from "../utils/utils.js";
import passport from "passport";
const router = Router();

router.post("/login",passport.authenticate("login", { failureRedirect: "/login" }), loginUser);

router.post("/register", 
passport.authenticate("register", { failureRedirect: "/register" }),
registerUser);

router.get(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  logoutUser
);

router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getProfile
);

router.get("/verify/:token", verificarUser);

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  getUserCurrent
);

router.get(
  "/currentUser",
  authorizationStrategy("jwt", { session: false }),
  authorizationRol(["Usuario", "Admin", "Premium"]),
  extractNonSensitiveUserInfo,
  (req, res) => {
    if (req.nonSensitiveUserInfo) {
      res.send({ status: "success", payload: req.nonSensitiveUserInfo });
    } else {
      res.status(401).send({ error: "No autorizado" });
    }
  }
);

router.get("/resetPassword", resetearPassword);

router.post("/resetPassConfirm", resetPassword);

router.post("/restart", restart);

router.get("/resetPasswordForm/:token", resetPasswordForm);

router.post("/validPassword", validPassword);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  loginGithub
);

export default router;
