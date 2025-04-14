import mongoose, { InferSchemaType } from "mongoose";

const menuItemSchema = new mongoose.Schema({
  // _id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   default: () => new mongoose.Types.ObjectId(),
  // },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export type MenuItemType = InferSchemaType<typeof menuItemSchema>;

const barSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  barName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  drinks: [{ type: String, required: true }],
  menuItems: [menuItemSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
});

const Bar = mongoose.model("Bar", barSchema);
export default Bar;