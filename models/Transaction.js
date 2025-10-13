import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String, // deposit, purchase, refund
  amount: Number,
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Transaction", TransactionSchema);
