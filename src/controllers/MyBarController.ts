import { Request, Response } from "express";
import Bar from "../models/bar";
import mongoose from "mongoose";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResponse {
  url: string;
  public_id: string;
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
    const existingBar = await Bar.findOne({ user: req.userId });

    if (existingBar) {
      return res.status(409).json({ message: "User bar already exists" });
    }

    const image = req.file as Express.Multer.File;
    if (!image) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const uploadResponse = await new Promise<CloudinaryUploadResponse>(
      (resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result as CloudinaryUploadResponse);
            }
          }
        );
        stream.end(image.buffer);
      }
    );

    const bar = new Bar(req.body);
    bar.imageUrl = uploadResponse.url; 
    bar.user = new mongoose.Types.ObjectId(req.userId);
    bar.lastUpdated = new Date();

    await bar.save();

    res.status(201).send(bar);
  } catch (error) {
    console.error("Error details:", error);
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

    bar.name = req.body.name;
    bar.city = req.body.city;
    bar.country = req.body.country;
    bar.openingHours = req.body.openingHours;
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
  updateMyBar,
};
