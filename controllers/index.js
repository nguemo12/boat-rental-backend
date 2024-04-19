
import { findAll,find,insert,deleteOne,deleteAll,update,search,paginate } from '../db_connection.js';

export const db = { 
        findAll,
        find,
        insert,
        deleteOne,
        deleteAll,
        update,
        search,
        paginate 
}