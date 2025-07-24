
import express from "express";
import AdminUserController from "../controllers/AdminUserController";
import { jwtCheck, jwtParse, authorizeRoles } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

router.post(
  "/",
  jwtCheck,
  jwtParse,
  authorizeRoles(["admin"]), 
  validateMyUserRequest, 
  AdminUserController.createAdminUser
);

router.put(
  "/:auth0Id", 
  jwtCheck,
  jwtParse,
  authorizeRoles(["admin"]), 
  validateMyUserRequest, 
  AdminUserController.updateAdminUser
);

router.get(
  "/:auth0Id", 
  jwtCheck,
  jwtParse,
  authorizeRoles(["admin"]), 
  AdminUserController.getAdminUserById
);

router.get(
  "/",
  jwtCheck,
  jwtParse,
  authorizeRoles(["admin"]),
  AdminUserController.getAllUsers
);

router.delete(
  "/:auth0OrMongoId",
  jwtCheck,
  jwtParse,
  authorizeRoles(["admin"]),
  AdminUserController.deleteAdminUser
);
export default router;