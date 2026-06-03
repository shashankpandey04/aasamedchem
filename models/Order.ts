import mongoose, { model, Schema } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ["kg", "g", "L", "mL", "unit"] },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    userId: { type: String, required: false, index: true },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v: unknown[]) => v.length > 0, "Order must have at least one item"],
    },
    grandTotal: { type: Number, required: true, min: 0 },
    orderStatus: {
      type: String,
      required: true,
      enum: ["processing", "in transit", "shipped", "cancelled"],
      default: "processing",
    },
    invoiceStatus: {
      type: String,
      required: true,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// Always re-register so schema changes take effect without restarting the server
if (mongoose.models.Order) {
  mongoose.deleteModel("Order");
}

export const Order = model("Order", OrderSchema);
