
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bar:   { type: mongoose.Schema.Types.ObjectId, ref: "Bar", required: true },
    reviewer: { type: String, required: true },
    comment:  { type: String, required: true },
    rating:   { type: Number, required: true, min: 1, max: 5 },      // ← new
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
