import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  owner: {
    type: String,
    default: "Admin"
  },
});

ProductSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model("products", ProductSchema);

export default ProductModel;
