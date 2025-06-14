
import mongoose from "mongoose";

const drinkItemSchema = new mongoose.Schema({
  bar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bar',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Beer', 'Wine', 'Cocktail', 'Spirit', 'Non-Alcoholic', 'Special']
  },
  imageUrl: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false
  },
  ingredients: {
    type: [String],
    default: []
  },
  alcoholPercentage: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for bar and name to ensure uniqueness
drinkItemSchema.index({ bar: 1, name: 1 }, { unique: true });

const DrinkItem = mongoose.model('DrinkItem', drinkItemSchema);

export default DrinkItem;
