import { model, models, Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      required: true,
      enum: ["kg", "g", "L", "mL", "unit"],
    },
  },
  { versionKey: false },
);

export const Product = models.Product || model("Product", ProductSchema);
