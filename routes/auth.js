import express from "express";
import { register, login, logout } from "../controllers/authController.js";

const authRoute = express.Router();

const CLIENT_URL = 'http://localhost:3000/'

authRoute.get("/login/failed",(req,res)=>{
    return res.status(401).json({ok: false,message: "Authentication failed !!!"})
})

authRoute.get("/login/success",(req,res)=>{
    if(req.user)
        return res.status(200).json({ok: true,message: "Authentication successful !!!",user: req.user})
})

authRoute.get("/logout",(req,res,next)=>{
    req.logout(function(err){
        if(err) return next(err)
    })
    res.redirect(CLIENT_URL+"login")
})

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/logout", logout);

export default authRoute;