

import { Request, Response } from "express";
import User from "../models/user";
import mongoose from "mongoose";

// Admin creates a new user
const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { email, name, addressLine1, city, country } = req.body;

    const simulatedAuth0Id = `auth0|${Math.random().toString(36).substring(2, 15)}`;

    const existingUser = await User.findOne({ auth0Id: simulatedAuth0Id });

    if (existingUser) {
      return res.status(409).json({ message: "User with this Auth0 ID already exists (simulated conflict)" });
    }

    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const newUser = new User({
      auth0Id: simulatedAuth0Id,
      email,
      name,
      addressLine1,
      city,
      country,
    });
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.error("Error creating user by admin:", error);
    res.status(500).json({ message: "Error creating user by admin" });
  }
};

// Admin updates an existing user
const updateAdminUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.params;
    const { name, addressLine1, city, country } = req.body;

    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.addressLine1 = addressLine1 || user.addressLine1;
    user.city = city || user.city;
    user.country = country || user.country;

    await user.save();

    res.status(200).send(user.toObject());
  } catch (error) {
    console.error("Error updating user by admin:", error);
    res.status(500).json({ message: "Error updating user by admin" });
  }
};

// Admin gets user details by Auth0 ID
const getAdminUserById = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.params;
    const user = await User.findOne({ auth0Id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by admin:", error);
    res.status(500).json({ message: "Error fetching user by admin" });
  }
};


const getAllUsers = async (req: Request, res: Response) => {
  try {
    // you may want to filter out sensitive fields before returning
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
};

const deleteAdminUser = async (req: Request, res: Response) => {
  try {
    const { auth0OrMongoId } = req.params;
    let result;

    // if it’s a valid ObjectId, delete by _id first
    if (mongoose.isValidObjectId(auth0OrMongoId)) {
      result = await User.findByIdAndDelete(auth0OrMongoId);
    }
    // if that didn’t match, fall back to Auth0 ID
    if (!result) {
      result = await User.findOneAndDelete({ auth0Id: auth0OrMongoId });
    }

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user by admin:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
};

export default {
  createAdminUser,
  updateAdminUser,
  getAdminUserById,
  getAllUsers,
  deleteAdminUser
};
