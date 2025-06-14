import express from "express";
import { jwtParse } from "../middleware/auth";
import DrinkItem from "../models/drinkItem";
import Bar from "../models/bar";

const router = express.Router();

// PUBLIC ENDPOINTS - No authentication required

// Get all drink items for a specific bar
router.get("/bar/:barId", async (req, res) => {
  try {
    const barId = req.params.barId;

    // Check if bar exists
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ message: "Bar not found" });
    }

    // Get all drink items for the bar
    const drinkItems = await DrinkItem.find({ bar: barId }).sort({ category: 1, featured: -1 });
    
    res.status(200).json(drinkItems);
  } catch (error) {
    console.error("Error fetching drink menu:", error);
    res.status(500).json({ message: "Error fetching drink menu" });
  }
});

// Get featured drink items for a specific bar
router.get("/bar/:barId/featured", async (req, res) => {
  try {
    const barId = req.params.barId;

    // Check if bar exists
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ message: "Bar not found" });
    }

    // Get featured drink items for the bar
    const featuredDrinks = await DrinkItem.find({ 
      bar: barId,
      featured: true 
    }).limit(5);
    
    res.status(200).json(featuredDrinks);
  } catch (error) {
    console.error("Error fetching featured drinks:", error);
    res.status(500).json({ message: "Error fetching featured drinks" });
  }
});

// Get drink items by category for a specific bar
router.get("/bar/:barId/category/:category", async (req, res) => {
  try {
    const { barId, category } = req.params;

    // Check if bar exists
    const bar = await Bar.findById(barId);
    if (!bar) {
      return res.status(404).json({ message: "Bar not found" });
    }

    // Get drink items by category
    const drinkItems = await DrinkItem.find({ 
      bar: barId,
      category: category 
    }).sort({ featured: -1, name: 1 });
    
    res.status(200).json(drinkItems);
  } catch (error) {
    console.error("Error fetching drinks by category:", error);
    res.status(500).json({ message: "Error fetching drinks by category" });
  }
});

// PROTECTED ENDPOINTS - Authentication required

// Add a new drink item (requires authentication)
router.post("/", jwtParse, async (req, res) => {
  try {
    const { barId, name, description, price, category, imageUrl, featured, ingredients, alcoholPercentage } = req.body;

    // Check if user owns the bar
    const bar = await Bar.findOne({ _id: barId, user: req.userId });
    if (!bar) {
      return res.status(403).json({ message: "Not authorized to add drinks to this bar" });
    }

    // Create new drink item
    const drinkItem = new DrinkItem({
      bar: barId,
      name,
      description,
      price,
      category,
      imageUrl,
      featured: featured || false,
      ingredients: ingredients || [],
      alcoholPercentage
    });

    await drinkItem.save();
    res.status(201).json(drinkItem);
  } catch (error:any) {
    console.error("Error adding drink item:", error);
    
    // Handle duplicate key error
 if (error.code === 11000) {
      return res.status(400).json({ message: "A drink with this name already exists for this bar" });
    }
    
    res.status(500).json({ message: "Error adding drink item" });
    }
  });

// Update a drink item (requires authentication)
router.put("/:drinkId", jwtParse, async (req, res) => {
  try {
    const drinkId = req.params.drinkId;
    const updates = req.body;

    // Find the drink item
    const drinkItem = await DrinkItem.findById(drinkId);
    if (!drinkItem) {
      return res.status(404).json({ message: "Drink item not found" });
    }

    // Check if user owns the bar
    const bar = await Bar.findOne({ _id: drinkItem.bar, user: req.userId });
    if (!bar) {
      return res.status(403).json({ message: "Not authorized to update this drink item" });
    }

    Object.keys(updates).forEach((key) => {
      if (key !== 'bar' && key !== '_id') { // Don't allow changing the bar or _id
        (drinkItem as any)[key] = updates[key];
      }
    });

    await drinkItem.save();
    res.status(200).json(drinkItem);
  } catch (error) {
    console.error("Error updating drink item:", error);
    res.status(500).json({ message: "Error updating drink item" });
  }
});

// Delete a drink item (requires authentication)
router.delete("/:drinkId", jwtParse, async (req, res) => {
  try {
    const drinkId = req.params.drinkId;

    // Find the drink item
    const drinkItem = await DrinkItem.findById(drinkId);
    if (!drinkItem) {
      return res.status(404).json({ message: "Drink item not found" });
    }

    // Check if user owns the bar
    const bar = await Bar.findOne({ _id: drinkItem.bar, user: req.userId });
    if (!bar) {
      return res.status(403).json({ message: "Not authorized to delete this drink item" });
    }

    // Delete the drink item
    await DrinkItem.findByIdAndDelete(drinkId);
    res.status(200).json({ message: "Drink item deleted successfully" });
  } catch (error) {
    console.error("Error deleting drink item:", error);
    res.status(500).json({ message: "Error deleting drink item" });
  }
});

export default router;
