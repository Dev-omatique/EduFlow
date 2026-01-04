import express from "express";
import userController from "../controller/user.controller.ts";

const userRouter = express.Router();

userRouter.get("/",userController.getAll)


export default userRouter