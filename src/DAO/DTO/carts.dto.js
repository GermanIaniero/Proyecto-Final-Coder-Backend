export default class CartDTO {

 constructor(cart) {
    this.products = cart.products.map((product) => ({
      pid: product.pid,
      quantity: product.quantity,
    }));
  }
}