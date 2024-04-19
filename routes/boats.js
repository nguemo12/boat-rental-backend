import express from 'express';
import { getAllBoats,getOneBoat ,saveBoat,updateBoat,deleteBoat } from '../controllers/boatController.js';


const boatRoute = express.Router()


boatRoute.get("/",getAllBoats)
boatRoute.get("/:id",getOneBoat)
boatRoute.post("/",saveBoat)
boatRoute.patch("/:id",updateBoat)
boatRoute.delete("/:id",deleteBoat)


export { boatRoute }