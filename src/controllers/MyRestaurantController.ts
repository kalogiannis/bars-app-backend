import { Request, Response } from "express";
import Restaurant from "../models/restaurant";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: 'your_cloud_name', // Replace with your Cloudinary cloud name
  api_key: 'your_api_key',       // Replace with your Cloudinary API key
  api_secret: 'your_api_secret'   // Replace with your Cloudinary API secret
});

// Define an interface for the Cloudinary upload response
interface CloudinaryUploadResponse {
  url: string;
  public_id: string;
  // Add any other properties you expect from the response
}


const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });
    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching restaurant" });
  }
};


const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    // Check if the user already has a restaurant
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res.status(409).json({ message: "User restaurant already exists" });
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

    // Create a new restaurant instance
    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = uploadResponse.url; // Set the uploaded image URL
    restaurant.user = new mongoose.Types.ObjectId(req.userId); // Set the user ID
    restaurant.lastUpdated = new Date(); // Set the last updated date

    // Save the restaurant to the database
    await restaurant.save();

    // Respond with the created restaurant data
    res.status(201).send(restaurant);
  } catch (error) {
    console.error("Error details:", error); // Log the error details
    res.status(500).json({ message: "Something went wrong" });
  }
};


const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({
      user: req.userId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "restaurant not found" });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.country = req.body.country;
    restaurant.deliveryPrice = req.body.deliveryPrice;
    restaurant.estimatedDeliveryTime = req.body.estimatedDeliveryTime;
    restaurant.cuisines = req.body.cuisines;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.status(200).send(restaurant);
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
  createMyRestaurant,
  getMyRestaurant,
  updateMyRestaurant
};








//33
// import { Request, Response } from "express";
// import Restaurant from "../models/restaurant";
// import cloudinary from "cloudinary";
// import mongoose from "mongoose";

// // Cloudinary configuration
// cloudinary.v2.config({
//   cloud_name: 'your_cloud_name', // Replace with your Cloudinary cloud name
//   api_key: 'your_api_key',       // Replace with your Cloudinary API key
//   api_secret: 'your_api_secret'   // Replace with your Cloudinary API secret
// });

// // Define an interface for the Cloudinary upload response
// interface CloudinaryUploadResponse {
//   url: string;
//   public_id: string;
//   // Add any other properties you expect from the response
// }

// const createMyRestaurant = async (req: Request, res: Response) => {
//   try {
//     // Check if the user already has a restaurant
//     const existingRestaurant = await Restaurant.findOne({ user: req.userId });

//     if (existingRestaurant) {
//       return res.status(409).json({ message: "User restaurant already exists" });
//     }

//     // Get the image file from the request
//     const image = req.file as Express.Multer.File;
//     if (!image) {
//       return res.status(400).json({ message: "Image file is required" });
//     }

//     // Upload the image directly using the buffer
//     const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
//       const stream = cloudinary.v2.uploader.upload_stream(
//         { resource_type: 'auto' }, // Automatically detect the resource type
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             reject(error);
//           } else {
//             resolve(result as CloudinaryUploadResponse); // Cast result to the defined type
//           }
//         }
//       );

//       // End the stream with the image buffer
//       stream.end(image.buffer);
//     });

//     // Create a new restaurant instance
//     const restaurant = new Restaurant(req.body);
//     restaurant.imageUrl = uploadResponse.url; // Set the uploaded image URL
//     restaurant.user = new mongoose.Types.ObjectId(req.userId); // Set the user ID
//     restaurant.lastUpdated = new Date(); // Set the last updated date

//     // Save the restaurant to the database
//     await restaurant.save();

//     // Respond with the created restaurant data
//     res.status(201).send(restaurant);
//   } catch (error) {
//     console.error("Error details:", error); // Log the error details
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

// export default {
//   createMyRestaurant
// };








//40
// import { Request, Response } from "express";
// import Restaurant from "../models/restaurant";
// import cloudinary from "cloudinary";
// import mongoose from "mongoose";

// // Cloudinary configuration
// cloudinary.v2.config({
//   cloud_name: 'your_cloud_name', // Replace with your Cloudinary cloud name
//   api_key: 'your_api_key',       // Replace with your Cloudinary API key
//   api_secret: 'your_api_secret'   // Replace with your Cloudinary API secret
// });

// // Define an interface for the Cloudinary upload response
// interface CloudinaryUploadResponse {
//   url: string;
//   public_id: string;
//   // Add any other properties you expect from the response
// }


// const getMyRestaurant = async (req: Request, res: Response) => {
//   try {
//     const restaurant = await Restaurant.findOne({ user: req.userId });
//     if (!restaurant) {
//       return res.status(404).json({ message: "restaurant not found" });
//     }
//     res.json(restaurant);
//   } catch (error) {
//     console.log("error", error);
//     res.status(500).json({ message: "Error fetching restaurant" });
//   }
// };


// const createMyRestaurant = async (req: Request, res: Response) => {
//   try {
//     // Check if the user already has a restaurant
//     const existingRestaurant = await Restaurant.findOne({ user: req.userId });

//     if (existingRestaurant) {
//       return res.status(409).json({ message: "User restaurant already exists" });
//     }

//     // Get the image file from the request
//     const image = req.file as Express.Multer.File;
//     if (!image) {
//       return res.status(400).json({ message: "Image file is required" });
//     }

//     // Upload the image directly using the buffer
//     const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
//       const stream = cloudinary.v2.uploader.upload_stream(
//         { resource_type: 'auto' }, // Automatically detect the resource type
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             reject(error);
//           } else {
//             resolve(result as CloudinaryUploadResponse); // Cast result to the defined type
//           }
//         }
//       );

//       // End the stream with the image buffer
//       stream.end(image.buffer);
//     });

//     // Create a new restaurant instance
//     const restaurant = new Restaurant(req.body);
//     restaurant.imageUrl = uploadResponse.url; // Set the uploaded image URL
//     restaurant.user = new mongoose.Types.ObjectId(req.userId); // Set the user ID
//     restaurant.lastUpdated = new Date(); // Set the last updated date

//     // Save the restaurant to the database
//     await restaurant.save();

//     // Respond with the created restaurant data
//     res.status(201).send(restaurant);
//   } catch (error) {
//     console.error("Error details:", error); // Log the error details
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

// export default {
//   createMyRestaurant,
//   getMyRestaurant
// };




