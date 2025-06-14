import express from "express";
import { jwtParse } from "../middleware/auth";
import Favorite from "../models/favorite";
import Bar from "../models/bar";
import mongoose from "mongoose";

const router = express.Router();

router.post("/:barId", jwtParse, async (req, res) => {
  try {
    const barId = req.params.barId;
    const userId = req.userId;

    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ message: "Bar not found" });
    }

    const existingFavorite = await Favorite.findOne({ user: userId, bar: barId });
    if (existingFavorite) {
      return res.status(400).json({ message: "Bar already in favorites" });
    }

    const favorite = new Favorite({
      user: userId,
      bar: barId,
    });

    await favorite.save();
    res.status(201).json({ message: "Bar added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Error adding to favorites" });
  }
});

router.delete("/:barId", jwtParse, async (req, res) => {
  try {
    const barId = req.params.barId;
    const userId = req.userId;

    const result = await Favorite.findOneAndDelete({ user: userId, bar: barId });
    
    if (!result) {
      return res.status(404).json({ message: "Favorite not found" });
    }

    res.status(200).json({ message: "Bar removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Error removing from favorites" });
  }
});


router.get("/", jwtParse, async (req, res) => {
  try {
    const userId = req.userId;

    const favorites = await Favorite.find({ user: userId })
      .populate("bar")
      .sort({ createdAt: -1 });

    const favoriteBars = favorites.map((favorite) => favorite.bar).filter(bar => bar !== null);
    
    res.status(200).json(favoriteBars);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Error fetching favorites" });
  }
});



router.get("/check/:barId", jwtParse, async (req, res) => {
  try {
    const barId = req.params.barId;
    const userId = req.userId;

    const favorite = await Favorite.findOne({ user: userId, bar: barId });
    
    res.status(200).json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Error checking favorite status:", error);
    res.status(500).json({ message: "Error checking favorite status" });
  }
});

export default router;
