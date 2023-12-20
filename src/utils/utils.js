import { faker } from "@faker-js/faker/locale/es";
import {fileURLToPath} from 'url'
import { dirname } from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import passport from "passport";
import { productService } from "../services/index.js";
import multer from "multer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const createHash = (password) => {
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password); // true o false
};

export const generateToken = (user) => {
  return jwt.sign({ user }, config.PRIVATE_KEY, {
    expiresIn: "24h"});
};

export const generateTokenPass = (user) => {
  return jwt.sign({ user }, config.secret_jwt, { expiresIn: "12h" });
};

export const extractCookie = (req) => {
  return req && req.cookies ? req.cookies[config.SECRET_COOKIE] : null;
};


export const authorizationStrategy = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.status(401).send({
          error: info.messages ? info.messages : info.toString(),
        });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};

export const authorizationRol = (validRoles) => {
  return async (req, res, next) => {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "No autorizado" });

    if (validRoles.includes(user.user.roles)) {
      next();
    } else {
      res.status(403).send({ error: "Usuario no autorizado" });
    }
  };
};


export const generateUser = () => {
  const numOfProducts = faker.number.int({ max: 10 });

  const products = [];
  for (let i = 0; i < numOfProducts; i++) {
    products.push(generateProduct());
  }

  return {
    name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    birthDate: faker.date.birthdate(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    sex: faker.person.sex(),
    products,
  };
};

const generateProduct = () => {
  return {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    category: faker.commerce.department(),
    stock: faker.number.int({ max: 100 }),
    id: faker.database.mongodbObjectId(),
    image: faker.image.urlLoremFlickr(),
  };
};

export const authorizationProduct = async (req, res, next) => {
  const id = req.params.pid;
  const { email, roles } = req.user.user;

  const product = await productService.getProductById(id);

  if (roles === "Admin") {
    console.log("Producto eliminado por Administrador");
    return next();
  } else if (product.owner === email && roles === "Premium") {
    console.log("Producto eliminado por usuario Premium");
    return next();
  } else {
    console.log("No tienes permisos");
    res.status(403).send({ status: "No tienes permisos" });
  }
};

// Limita add products al carrito para usuarios Premium
export const authorizationAddToCart = async (req, res, next) => {
  const id = req.params.pid;
  const { email, roles } = req.user.user;

  const product = await productService.getProductById(id);

  if (roles === "Premium" && product.owner === email) {
    console.log("User Premium no puede agregar su propio producto al carrito");
    return res
      .status(403)
      .send({ status: "No puedes agregar tu propio producto al carrito." });
  }

  next();
};

export const extractNonSensitiveUserInfo = (req, res, next) => {
  if (req.user) {
    const { first_name, last_name, email, age, cart } = req.user.user;
    req.nonSensitiveUserInfo = { first_name, last_name, email, age, cart };
  }
  next();
};

export const authorization = (rol) => {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "Unauthorized" });
    if (user.user.rol != rol)
      return res.status(403).send({ error: "No permission" });
    return next();
  };
};

export const generateProducts = () => {
  return {
    title: faker.commerce.productName(),
    price: faker.commerce.price(),
    description: faker.commerce.productDescription(),
    stock: faker.number.int({min: 1}),
    id: faker.database.mongodbObjectId(),
    code: faker.number.hex({ min: 100, max: 65535 }),
    thumbnail: faker.image.urlLoremFlickr({ category: "nature" }),
  };
};

export const handleError = (code, res) => {
  const message = code || "Error desconocido";
  res.status(500).json({ error: message });
};

export const upload = (type) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath = `${__dirname}/public/`;

      switch (type) {
        case "profile":
          uploadPath += "files/profiles/";
          break;
        case "product":
          uploadPath += "files/products/";
          break;
        case "document":
          uploadPath += "files/documents/";
          break;
        default:
          return cb(new Error("Invalid fileType"));
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  return multer({ storage }).array("files", 5);
};
