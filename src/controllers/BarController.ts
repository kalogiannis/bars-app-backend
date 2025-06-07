import { Request, Response } from "express";
import Bar from "../models/bar";
import Review from "../models/review";

const searchBar = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const searchQuery = (req.query.searchQuery as string) || "";
    const sortOption = (req.query.sortOption as string) || "lastUpdated";
    const page = parseInt(req.query.page as string) || 1;

    // Build query
    const query: any = { city: new RegExp(city, "i") };

    // Check for city existence
    const cityCount = await Bar.countDocuments(query);
    if (cityCount === 0) {
      return res.status(404).json({
        data: [],
        pagination: { total: 0, page: 1, pages: 1 },
      });
    }

    // Add name filter
    if (searchQuery) {
      query.name = new RegExp(searchQuery, "i");
    }

    // Pagination settings
    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    // Handle different sort options
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
        },
      },
    ];

    // Sorting logic
    switch (sortOption) {
      case "rating":
        aggregationPipeline.push({ $sort: { averageRating: -1 } });
        break;
      case "capacity":
        aggregationPipeline.push({ $sort: { capacity: -1 } });
        break;
      case "lastUpdated":
      default:
        aggregationPipeline.push({ $sort: { lastUpdated: -1 } });
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

    // Execute aggregation
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

export default { searchBar, getBarById, getAllBars };
