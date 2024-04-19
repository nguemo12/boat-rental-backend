
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./index.js"
import { validateEmail } from '../helpers/helper.js'
import dotenv  from 'dotenv'
dotenv.config()




export const register = async (req, res) => {
  //CHECK EXISTING USER
  let columns = []
  let values = []

  if (req.body.length > 0) {

    const checkColumn = ["userName", "userEmail"]
    const checkValues = [req.body[0].userName, req.body[0].userEmail]
    const { ok, data, message } = await db.find("users", checkColumn, checkValues)
   
    if (ok) {
      if (data.length > 0) {
        return res.status(400).json({ message: 'Sorry username or email already exist in our system' })
      }

    } else {
      return res.status(500).json({ message: 'Sorry an error occured try again' })
    }
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(req.body[0].userPassword, salt)
    req.body[0].userPassword = hash
    columns = Object.keys(req.body[0])
    values = (() => {
      let arr = []; req.body.forEach(element => {
        arr.push(Object.values(element))
      });
      return arr;
    })()
  }
  let isEmailValid = true
  // check if email is valid
  columns.forEach((item,index)=>{
    if(item.toLowerCase().includes("email")){
      values.forEach(data=>{
        if(!validateEmail(data[index])){
          isEmailValid = false
          return res.status(400).json({ data:[], message:'Sorry email format not correct' })
        }
      })
    }
  })

  try {
   if(isEmailValid){
      const { ok, data, message } = await db.insert("users", columns, values)
      if (ok)
        res.status(201).json({ data: req.body, message })
      else
        res.status(500).json({ data, message })
    }
  } catch (err) {
    if (err.hasOwnProperty('sqlMessage'))
      res.status(400).json({ data: [], message: err.sqlMessage })
  }
}

export const login = async (req, res) => {
  //CHECK USER
  const fields =
    ["userEmail"]
  const values = [req.body.userEmail]
  const { ok, data, message } = await db.find("users", fields, values)
  if (data.length<=0)
    return res.status(404).json("No user found with these credentials !");
  const isPasswordValid = await bcrypt.compare(req.body.userPassword, data[0].userPassword)
  if (!isPasswordValid)
    return res.status(404).json("Incorrect email or password !");

  //implementing jwt and adding logged user object as payload
  const token = jwt.sign({ user: data[0] },process.env.JWT_TOKEN_KEY,
    {
      expiresIn: "3h",
    }
  );

    data[0]['token'] = token;
  
    
    return res.status(200).json({data,message: "User login sucessfully !!!"});
}

// generate me a hexadecimal string with length of 32 characters
export const logout = (req, res) => {
  res.clearCookie("access_token", {
    sameSite: "none",
    secure: true
  }).status(200).json("User has been logged out.")
};