
import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { isAdmin } from "../middleware/adminAuth";
import AdminController from "../controllers/AdminController";

const router = express.Router();

// Apply JWT authentication middleware to all admin routes
router.use(jwtCheck);
router.use(jwtParse);
router.use(isAdmin);

// Dashboard statistics route
router.get("/dashboard/stats", AdminController.getDashboardStats);

// Bar owner management routes
router.get("/bar-owners", AdminController.getAllBarOwners);
router.get("/bar-owners/:id", AdminController.getBarOwnerById);
router.post("/bar-owners", AdminController.createBarOwner);
router.put("/bar-owners/:id", AdminController.updateBarOwner);
router.delete("/bar-owners/:id", AdminController.deleteBarOwner);
router.get("/bar-owners/:id/bars", AdminController.getBarOwnerBars);

export default router;
