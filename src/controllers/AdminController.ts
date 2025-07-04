
import { Request, Response } from "express";
import User from "../models/user";
import Bar from "../models/bar";
import mongoose from "mongoose";

// Get dashboard statistics
const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total counts
    const [totalBars, totalBarOwners, totalUsers] = await Promise.all([
      Bar.countDocuments(),
      User.countDocuments({ role: "bar_owner" }),
      User.countDocuments({ role: { $ne: "admin" } }) // All users except admins
    ]);

    // Get new registrations in last 7 days
    const [newBarsLast7Days, newBarOwnersLast7Days, newUsersLast7Days] = await Promise.all([
      Bar.countDocuments({ lastUpdated: { $gte: sevenDaysAgo } }),
      User.countDocuments({ 
        role: "bar_owner",
        createdAt: { $gte: sevenDaysAgo }
      }),
      User.countDocuments({ 
        role: { $ne: "admin" },
        createdAt: { $gte: sevenDaysAgo }
      })
    ]);

    // Get new registrations in last 30 days
    const [newBarsLast30Days, newBarOwnersLast30Days, newUsersLast30Days] = await Promise.all([
      Bar.countDocuments({ lastUpdated: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        role: "bar_owner",
        createdAt: { $gte: thirtyDaysAgo }
      }),
      User.countDocuments({ 
        role: { $ne: "admin" },
        createdAt: { $gte: thirtyDaysAgo }
      })
    ]);

    // Get active bars/owners (updated in last 30 days)
    const [activeBars, activeBarOwners] = await Promise.all([
      Bar.countDocuments({ lastUpdated: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ 
        role: "bar_owner",
        updatedAt: { $gte: thirtyDaysAgo }
      })
    ]);

    const stats = {
      totals: {
        bars: totalBars,
        barOwners: totalBarOwners,
        users: totalUsers
      },
      recent: {
        last7Days: {
          bars: newBarsLast7Days,
          barOwners: newBarOwnersLast7Days,
          users: newUsersLast7Days
        },
        last30Days: {
          bars: newBarsLast30Days,
          barOwners: newBarOwnersLast30Days,
          users: newUsersLast30Days
        }
      },
      active: {
        bars: activeBars,
        barOwners: activeBarOwners
      }
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};

// Get all bar owners
const getAllBarOwners = async (req: Request, res: Response) => {
  try {
    const barOwners = await User.find({ role: "bar_owner" });
    res.json(barOwners);
  } catch (error) {
    console.error("Error fetching bar owners:", error);
    res.status(500).json({ message: "Error fetching bar owners" });
  }
};

// Get a specific bar owner by ID
const getBarOwnerById = async (req: Request, res: Response) => {
  try {
    const barOwner = await User.findOne({
      _id: req.params.id,
      role: "bar_owner",
    });

    if (!barOwner) {
      return res.status(404).json({ message: "Bar owner not found" });
    }

    res.json(barOwner);
  } catch (error) {
    console.error("Error fetching bar owner:", error);
    res.status(500).json({ message: "Error fetching bar owner" });
  }
};

// Create a new bar owner
const createBarOwner = async (req: Request, res: Response) => {
  try {
    const { email, name, auth0Id, addressLine1, city, country } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new bar owner
    const newBarOwner = new User({
      email,
      name,
      auth0Id,
      addressLine1,
      city,
      country,
      role: "bar_owner",
    });

    await newBarOwner.save();
    res.status(201).json(newBarOwner);
  } catch (error) {
    console.error("Error creating bar owner:", error);
    res.status(500).json({ message: "Error creating bar owner" });
  }
};

// Update a bar owner
const updateBarOwner = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, city, country } = req.body;

    const barOwner = await User.findOne({
      _id: req.params.id,
      role: "bar_owner",
    });

    if (!barOwner) {
      return res.status(404).json({ message: "Bar owner not found" });
    }

    // Update fields
    if (name) barOwner.name = name;
    if (addressLine1) barOwner.addressLine1 = addressLine1;
    if (city) barOwner.city = city;
    if (country) barOwner.country = country;

    await barOwner.save();
    res.json(barOwner);
  } catch (error) {
    console.error("Error updating bar owner:", error);
    res.status(500).json({ message: "Error updating bar owner" });
  }
};

// Delete a bar owner
const deleteBarOwner = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the bar owner
    const barOwner = await User.findOne({
      _id: req.params.id,
      role: "bar_owner",
    }).session(session);

    if (!barOwner) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Bar owner not found" });
    }

    // Delete all bars associated with this owner
    await Bar.deleteMany({ user: barOwner._id }).session(session);

    // Delete the bar owner
    await User.deleteOne({ _id: barOwner._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Bar owner and associated bars deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting bar owner:", error);
    res.status(500).json({ message: "Error deleting bar owner" });
  }
};

// Get all bars for a specific bar owner
const getBarOwnerBars = async (req: Request, res: Response) => {
  try {
    const barOwner = await User.findOne({
      _id: req.params.id,
      role: "bar_owner",
    });

    if (!barOwner) {
      return res.status(404).json({ message: "Bar owner not found" });
    }

    const bars = await Bar.find({ user: barOwner._id });
    res.json(bars);
  } catch (error) {
    console.error("Error fetching bar owner bars:", error);
    res.status(500).json({ message: "Error fetching bar owner bars" });
  }
};

export default {
  getDashboardStats,
  getAllBarOwners,
  getBarOwnerById,
  createBarOwner,
  updateBarOwner,
  deleteBarOwner,
  getBarOwnerBars,
};
