import express from 'express';
import { getAllRentals,getOneRental ,saveRental,updateRental,deleteRental } from '../controllers/rentalController.js';


const rentalRoute = express.Router()


rentalRoute.get("/",getAllRentals)
rentalRoute.get("/:id",getOneRental)
rentalRoute.post("/",saveRental)
rentalRoute.patch("/:id",updateRental)
rentalRoute.delete("/:id",deleteRental)


export { rentalRoute }