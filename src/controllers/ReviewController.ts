

import { Request, Response } from "express";
import Review from "../models/review";

export const getReviews = async (req: Request, res: Response) => {
  const { barId } = req.params;

  // 1️⃣ fetch all reviews…
  const reviews = await Review.find({ bar: barId }).lean();

  // 2️⃣ compute summary statistics
  const counts = [0,0,0,0,0];  // counts[0]=#1-star, … counts[4]=#5-star
  let totalRating = 0;
  reviews.forEach(r => {
    counts[r.rating - 1]++;
    totalRating += r.rating;
  });
  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? (totalRating / totalReviews)
    : 0;

  return res.json({
    summary: {
      average: Number(avgRating.toFixed(1)),   // e.g. 4.6
      total: totalReviews,                    // e.g. 316
      counts: {
        5: counts[4],
        4: counts[3],
        3: counts[2],
        2: counts[1],
        1: counts[0],
      },
    },
    reviews,  // the raw array
  });
};

export const addReview = async (req: Request, res: Response) => {
  const { barId } = req.params;
  const { reviewer, comment, rating } = req.body;
  if (!reviewer || !comment || typeof rating !== "number") {
    return res
      .status(400)
      .json({ message: "Reviewer, comment and numeric rating are required." });
  }

  const review = new Review({ bar: barId, reviewer, comment, rating });
  await review.save();
  res.status(201).json(review);
};
 export default { getReviews, addReview };