import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  country: String,
  service: String,
  operator: String,
  providerPrice: Number,
  sellPrice: Number,
  status: { type: String, default: "pending" }, // pending, success, failed
  providerResponse: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", OrderSchema);
