
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  addressLine1: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "bar_owner", "admin"],
    default: "user",
  },
}, {
  timestamps: true 
});

const User = mongoose.model("User", userSchema);
export default User;