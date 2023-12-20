import { Router } from "express";

/*import {
  sent_email,
  sent_sms,
  sent_success,
  sent_contacto
} from "../controllers/mailing.controller.js";*/

const router = Router();

router.get("/loggerTest", (req, res) => {
  req.logger.fatal("FATAL !!");
  req.logger.error("ERROR se cayo el server");
  req.logger.warning("Esto es una advertencia");

  req.logger.info("Se llamo a esta url");
  req.logger.http("Peticion HTTP");
  req.logger.debug("1 + 1 === 2");

  res.send("Logger Testing");
});

/*router.get("/sms", sent_sms);

router.post("/sent-email", sent_email);

router.post("/sent-success", sent_success);

router.post("/sent-contacto", sent_contacto);*/

export default router;

