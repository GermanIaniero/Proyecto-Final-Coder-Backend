import mongoose from "mongoose";

const UserModel = mongoose.model(
  "users",
  new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    age: Number,
    roles: {
      type: String,
      enum: ["Usuario", "Admin", "Premium"],
      default: "Usuario",
    },
    password: String,
    documents: [{
      name: String,
      fileType: String,
      reference: String
    }],
    orders: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "orders",
      },
    ],
    cartid: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "carts",
    },
    status: {
      type: String,
      default: "file not uploaded",
    },
    verificationCode: String,
    documents: [
      {
        name: String,
        reference: String,
      },
    ],
    last_connection: {
      type: String,
      default: ""
    },
    ticketId: [
      {
        tic: { type: mongoose.Schema.Types.ObjectId, ref: "tickets" },
      },
    ],
  })
);

export default UserModel;