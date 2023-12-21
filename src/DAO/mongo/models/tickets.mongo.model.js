import mongoose from "mongoose";
import shortid from "shortid";

function formatDate() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear().toString();
  const hours = now.getHours().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}`;
}

const TicketModel = mongoose.model(
  "tickets",
  new mongoose.Schema({
    code: { type: String, unique: true, default: shortid.generate, },
    purchase_datetime: {
      type: Date,
      default: formatDate,
    },
    amount: {
      type: Number,
    },
    purcharser: {
      type: String,
    },
    products: [
      {
        pid: {title: String,
          price: Number, },
        quantity: Number,
      },
    ],
    status: String,
  })
);

export default TicketModel;
