import express from "express";
import userAuth from "../middleware/userAuth.js";
import { getUserData, getAllUsers } from "../controllers/userControllers.js";

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData)

userRouter.get('/alldata', getAllUsers)

export default userRouter