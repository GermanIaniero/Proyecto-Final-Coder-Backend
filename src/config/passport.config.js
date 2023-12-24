import passport from "passport";
import local from "passport-local";
import passportJWT from "passport-jwt";
//import UserModel from "../DAO/mongo/models/users.mongo.model.js"
import GitHubStrategy from "passport-github";
import GoogleStrategy from "passport-google-oauth20";
import config from "../config/config.js";
import { userService } from "../services/index.js";
import { cartService } from "../services/index.js";
import { logger } from "../utils/logger.js";
import {
  createHash,
  isValidPass,
  extractCookie,
  generateToken,
} from "../utils.js";

const LocalStrategy = local.Strategy;

const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const validarUser = async (user, profile) => {
  if (user) {
    const token = generateToken(user);
    user.token = token;
    const date = new Date();
    user.last_connection = date;
    await userService.updateUser(user._id, user);
    return user;
  }
  const date = new Date();
  const newUser = {
    first_name: profile._json.name,
    last_name: "",
    email: profile._json.email,
    age: "",
    password: "",
    cartId: [],
    rol: "user",
    status: "verified",
    verificationCode: "true",
    documents: [],
    last_connection: date,
    ticketId: [],
  };
  const result = await userService.createUsers(newUser);
  const token = generateToken(result);
  result.token = token;
};


const initPassport = () => {
  passport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([extractCookie]),
        secretOrKey: config. PRIVATE_KEY,
      },
      async (jwt_payload, done) => {
        return done(null, jwt_payload);
      }
    )
  );

  /*passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_CALLBACKURL,
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const email = profile._json.email;
          const user = await userService.getUserByEmail(email);
          const result = await validarUser(user, profile);
          return cb(null, result);
        } catch (e) {
          return cb("Error to login wuth google: " + e);
        }
      }
    )
  ); */

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        callbackURL: config.GITHUB_CALLBACKURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        logger.info(profile);
        try {
          const user = await userService.getUserByEmail(profile._json.email);
          const cart = await cartService.createCart();

          if (user) {
            const token = generateToken(user);
            user.token = token;
            logger.info("Usuario existente logueado con github");

            return done(null, user);
          } else {
            const newUser = {
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              age: 0,
              password: "",
              cart: cart._id,
              roles: "Usuario",
            };

            const result = await userService.createUser(newUser);
            logger.info("Nuevo usuario logueado con github");

            const token = generateToken(result);
            result.token = token;
            return done(null, result);
          }
        } catch (e) {
          return done("Error de login GITHUB", e);
        }
      }
    )
  );
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        const { first_name, last_name, age, email } = req.body;
        try {
          const user = await userService.getUserByEmail(username);
          if (user) {
            return done(null, false);
          }
          const cart = await cartService.createCart();
          const newUser = {
            first_name,
            last_name,
            age,
            email,
            password: createHash(password),
            cartid: cart._id,
          };
          const result = await userService.createUser(newUser);
          return done(null, result);
        } catch (e) {
          return done("Error to register " + e);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userService.getUserByEmail(username);
          if (!user) {
            console.error("User doesnt exist");
            return done(null, false);
          }

          if (!isValidPass(user, password)) {
            console.error("Password not valid");
            return done(null, false);
          }

          const payload = {
            sub: user._id,
            roles: user.roles,
          };

          const token = generateToken(payload);
          return done(null, user, { token });
        } catch (e) {
          console.log(e)
          return done("Error de login LOCAL", e);
        }
      }
    )
  );

  passport.serializeUser(async (user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userService.getUserById(id);
    done(null, user);
  });
};

export default initPassport;