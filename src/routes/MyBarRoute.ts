import express from "express";
import multer from "multer";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyBarRequest } from "../middleware/validation";
import MyBarController from "../controllers/MyBarController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb megabytes
  },
});



router.get("/", MyBarController.getMyBar);

//api/my/bar
router.post(
  "/",
  upload.single("imageFile"),
  validateMyBarRequest,
        
  MyBarController.createMyBar
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyBarRequest,

  MyBarController.updateMyBar
);

export default router;








