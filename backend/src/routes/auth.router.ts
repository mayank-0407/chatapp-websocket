import { Router } from "express";
import {
  loginController,
  signupController,
  verifyToken,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/verify/token", verifyToken);

export default router;
