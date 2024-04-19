import express from 'express';
import cors from 'cors';
import { ROUTES } from './routes/index.js';
import { createDatabase, useDB } from './db_connection.js';
import { createAllTables } from './helpers/models.js';

const app = express()
app.use(cors("*"))

const db_name = "cdp_f23_g10_bdd"
const {ok, message} = await createDatabase(db_name)

if (ok) {
    console.log(message)
    const use_db = await useDB(db_name)
    if (use_db.ok){
        console.log(use_db.message)
        const create_tables = await createAllTables()
        if (create_tables.ok){
            console.log(create_tables.message)
        }else{
            console.log(create_tables.message)
        }
    }else{
        console.log(use_db.message)
    }
}else{
    console.log(message)
}

// Do this to be able to upload high quality images and support large json body
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true,limit: '50mb'}));

app.get('/',(req,res)=>{
    res.send("<h1>Hello world !!</h1>")
})

app.use("/users",ROUTES.users)

const port = 5000;


app.listen(port,()=>{
    console.log(`Listening on port ${port}`)
})