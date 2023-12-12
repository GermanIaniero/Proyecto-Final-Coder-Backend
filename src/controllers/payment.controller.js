import Stripe from "stripe";
//import { STRIPE_PRIVATE_KEY } from "../config/config.js";
import { paymentService } from "../services/index.js";

export const creacteCheckout = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    const session = await paymentService.creacteCheckout(ticketId);
    return res.redirect(session.url);
  } catch (e) {
    return res.send({ error: "error", message: "Ya ha sido pagado el ticket" });
  }
};

export const sucessPayment = async (req, res) => {
  try {
    const ticketId = req.query.ticketId;
    const succes = await paymentService.sucessPayment(ticketId);
    return res.render("sucess", succes);
  } catch (e) {
    throw e;
  }
};

export const CancellPayment = async (req, res) => {
  try{
    const ticketId = req.query.ticketId;
    const sucess = await paymentService.cancellPayment(ticketId);
    return res.redirect("/api/products");
  }catch(e){
    throw e;
  }
};