import { Request, Response } from "express";
import Bar from "../models/bar";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define an interface for the Cloudinary upload response
interface CloudinaryUploadResponse {
  url: string;
  public_id: string;
  // Add any other properties you expect from the response
}


const getMyBar = async (req: Request, res: Response) => {
  try {
    const bar = await Bar.findOne({ user: req.userId });
    if (!bar) {
      return res.status(404).json({ message: "bar not found" });
    }
    res.json(bar);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching bar" });
  }
};


const createMyBar = async (req: Request, res: Response) => {
  try {
    // Check if the user already has a bar
    const existingBar = await Bar.findOne({ user: req.userId });

    if (existingBar) {
      return res.status(409).json({ message: "User bar already exists" });
    }

    // Get the image file from the request
    const image = req.file as Express.Multer.File;
    if (!image) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Upload the image directly using the buffer
    const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
      const stream = cloudinary.v2.uploader.upload_stream(
        { resource_type: 'auto' }, // Automatically detect the resource type
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result as CloudinaryUploadResponse); // Cast result to the defined type
          }
        }
      );

      // End the stream with the image buffer
      stream.end(image.buffer);
    });

    // Create a new bar instance
    const bar = new Bar(req.body);
    bar.imageUrl = uploadResponse.url; // Set the uploaded image URL
    bar.user = new mongoose.Types.ObjectId(req.userId); // Set the user ID
    bar.lastUpdated = new Date(); // Set the last updated date

    // Save the bar to the database
    await bar.save();

    // Respond with the created bar data
    res.status(201).send(bar);
  } catch (error) {
    console.error("Error details:", error); // Log the error details
    res.status(500).json({ message: "Something went wrong" });
  }
};


const updateMyBar = async (req: Request, res: Response) => {
  try {
    const bar = await Bar.findOne({
      user: req.userId,
    });

    if (!bar) {
      return res.status(404).json({ message: "bar not found" });
    }

    bar.barName = req.body.barName;
    bar.city = req.body.city;
    bar.country = req.body.country;
    bar.drinks = req.body.drinks;
    bar.menuItems = req.body.menuItems;
    bar.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      bar.imageUrl = imageUrl;
    }

    await bar.save();
    res.status(200).send(bar);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};


export default {
  createMyBar,
  getMyBar,
  updateMyBar
};







