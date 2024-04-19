import express from 'express';
import { getAllUsers,getOneUser ,saveUser,updateUser,deleteUser } from '../controllers/usersController.js';
import { auth } from '../middleware/auth.js';

const userRoute = express.Router()


userRoute.get("/",auth,getAllUsers)
userRoute.get("/:id",auth,getOneUser)
userRoute.post("/",auth,saveUser)
userRoute.patch("/:id",auth,updateUser)
userRoute.delete("/:id",auth,deleteUser)


export { userRoute }