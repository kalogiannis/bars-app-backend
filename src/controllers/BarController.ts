
import { Request, Response } from "express";
import Bar from "../models/bar";
import Review from "../models/review";

const searchBar = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const searchQuery = (req.query.searchQuery as string) || "";
    const sortOption = (req.query.sortOption as string) || "mostReviewed";
    const page = parseInt(req.query.page as string) || 1;

    const query: any = { city: new RegExp(city, "i") };

    const cityCount = await Bar.countDocuments(query);
    if (cityCount === 0) {
      return res.status(404).json({
        data: [],
        pagination: { total: 0, page: 1, pages: 1 },
      });
    }

    if (searchQuery) {
      query.name = new RegExp(searchQuery, "i");
    }

    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    let aggregationPipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: Review.collection.name, // Link to the reviews collection
          localField: "_id", // Bar's ID
          foreignField: "bar", // Review's bar ID
          as: "reviews", // Alias for the joined reviews
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" }, // Calculate average rating
          totalReviews: { $size: "$reviews" }, // Calculate total number of reviews
        },
      },
    ];

    switch (sortOption) {
      case "rating":
        aggregationPipeline.push({ $sort: { averageRating: -1 } }); 
        break;
      case "capacity":
        aggregationPipeline.push({ $sort: { capacity: -1 } }); 
        break;
      case "mostReviewed": // New case for 'most reviewed'
        aggregationPipeline.push({ $sort: { totalReviews: -1 } }); 
        break;
      default:
        aggregationPipeline.push({ $sort: { name: 1 } }); 
    }

    // Add pagination and projection
    aggregationPipeline.push(
      { $skip: skip }, // Skip documents for pagination
      { $limit: pageSize }, // Limit documents per page
      {
        $project: {
          reviews: 0, // Exclude the raw reviews array from the final output
          __v: 0, // Exclude the version key
        },
      }
    );

    // Execute aggregation and count documents concurrently
    const [bars, total] = await Promise.all([
      Bar.aggregate(aggregationPipeline),
      Bar.countDocuments(query),
    ]);

    res.json({
      data: bars,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching bars" });
  }
};

export const getBarById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bar = await Bar.findById(id).lean();
    if (!bar) {
      return res.status(404).json({ message: "Bar not found" });
    }
    return res.json(bar);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllBars = async (req: Request, res: Response) => {
  try {
    const bars = await Bar.find().limit(7);
    if (!bars.length) {
      return res.status(404).json({ message: "No bars available" });
    }
    res.status(200).json(bars);
  } catch (error) {
    console.error('Error fetching bars:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBarsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const city = req.query.city as string;
    const sortOption = (req.query.sortOption as string) || "mostReviewed";
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Validate category
    const validCategories = ['Dive Bar', 'Sports Bar', 'Cocktail Lounge', 'Wine Bar'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const query: any = { category: category };

    // Add city filter if provided
    if (city) {
      query.city = new RegExp(city, "i");
    }

    let aggregationPipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: Review.collection.name,
          localField: "_id",
          foreignField: "bar",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
          totalReviews: { $size: "$reviews" },
        },
      },
    ];

    // Add sorting
    switch (sortOption) {
      case "rating":
        aggregationPipeline.push({ $sort: { averageRating: -1 } }); 
        break;
      case "capacity":
        aggregationPipeline.push({ $sort: { capacity: -1 } }); 
        break;
      case "mostReviewed":
        aggregationPipeline.push({ $sort: { totalReviews: -1 } }); 
        break;
      default:
        aggregationPipeline.push({ $sort: { name: 1 } }); 
    }

    // Add pagination and projection
    aggregationPipeline.push(
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          reviews: 0,
          __v: 0,
        },
      }
    );

    const [bars, total] = await Promise.all([
      Bar.aggregate(aggregationPipeline),
      Bar.countDocuments(query)
    ]);

    res.json({
      data: bars,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching bars by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { searchBar, getBarById, getAllBars, getBarsByCategory };

