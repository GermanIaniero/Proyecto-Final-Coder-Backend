import winston from "winston";
//import { environment } from "./enums/ambient.enums.js";
import config from "../config/config.js"
let entorno = config.ENVIROMENT;

const customLevelsOptions = {
    levels: {
        debug: 0,
        http: 1,
        info: 2,
        warning: 3,
        error: 4,
        fatal: 5,
    },
    colors: {
        fatal: "red",
        error: "magenta",
        warning: "yellow",
        info: "blue",
        http: "green",
        debug: "white",
      },
};

export const logger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: entorno ? "debug" : "info",
            format: winston.format.combine(
                winston.format.colorize({ colors: customLevelsOptions.colors }),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({
            filename: "./error.log",
            level: "error",
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            ),
          }),
        ],
      });

export const addLogger = (req, res, next) => {
    req.logger = logger;

    req.logger.http(
        `${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`
    );
    next();
};