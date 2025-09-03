import express, { Router } from "express";
import { signup, login } from "../controller/auth";

const router: Router = express.Router();

router.post("/auth/signup", signup);
router.post("/auth/login", login);

export default router;
