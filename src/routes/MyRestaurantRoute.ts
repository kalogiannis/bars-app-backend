import express from "express";
import multer from "multer";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyRestaurantRequest } from "../middleware/validation";
import MyRestaurantController from "../controllers/MyRestaurantController";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb megabytes
  },
});

// router.get(
//   "/order",
//   jwtCheck,
//   jwtParse,
//   MyRestaurantController.getMyRestaurantOrders
// );

// router.patch(
//   "/order/:orderId/status",
//   jwtCheck,
//   jwtParse,
//   MyRestaurantController.updateOrderStatus
// );

router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

//api/my/restaurant
router.post(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,       //it ensures we get a valid token in the request
  jwtParse,       //this pulls the current logged in users information out of the token and passes it on to the request 
  MyRestaurantController.createMyRestaurant
);

router.put(
  "/",
  upload.single("imageFile"),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateMyRestaurant
);

export default router;










//9
// router.post(
//   "/",
//   upload.single("imageFile"),
//   MyRestaurantController.createMyRestaurant
// );


//11
// router.post(
//   "/",
//   jwtCheck,       //it ensures we get a valid token in the request
//   jwtParse,       //this pulls the current logged in users information out of the token and passes it on to the request 
//   upload.single("imageFile"),
//   MyRestaurantController.createMyRestaurant
// );





//33
// import express from "express";
// import multer from "multer";
// import { jwtCheck, jwtParse } from "../middleware/auth";
// import { validateMyRestaurantRequest } from "../middleware/validation";
// import MyRestaurantController from "../controllers/MyRestaurantController";

// const router = express.Router();

// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, //5mb megabytes
//   },
// });

// router.post(
//   "/",
//   upload.single("imageFile"),
//   validateMyRestaurantRequest,
//   jwtCheck,       //it ensures we get a valid token in the request
//   jwtParse,       //this pulls the current logged in users information out of the token and passes it on to the request 
//   MyRestaurantController.createMyRestaurant
// );
// export default router;





//39
// const router = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, //5mb megabytes
//   },
// });
// router.get("/", jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);
// router.post(
//   "/",
//   upload.single("imageFile"),
//   validateMyRestaurantRequest,
//   jwtCheck,       //it ensures we get a valid token in the request
//   jwtParse,       //this pulls the current logged in users information out of the token and passes it on to the request 
//   MyRestaurantController.createMyRestaurant
// );
// export default router;