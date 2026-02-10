
// import { Request, Response } from "express";
// import User from "../models/user";
// import Bar from "../models/bar";
// import mongoose from "mongoose";

// // Get dashboard statistics
// const getDashboardStats = async (req: Request, res: Response) => {
//   try {
//     const now = new Date();
//     const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//     const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

//     // Get total counts
//     const [totalBars, totalBarOwners, totalUsers] = await Promise.all([
//       Bar.countDocuments(),
//       User.countDocuments({ role: "bar_owner" }),
//       User.countDocuments({ role: { $ne: "admin" } }) // All users except admins
//     ]);

//     // Get new registrations in last 7 days
//     const [newBarsLast7Days, newBarOwnersLast7Days, newUsersLast7Days] = await Promise.all([
//       Bar.countDocuments({ lastUpdated: { $gte: sevenDaysAgo } }),
//       User.countDocuments({ 
//         role: "bar_owner",
//         createdAt: { $gte: sevenDaysAgo }
//       }),
//       User.countDocuments({ 
//         role: { $ne: "admin" },
//         createdAt: { $gte: sevenDaysAgo }
//       })
//     ]);

//     // Get new registrations in last 30 days
//     const [newBarsLast30Days, newBarOwnersLast30Days, newUsersLast30Days] = await Promise.all([
//       Bar.countDocuments({ lastUpdated: { $gte: thirtyDaysAgo } }),
//       User.countDocuments({ 
//         role: "bar_owner",
//         createdAt: { $gte: thirtyDaysAgo }
//       }),
//       User.countDocuments({ 
//         role: { $ne: "admin" },
//         createdAt: { $gte: thirtyDaysAgo }
//       })
//     ]);

//     // Get active bars/owners (updated in last 30 days)
//     const [activeBars, activeBarOwners] = await Promise.all([
//       Bar.countDocuments({ lastUpdated: { $gte: thirtyDaysAgo } }),
//       User.countDocuments({ 
//         role: "bar_owner",
//         updatedAt: { $gte: thirtyDaysAgo }
//       })
//     ]);

//     const stats = {
//       totals: {
//         bars: totalBars,
//         barOwners: totalBarOwners,
//         users: totalUsers
//       },
//       recent: {
//         last7Days: {
//           bars: newBarsLast7Days,
//           barOwners: newBarOwnersLast7Days,
//           users: newUsersLast7Days
//         },
//         last30Days: {
//           bars: newBarsLast30Days,
//           barOwners: newBarOwnersLast30Days,
//           users: newUsersLast30Days
//         }
//       },
//       active: {
//         bars: activeBars,
//         barOwners: activeBarOwners
//       }
//     };

//     res.json(stats);
//   } catch (error) {
//     console.error("Error fetching dashboard stats:", error);
//     res.status(500).json({ message: "Error fetching dashboard statistics" });
//   }
// };

// // Get all bar owners
// const getAllBarOwners = async (req: Request, res: Response) => {
//   try {
//     const barOwners = await User.find({ role: "bar_owner" });
//     res.json(barOwners);
//   } catch (error) {
//     console.error("Error fetching bar owners:", error);
//     res.status(500).json({ message: "Error fetching bar owners" });
//   }
// };

// // Get a specific bar owner by ID
// const getBarOwnerById = async (req: Request, res: Response) => {
//   try {
//     const barOwner = await User.findOne({
//       _id: req.params.id,
//       role: "bar_owner",
//     });

//     if (!barOwner) {
//       return res.status(404).json({ message: "Bar owner not found" });
//     }

//     res.json(barOwner);
//   } catch (error) {
//     console.error("Error fetching bar owner:", error);
//     res.status(500).json({ message: "Error fetching bar owner" });
//   }
// };





// // Delete a bar owner
// const deleteBarOwner = async (req: Request, res: Response) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Find the bar owner
//     const barOwner = await User.findOne({
//       _id: req.params.id,
//       role: "bar_owner",
//     }).session(session);

//     if (!barOwner) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Bar owner not found" });
//     }

//     // Delete all bars associated with this owner
//     await Bar.deleteMany({ user: barOwner._id }).session(session);

//     // Delete the bar owner
//     await User.deleteOne({ _id: barOwner._id }).session(session);

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ message: "Bar owner and associated bars deleted successfully" });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error deleting bar owner:", error);
//     res.status(500).json({ message: "Error deleting bar owner" });
//   }
// };

// // Get all bars for a specific bar owner
// const getBarOwnerBars = async (req: Request, res: Response) => {
//   try {
//     const barOwner = await User.findOne({
//       _id: req.params.id,
//       role: "bar_owner",
//     });

//     if (!barOwner) {
//       return res.status(404).json({ message: "Bar owner not found" });
//     }

//     const bars = await Bar.find({ user: barOwner._id });
//     res.json(bars);
//   } catch (error) {
//     console.error("Error fetching bar owner bars:", error);
//     res.status(500).json({ message: "Error fetching bar owner bars" });
//   }
// };

// // Get all users
// const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await User.find({ role: { $ne: "admin" } }); // Exclude admin users
//     res.json(users);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     res.status(500).json({ message: "Error fetching users" });
//   }
// };

// // Delete a user
// const deleteUser = async (req: Request, res: Response) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Prevent deleting admin users through this route
//     if (user.role === "admin") {
//       return res.status(403).json({ message: "Cannot delete admin user" });
//     }

//     // If the user is a bar_owner, delete associated bars as well
//     if (user.role === "bar_owner") {
//       await Bar.deleteMany({ user: user._id });
//     }

//     await User.deleteOne({ _id: user._id });

//     res.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res.status(500).json({ message: "Error deleting user" });
//   }
// };

// // Create a new user
// const createUser = async (req: Request, res: Response) => {
//   try {
//     const { email, name, auth0Id, addressLine1, city, country, role } = req.body;

//     // Check if user with this email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this email already exists" });
//     }

//     // Create new user
//     const newUser = new User({
//       email,
//       name,
//       auth0Id,
//       addressLine1,
//       city,
//       country,
//       role: role || "user", // Default role to 'user' if not provided
//     });

//     await newUser.save();
//     res.status(201).json(newUser);
//   } catch (error) {
//     console.error("Error creating user:", error);
//     res.status(500).json({ message: "Error creating user" });
//   }
// };

// // Update a user
// const updateUser = async (req: Request, res: Response) => {
//   try {
//     const { name, addressLine1, city, country, role } = req.body;

//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Prevent updating admin users through this route or changing role to admin
//     if (user.role === "admin" || role === "admin") {
//       return res.status(403).json({ message: "Cannot update admin user or change role to admin" });
//     }

//     // Update fields
//     if (name) user.name = name;
//     if (addressLine1) user.addressLine1 = addressLine1;
//     if (city) user.city = city;
//     if (country) user.country = country;
//     if (role) user.role = role;

//     await user.save();
//     res.json(user);
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Error updating user" });
//   }
// };




// // Create a new bar owner
// const createBarOwner = async (req: Request, res: Response) => {
//   try {
//     const { email, name, auth0Id, addressLine1, city, country } = req.body;

//     // Validate required fields
//     if (!email || !name || !auth0Id) {
//       return res.status(400).json({ 
//         message: "Email, name, and Auth0 ID are required fields" 
//       });
//     }

//     // Check if user with this email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ 
//         message: "A user with this email already exists" 
//       });
//     }

//     // Check if user with this auth0Id already exists
//     const existingAuth0User = await User.findOne({ auth0Id });
//     if (existingAuth0User) {
//       return res.status(400).json({ 
//         message: "A user with this Auth0 ID already exists" 
//       });
//     }

//     // Create new bar owner
//     const newBarOwner = new User({
//       email: email.trim(),
//       name: name.trim(),
//       auth0Id: auth0Id.trim(),
//       addressLine1: addressLine1?.trim() || "",
//       city: city?.trim() || "",
//       country: country?.trim() || "",
//       role: "bar_owner",
//     });

//     const savedBarOwner = await newBarOwner.save();
    
//     res.status(201).json({
//       message: "Bar owner created successfully",
//       barOwner: savedBarOwner
//     });
//   } catch (error) {
//     console.error("Error creating bar owner:", error);
//     res.status(500).json({ 
//       message: "Internal server error while creating bar owner" 
//     });
//   }
// };

// // Update a bar owner
// const updateBarOwner = async (req: Request, res: Response) => {
//   try {
//     const { name, addressLine1, city, country } = req.body;

//     const barOwner = await User.findOne({
//       _id: req.params.id,
//       role: "bar_owner",
//     });

//     if (!barOwner) {
//       return res.status(404).json({ message: "Bar owner not found" });
//     }

//     // Update fields if provided
//     if (name !== undefined) barOwner.name = name.trim();
//     if (addressLine1 !== undefined) barOwner.addressLine1 = addressLine1.trim();
//     if (city !== undefined) barOwner.city = city.trim();
//     if (country !== undefined) barOwner.country = country.trim();

//     const updatedBarOwner = await barOwner.save();
    
//     res.json({
//       message: "Bar owner updated successfully",
//       barOwner: updatedBarOwner
//     });
//   } catch (error) {
//     console.error("Error updating bar owner:", error);
//     res.status(500).json({ 
//       message: "Internal server error while updating bar owner" 
//     });
//   }
// };



// export default {
//   getDashboardStats,
//   getAllBarOwners,
//   getBarOwnerById,
//   createBarOwner,
//   updateBarOwner,
//   deleteBarOwner,
//   getBarOwnerBars,
//   getAllUsers,
//   deleteUser,
//   createUser,
//   updateUser,
// };








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

// Get all users
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }); // Exclude admin users
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Delete a user
const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting admin users through this route
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }

    // If the user is a bar_owner, delete associated bars as well
    if (user.role === "bar_owner") {
      await Bar.deleteMany({ user: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Create a new user
const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, auth0Id, addressLine1, city, country, role } = req.body;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user
    const newUser = new User({
      email,
      name,
      auth0Id,
      addressLine1,
      city,
      country,
      role: role || "user", // Default role to 'user' if not provided
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
};

// Update a user
const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, addressLine1, city, country, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent updating admin users through this route or changing role to admin
    if (user.role === "admin" || role === "admin") {
      return res.status(403).json({ message: "Cannot update admin user or change role to admin" });
    }

    // Update fields
    if (name) user.name = name;
    if (addressLine1) user.addressLine1 = addressLine1;
    if (city) user.city = city;
    if (country) user.country = country;
    if (role) user.role = role;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};




// Create a new bar owner
const createBarOwner = async (req: Request, res: Response) => {
  try {
    const { email, name, addressLine1, city, country } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ 
        message: "Email and name are required fields" 
      });
    }

    // Generate Auth0 ID automatically (simulated)
    const simulatedAuth0Id = `auth0|${Math.random().toString(36).substring(2, 15)}`;

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "A user with this email already exists" 
      });
    }

    // Check if user with this auth0Id already exists (unlikely with random generation)
    const existingAuth0User = await User.findOne({ auth0Id: simulatedAuth0Id });
    if (existingAuth0User) {
      return res.status(400).json({ 
        message: "A user with this Auth0 ID already exists (simulated conflict)" 
      });
    }

    // Create new bar owner
    const newBarOwner = new User({
      email: email.trim(),
      name: name.trim(),
      auth0Id: simulatedAuth0Id,
      addressLine1: addressLine1?.trim() || "",
      city: city?.trim() || "",
      country: country?.trim() || "",
      role: "bar_owner",
    });

    const savedBarOwner = await newBarOwner.save();
    
    res.status(201).json({
      message: "Bar owner created successfully",
      barOwner: savedBarOwner
    });
  } catch (error) {
    console.error("Error creating bar owner:", error);
    res.status(500).json({ 
      message: "Internal server error while creating bar owner" 
    });
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

    // Update fields if provided
    if (name !== undefined) barOwner.name = name.trim();
    if (addressLine1 !== undefined) barOwner.addressLine1 = addressLine1.trim();
    if (city !== undefined) barOwner.city = city.trim();
    if (country !== undefined) barOwner.country = country.trim();

    const updatedBarOwner = await barOwner.save();
    
    res.json({
      message: "Bar owner updated successfully",
      barOwner: updatedBarOwner
    });
  } catch (error) {
    console.error("Error updating bar owner:", error);
    res.status(500).json({ 
      message: "Internal server error while updating bar owner" 
    });
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
  getAllUsers,
  deleteUser,
  createUser,
  updateUser,
};