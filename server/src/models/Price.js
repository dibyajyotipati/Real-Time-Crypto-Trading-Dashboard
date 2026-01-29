import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Price", priceSchema);
