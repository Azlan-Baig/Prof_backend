import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    //ye boht saarey fileds accept kaleta hai in the form of Array
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "CoverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
// default karnay se ye huga k me isay kisi bh name se import kar sakta hun...
