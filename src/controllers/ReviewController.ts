
import { Request, Response } from "express";
import Review from "../models/review";

export const getReviews = async (req: Request, res: Response) => {
  const { barId } = req.params;

  const reviews = await Review.find({ bar: barId }).lean();

  const counts = [0,0,0,0,0];  
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
      average: Number(avgRating.toFixed(1)),   
      total: totalReviews,                    
      counts: {
        5: counts[4],
        4: counts[3],
        3: counts[2],
        2: counts[1],
        1: counts[0],
      },
    },
    reviews,  
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