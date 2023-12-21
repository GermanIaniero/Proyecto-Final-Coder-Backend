import CartModel from "./models/carts.mongo.model.js";
import ProductModel from "./models/products.mongo.model.js";
//import Ticket from "./tickets.mongo.js";

export default class Cart {
  getCarts = async () => {
    return await CartModel.find();
  };
  getCartById = async (id) => {
    return await CartModel.findOne({ _id: id });
  };
  createCarts = async (cart) => {
    return await CartModel.create(cart);
  };
  updateCarts = async (cid, product) => {
    let resultDelCarrito = await CartModel.findOne({ _id: cid });
    const resultDelProducto = await ProductModel.findOne({ _id: product.pid });

    if (!resultDelProducto || !resultDelCarrito)
      return "No existe producto o carrito";

    const resultadoEncontrado = resultDelCarrito.products.find(
      (producto) => producto.pid.toString() === product.pid
    );

    if (resultadoEncontrado !== undefined) {
      resultadoEncontrado.quantity += product.quantity;
      await resultDelCarrito.save();
    } else {
      resultDelCarrito.products.push(product);
      await resultDelCarrito.save();
    }

    return resultDelCarrito;
  };

  purchaseCarts = async (cart, userMail) => {
    let totalAmount = 0;
    for (let i = 0; i < cart.products.length; i++) {
      const resultDelProducto = await ProductModel.findOne({
        _id: cart.products[i].pid,
      });

      if (resultDelProducto.stock >= cart.products[i].quantity) {
        resultDelProducto.stock =
          resultDelProducto.stock - cart.products[i].quantity;
        await resultDelProducto.save();
        totalAmount += resultDelProducto.price * cart.products[i].quantity;

        const updateCartResponse = await CartModel.updateOne(
          { _id: cart._id },
          { $pull: { products: { pid: resultDelProducto._id } } }
        );
      } else {
        totalAmount += resultDelProducto.price * resultDelProducto.stock;

        const newQuantity = cart.products[i].quantity - resultDelProducto.stock;

        const productIdToUpdate = cart.products[i].pid;

        const cartToUpdate = await CartModel.findOneAndUpdate(
          {
            _id: cart._id,
            "products.pid": productIdToUpdate,
          },
          {
            $set: {
              "products.$.quantity": newQuantity,
            },
          },
          { new: true }
        );

        resultDelProducto.stock = 0;

        await resultDelProducto.save();
      }
    }
    const ticket = new Ticket();
    const newTicket = await ticket.createTickets(totalAmount, userMail);
    return newTicket;
  };

  deleteOneCarts = async (cartId, productId) => {
    const result = await CartModel.updateOne(
      { _id: cartId },
      { $pull: { products: { pid: productId.pid } } },
      { new: true }
    );
    return result;
  };

  deleteProductAll = async (id) => {
    const result = await CartModel.updateOne(
      { _id: id },
      { $set: { products: [] } }
    );
    return result;
  };
}
