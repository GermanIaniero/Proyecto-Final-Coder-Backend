import express from 'express'
import handlebars from 'express-handlebars'
import { Server } from "socket.io";

import usersRouter from './routes/users.router.js'
import viewsRouter from "./routes/view.router.js";
import mailingRouter from "./routes/mailing.router.js";
import mockingProducts from "./routes/mockingProducts.router.js";
import ticketsRouter from "./routes/tickets.router.js";
import cartsRouter from "./routes/carts.router.js";
import sessionRouter from "./routes/session.router.js";
import loggerTest from "./routes/loggerTest.js";
import paymentsRouter from "./routes/payment.router.js";
import productsRouter from "./routes/products.router.js";

import __dirname from "./utils.js";
import mongoose from "mongoose";
import session from 'express-session'
import MongoStore from "connect-mongo";
import initializePassport from './config/passport.config.js'
import { addLogger, logger  } from './utils/logger.js'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import config from './config/config.js'

//import { specs } from "./docs/swagger.js";
import swaggerUiExpress from 'swagger-ui-express';
import swaggerJSDoc from "swagger-jsdoc";

//Data for post JSON
const app = express()
app.use(express.json());
app.use("/static", express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
app.use(addLogger)  

// Configurar los motores de plantilla
app.engine("handlebars", handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

//Mongo session
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.DBURL,
      dbName: config.DBNAME,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: process.env.ttl,
    }),
    secret: "CoderSecret",
    resave: true,
    saveUninitialized: true,
  })
);

//Passport
initializePassport()
app.use(passport.initialize())
app.use(passport.session());
 
//Rutas
app.use("/", viewsRouter);
app.use("/", loggerTest);
app.use("/", mailingRouter);


app.use('/api', cartsRouter)
app.use('/api', productsRouter)
app.use("/api", mockingProducts);
app.use('/api', usersRouter)
app.use("/api", ticketsRouter);
app.use('/api/payments', paymentsRouter)
app.use('/api/sessions', sessionRouter)
//app.use('/api/chat', chatRouter)

//swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentacion de Ecommerce German",
      description: "Este proyecto es un Ecommerce de German",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);

app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

mongoose.set("strictQuery", false);

mongoose
  .connect(config.DBURL, { dbName: config.DBNAME })
  .then(() => {
    logger.info("DB conectada");
    const httpServer = app.listen(config.PORT, () =>
      logger.http(`✅Server escuchando in the port: ${config.PORT}`)
    );
    const io = new Server(httpServer);
    let messages = [];

    io.on("connection", (socket) => {
      socket.on("new-product", async (user) =>
        logger.info(`${user} se acaba de conectar al chat`)
      );

      socket.on("message", (data) => {
        messages.push(data);
        io.emit("logs", messages);
      });
    });
  })
  .catch((e) => {
    logger.fatal("Error al conectar la DB");
  });