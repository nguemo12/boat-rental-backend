import { MODELS } from "../db_schema.js"
import { createTable } from "../db_connection.js"

export const createAllTables = async () => {
    let obj = {
        ok: true,
        message: "All tables created successfully !!!"
    }
    MODELS.forEach(async (item) => {
        let {ok, message} = await createTable(item.name, item.table) 
        if(!ok){
            obj.ok = ok;
            obj.message = message
        }
    })
    return obj
}