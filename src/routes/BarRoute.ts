
import express from "express";
import { body, param } from "express-validator";
import BarController from "../controllers/BarController";
import ReviewController from "../controllers/ReviewController";

const router = express.Router();

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  BarController.searchBar
);
router.get("/:id", BarController.getBarById);


router.get(
  "/:barId/reviews",
  param("barId").isMongoId(),
  ReviewController.getReviews
);

router.post(
  "/:barId/reviews",
  param("barId").isMongoId(),
  body("rating").isInt({ min: 1, max: 5 }),
  ReviewController.addReview
);

router.get('/', BarController.getAllBars);

export default router;
