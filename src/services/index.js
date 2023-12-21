import {
  User,
  Product,
  Cart,
  Ticket,
} from "../DAO/factory.js";

import UserRepository from "./users.repository.js";
import ProductRepository from "./products.repository.js";
import CartRepository from "./carts.repository.js";
import TicketRepository from "./tickets.repository.js";
import PaymentRepository from "./payments.repository.js";

export const userService = new UserRepository(new User());
export const productService = new ProductRepository(new Product());
export const cartService = new CartRepository(new Cart());
export const ticketService = new TicketRepository(new Ticket());
export const paymentService = new PaymentRepository();
