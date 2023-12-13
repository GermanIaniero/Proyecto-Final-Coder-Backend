import CartDTO from "../DAO/DTO/carts.dto.js";
import mongoose from "mongoose";
import { v4 } from "uuid";
import CustomError from "../errors/CustomError.js";
import EErrors from "../errors/enums.js";
import {
  generateCartErrorInfo,
  generateProductsErrorInfo,
  generateTicketErrorInfo,
} from "../errors/info.js";
import moment from "moment";
import nodemailer from "nodemailer";
import config from "../config/config.js";

export default class CartRepository {
  constructor(cartDAO, userDAO, productDAO, ticketDAO) {
    this.cartDAO = cartDAO;
    this.userDAO = userDAO;
    this.productDAO = productDAO;
    this.ticketDAO = ticketDAO;
  }

  getCarts = async () => {
    return await this.dao.getCarts();
  };
  getCartById = async (cid) => {
    return await this.dao.getCartById(cid);
  };
  createCarts = async (cart) => {
    const cartToInsert = new CartDTO(cart);
    return await this.dao.createCarts(cartToInsert);
  };
  updateCarts = async (cid, cartUpdate) => {
    const cart = await this.getCartById(cid);
    if (!cart) {
      throw new Error("no existe el carrito");
    }

    return await this.dao.updateCarts(cid, cartUpdate);
  };
  purchaseCarts = async (cid, userMail) => {
    const cart = await this.getCartById(cid);
    if (!cart) {
      throw new Error("no existe el carrito");
    }
    return await this.dao.purchaseCarts(cart, userMail);
  };
  deleteOneCarts = async (cid, cartUpdate) => {
    const cart = await this.getCartById(cid);
    if (!cart) {
      throw new Error("no existe el carrito");
    }

    return await this.dao.deleteOneCarts(cid, cartUpdate);
  };
  deleteCarts = async (cid) => {
    const cart = this.getCartById(cid);
    if (!cart) {
      throw new Error("no existe el carrito");
    }

    return await this.dao.deleteCarts(cid, cart);
  };

  addProductCartByID = async (pid, quantity, user) => {
    try {
      if (user.rol === "admin") throw new Error("No authorized");
      const userBD = await this.userDAO.getUserByEmail(user.email);
      let cartId = userBD.cartId[0];
      let cart;
      if (cartId) {
        cart = await this.cartDAO.getCartById(cartId);
      } else {
        cart = await this.cartDAO.createCart();
        userBD.cartId.push(cart._id);
        await this.userDAO.updateUser(userBD._id, userBD);
        cartId = cart._id;
      }
      const product = await this.productDAO.getProductById(pid);
      if (user.rol === "premium" && product.owner === user.email) {
        CustomError.createError({
          name: "Error",
          message: "You can't buy your own products",
          code: EErrors.NOT_BUY_OWN_PRODUCTS,
          info: generateProductsErrorInfo(product),
        });
      }
      if (!product) {
        CustomError.createError({
          name: "Error",
          message: "Product not exists",
          code: EErrors.PRODUCT_NOT_EXISTS,
          info: generateProductsErrorInfo(product),
        });
      }
      const productValidate = cart.products?.find(
        (product) => product.pid._id.toString() == pid.toString()
      );
      if (productValidate) {
        productValidate.quantity += quantity;
      } else {
        cart.products.push({ pid, quantity });
        await this.cartDAO.updateCartById(cartId, cart);
      }
      await this.cartDAO.updateCartById(cartId, cart);
      await this.productDAO.updateProduct(pid, product);
      return cart;
    } catch (error) {
      throw error;
    }
  };

  deleteProductCartById = async (cid, pid) => {
    try {
      const cartId = cid.toString();
      let cart = await this.cartDAO.getCartById(cartId);
      if (cart) {
        const productValidate = cart.products.find(
          (product) => product.pid.toString() == pid.toString()
        );
        if (productValidate) {
          await this.cartDao.updateCartById(
            { _id: cid },
            { $pull: { products: { pid: pid } } }
          );
          await cart.save();
          return cart;
        }
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  };

  clearCart = async (cid, pid) => {
    try {
      const cart = await this.cartDAO.getCartById(cid);
      const products = cart.products;
      const updatedProducts = products.filter(
        (product) => product.pid._id.toString() !== pid.toString()
      );
      cart.products = updatedProducts;
      return cart; // Devuelve la instancia de carrito modificada
    } catch (error) {
      throw error;
    }
  };

  deleteProductOneCartById = async (user, pid) => {
    const userBD = await this.userDAO.getUserByEmail(user.email);
    let cart = await this.cartDAO.getCartById(userBD.cartId[0]._id);
    const product = await this.productDAO.getProductById(pid);
    if (cart) {
      const productValidate = cart.products.find(
        (product) => product.pid._id == pid
      );
      if (productValidate) {
        productValidate.quantity -= 1;
        if (productValidate.quantity == 0) {
          cart = await this.clearCart(
            userBD.cartId[0]._id,
            productValidate.pid._id
          );
          await this.cartDAO.updateCartById(userBD.cartId[0]._id, cart);
        }
        await this.cartDAO.updateCartById(userBD.cartId[0]._id, cart);
        return cart;
      }
      return null;
    } else {
      return null;
    }
  };

  deleteProductsCart = async (cid) => {
    try {
      const cart = await this.cartDAO.getCartById(cid);
      if (!cart) return null;
      await this.cartDAO.updateCartById(id, { product: [] });
      await cart.save();
    } catch (error) {
      throw error;
    }
  };

  getCartUserById = async (user) => {
    try {
      const userBD = await this.userDAO.getUserByEmail(user.email);
      let cart = userBD.cartId[0];
      if (!cart) {
        CustomError.createError({
          name: "Error",
          message: "Cart not exists",
          code: EErrors.CART_NOT_FOUND,
          info: generateCartErrorInfo(cart),
        });
      }
      const cartID = new mongoose.Types.ObjectId(cart);
      cart = await this.cartDAO.getCartById(cartID);
      let total = 0;
      cart.products.forEach((product) => {
        const subtotal = product.pid.price * product.quantity;
        product.total = subtotal;
        total = total + subtotal;
      });
      return { cart, total };
    } catch (error) {
      throw error;
    }
  };

  getTicketCartUserById = async (user) => {
    try {
      const userDB = await this.userDAO.getUserById(user);
      let { cart, total } = await this.getCartUserById(userDB);
      let products = [];
      if (cart.products.length !== 0) {
        for (const p of cart.products) {
          try {
            const product = await this.productDAO.getProductById(
              p.pid._id.toString()
            );
            if (product.stock >= p.quantity) {
              product.stock -= p.quantity;
              cart = await this.clearCart(cart._id, product._id);
              const pid = product._id;
              const quantity = p.quantity;
              products.push({ pid, quantity });
              await this.cartDAO.updateCartById(cart._id, cart);
              await this.productDAO.updateProduct(product._id, product);
            } else if (product.stock < p.quantity) {
              const stock = product.stock;
              const dif = p.quantity - stock;
              product.stock -= stock;
              p.quantity -= stock;
              total -= dif * product.price;
              const pid = product._id;
              const quantity = stock;
              products.push({ pid, quantity });
              await this.productDAO.updateProduct(product._id, product);
              await this.cartDAO.updateCartById(cart._id, cart);
            }
          } catch (e) {
            // Manejo de errores específicos para cada iteración
            throw CustomError.createError({
              name: "Error",
              message: "STOCK_NOT_AVAILABLE",
              code: EErrors.STOCK_NOT_AVAILABLE,
              info: generateCartErrorInfo(cart),
            });
          }
        }
        const ticket = {
          code: v4(),
          purchase_datetime: moment().format("YYYY-MM-DD HH:mm:ss"),
          amount: total,
          purcharser: userDB.email,
          products: products,
          status: "pending",
        };
        const ticketCreate = await this.ticketDAO.addTicket(ticket);
        const ticketId = ticketCreate._id;
        userDB.ticketId.push(ticketCreate._id);
        await this.userDAO.updateUser(userDB._id, userDB);
        return ticketCreate;
      } else {
        // Handle case where cart has no products
        CustomError.createError({
          name: "Error",
          message: "Cart not products",
          code: EErrors.NOT_PRODUCTS_TICKET,
          info: generateTicketErrorInfo(),
        });
      }
    } catch (e) {
      throw e;
    }
  };
}
