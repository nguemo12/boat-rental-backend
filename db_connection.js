const Pool = require('pg').Pool
import bcrypt from "bcryptjs";
import { credentials }  from './constants.js'
import jwt from "jsonwebtoken";
const pool = new Pool({
    user:credentials.user,
    host:credentials.host,
    //database:credentials.database,
    password:credentials.password,
    port:credentials.port
});


// function to create db and use it
export async function createDatabase(dbname){
   const createDB = await pool.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`);
   if(createDB[0].serverStatus ==2)
        return {
            ok: true,
            message: 'Created database successfully !!!'
        }
    else
        return{
            ok: false,
            message: 'An error occured while creating db !!!'
        }
}

// function to access db
export async function useDB(dbname){
    const result = await pool.query(`USE ${dbname}`)
    if(result[0].stateChanges.schema == `${dbname}`)
        return{
            ok: true,
            message: 'db ready to be used !!!'
        }
    else{
        return{
            ok: false,
            message: `An error occured couldn't use db: ${dbname}`
        }
    }
}

//function to create a table
/* columns has syntax
[{
    name: '....',
    type: 'type (required)+ constraint (optional)'
}]
*/
export async function createTable(tableName,columns){
    tableName = tableName.toLocaleLowerCase()
    const column = synthesizeColumn(columns)
    const result = await pool.query(`create table if not exists ${tableName} (id int SERIAL PRIMARY KEY, ${column})`)
    if(result[0].serverStatus==2){
        return{
            ok: true,
            data: [],
            message: `table ${tableName} created successfull !!!`
        }
    }else{
        return{
            ok: false,
            data: [],
            message: `an error occured while creating table ${tableName} `
        }
    }
}

//function to synthesize column
function synthesizeColumn(columns){
    if(columns.length > 0){
        let str = ''
        columns.forEach((element,index) => {
            if(index<columns.length-1)
                 str+=element.name+" "+element.type+","
            else
                str+=element.name+" "+element.type
        });

        return str;

    }else return;
}

// function to select from table 
export async function findAll(tablename,select_columns=[],column_num=0,order_by='asc',order_columns=['id']){
    tablename = tablename.toLocaleLowerCase() 

    if(select_columns.length>0)
        select_columns = select_columns.join(",")
    else
        select_columns = "*"

    if(order_columns.length > 1)
        order_columns = order_columns.join(",")
    else
        order_columns = "id"
    

    let sql = `select ${select_columns} from ${tablename} order by ${order_columns} ${order_by}`
    if(column_num>0)
        sql+=` limit ${column_num}` 
    
    const [data] = await pool.query(sql)
    return {
        ok: true,
        data,
        count: data.length
    };
}

//function to get user by id,email or any field of his choice
/*
fields = ['id','name']
values = [1,'daniel']

field and values is used for where query // id =1 and name='daniel'
operator (AND,OR,||)
*/
export async function find(tableName,fields,values,operator='AND'){
    tableName = tableName.toLocaleLowerCase()
    if(operator==="||"){
        operator = 'OR'
    }

    let sql = `\d ${tableName}`;
    let [res] = await pool.query(sql)
    const db_columns = (()=> {let arr=[]; res.forEach(item=> arr.push(item.Field)); return arr; })()
    const isFieldExist = (()=> { let ok=true; fields.forEach(field=> { if(!db_columns.includes(field)){ ok=false; } }); return ok;})()
    const isValueNotNull = (()=>{
        let ok = true;
        values.forEach(item => {
            if(item==null) { ok=false; }
        })
        if(fields.length !== values.length) { ok=false; }
        return ok;
    })()

    if(isFieldExist && isValueNotNull){
         sql = `SELECT * FROM ${tableName} WHERE `;
         let str = ''
         if(fields.length > 1){
            fields.forEach((item,index)=>{
                if(index < fields.length-1){
                        str+= `${item}= ? ${operator} `
                }
                else{
                    str+= `${item}= ?`
                }
            })
         }else{
            str+= `${fields[0]}= ?`
         }

         sql +=str;

        [res] = await pool.query(sql,values)
        if(res.length>0)
            return{
                ok: true,
                data: res,
                message: "fetch data successfully !!!"
            }
        else
            return{
                ok: true,
                data: res,
                message: "Sorry no element found with parameters sent"
            }
    }else{
        return{
            ok: false,
            data: [],
            message: `Columns and values passed are not of same length`
        }
    }
}

// function to insert a new user
/*
columns = ['name','age']
values =[['daniel',20],['junior',21]]
*/

export async function insert(table,columns=[],values=[[]]){
    table = table.toLocaleLowerCase()
    let sql = `desc ${table}`;
    let id = 0;

    if(columns.length===values[0]?.length){
    let [res] = await pool.query(sql);

    // pk = {field: 'id',extra: yes || no (if it auto_increment)}
    const pk = getPrimaryKey(res)

    if(pk.hasOwnProperty('field')){
        const {ok,data} = await getLastId(table,pk.field)
        id = data;
        if(ok){
             sql = `INSERT INTO  ${table}`;
             
            if(columns.includes(pk?.field) && pk.extra){
                return{
                    ok: false,
                    data: [],
                    message: 'Sorry primary key is auto increment'
                }
            }else if(!columns.includes(pk?.field) && pk.extra){
                columns.unshift(pk.field)
                columns.forEach((column,index)=>{
                    if(index==0){
                        sql+=`(${column},`
                    }else if(index<columns.length-1){
                        sql+=`${column},`
                    }else{
                        sql+=`${column}) VALUES ?`
                    }
                 })

                 values.forEach((item)=>{
                    item.unshift(++id)
                 })
                 
            }else if(columns.includes(pk?.field) && !pk.extra){
                columns.forEach((column,index)=>{
                    if(index==0){
                        sql+=`(${column},`
                    }else if(index<columns.length-1){
                        sql+=`${column},`
                    }else{
                        sql+=`${column}) VALUES ?`
                    }
                 })
            }
            res = await pool.query(sql,[values])

               if(res[0]?.affectedRows>=1 && res[0]?.serverStatus==2)
                    return {
                        ok: true,
                        data: [],
                        message:`inserted all data into table ${table}`
                    }
                  
        }
    }
    }else{
        return {
            ok: false,
            data: [],
            message: "columns number and data passed are not the same "
        }
    }
    
}

/*
pass full object must contain id
data = {
    id: 1,
    name: 'daniel',
    age: '21'
}

references: in case of where conditions
references = 
    { id: 1, email: 'daniel'} // where id=1 and email='daniel'


operator is (AND,OR,||)
*/

export async function update(table,data,references={},operator='AND'){
    table = table.toLocaleLowerCase()
    if(operator==="||"){
        operator = 'OR'
    }
    let sql = `desc ${table}`;

    let [res] = await pool.query(sql);
    // const db_columns = (()=> {let arr=[]; res.forEach(item=> arr.push(item.Field)); return arr; })()
    const pk = getPrimaryKey(res)

    //checking of data sent exist in db
    let dbData = await find(table,['id'],[data.id],'AND')

    if(dbData?.ok && dbData?.data?.length > 0){
        
        const data_fields_keys = Object.keys(data)
        const data_fields_values = Object.values(data)
        let values = []

        sql = `UPDATE ${table} SET `;
        data_fields_keys.forEach((field,index)=>{
            if(index < data_fields_keys.length-1 && field!==pk.field){
                sql+=` ${field}=?,`
                values.push(data_fields_values[index])

            }else if(index==data_fields_keys.length-1 && field==pk.field){
                sql = sql.substring(0,sql.length-1) + ' WHERE '
                values.push(data_fields_values[index])

            }else if(index==data_fields_keys.length-1 && field!==pk.field){
                sql+=` ${field}=? WHERE `
                values.push(data_fields_values[index])
            }
        })

        const references_keys = Object.keys(references)
        const references_values = Object.values(references)
        // UPDATE users SET  name=?, age=?, gender=? WHERE 
        if(references_keys.length > 1){
            references_keys.forEach((key,index)=>{
            if(index < references_keys.length-1){
                sql+=`${key}= ? ${operator} `
                values.push(references_values[index])
            }else{
                sql+=`${key}= ?`
                values.push(references_values[index])
                }
            })
        }else{
            sql+=`${references_keys[0]}= ?`
            values.push(references_values[0])
        }

        res = await pool.query(sql,values)
        dbData = await find(table,['id'],[data.id],'AND')
        

        if(res[0]?.affectedRows>=1 && res[0]?.changedRows>=1){
            return{
                ok: true,
                data: dbData.data,
                message: `Update row with id ${data?.id} in table ${table}`
            }
        }else if(res[0]?.affectedRows==0){
            return{
                ok: true,
                data: dbData.data,
                message: `Update query ran successfully`
            }
        }else{
            return{
                ok: false,
                data: [],
                message: `Couldn't update element with id ${data?.id} in table ${table}`
            }
        }
    }else{
        return {
            ok: false,
            data:[],
            message: `row with id ${data?.id} not found in table ${table}` 
        }
    }
}

/*
Deletion can be done by id, email .... any db column
So delete: 
    field: 'email',
    value: 'daniel@gmail.com'
*/

export async function deleteOne(table,field='',value){
    table = table.toLocaleLowerCase()
    let sql = `desc ${table}`;

    let [res] = await pool.query(sql);
    const db_columns = (()=> {let arr=[]; res.forEach(item=> arr.push(item.Field)); return arr; })()

    const pk = getPrimaryKey(res)

       
        if(field!==''){
            if(!db_columns.includes(field)){
                return{
                    ok: false,
                    data: [],
                    message: `Sorry field ${field} doesn't include in table ${table}`
                }
            }
        }
    
    if(field.length<=0){
        if(pk.hasOwnProperty('field')){
            field = pk.field
        }else{
            field = 'id'
        }
    }

     //checking of data sent exist in db
     let userDeleted = await find(table,[field],[value])

     sql = `delete from ${table} where ${field} = ?`

     res = await pool.query(sql,value)
     if(res[0].affectedRows>=1 && res[0].serverStatus==2){
        return{
            ok: true,
            data: userDeleted?.data[0],
            message: `deleted element with ${field} ${value}`
        }
    }else if(res[0].affectedRows==0 && res[0].serverStatus==2){
        return{
            ok: true,
            data: [],
            message: `element with ${field} ${value} not found`
        }
    }
}

export async function deleteAll(table){
    const res = await pool.query(`delete from ${table}`)
    if(res[0].affectedRows >=1){
        return{
            ok: true,
            data: [],
            message: `deleted all rows in table ${table}`
        }
    }else if(res[0].affectedRows==0){
        return{
            ok: true,
            data: [],
            message: `no element found in ${table}`
        }
    }
}

/*

data = {
    name: 'danie'
}

*/
export async function search(table='',data={}){
    table = table.toLocaleLowerCase()
    const [datas] = await pool.query(`SELECT * FROM ${table} where ${Object.keys(data)[0]} like ?`,['%' + Object.values(data)[0] + '%'])
    if(datas?.length >= 0){
        return{
            ok: true,
            data: datas,
            message: `filtered element from table ${table} like ${Object.values(data)[0]} ` 
        }
    }else{
        return{
            ok: false,
            data: [],
            message: `Couldn't filter element from table ${table} like ${Object.values(data)[0]}` 
        }
    }
}

export async function paginate(table,from,to){
    table = table.toLocaleLowerCase()
    if(to > from && from>0){
        if(from==1){
            from-=1
        }
        if(from>1){
            from-=1
            to-=1
        }
        const [data] = await pool.query(`select * from ${table} limit ?,?`,[from,to])
        if(data?.length >= 0){
            return{
                ok: true,
                data,
                message: `selected required data successfully ` 
            }
        }else{
            return{
                ok: false,
                data: [],
                message: `an error occured` 
            }
        }
    }else{
        return{
            ok: false,
            data: [],
            message: `check parameters passed` 
        }
    }
}

async function getLastId(table,pk){
    let sql = `select ${pk} from ${table} order by ${pk} desc limit 1`
    const [res] = await pool.query(sql)
    let response = {
        ok: true,
        data: 0,
        message: `retrieved last index of ${pk} in table ${table}`
    }
    
    if(res.length > 0){
        response.data = Object.values(res[0])[0]
        response.message = `retrieved last index of ${pk} in table ${table}`
    }else if(res.length==0){
        response.id = 1
    }
    else{
        response.ok= false
        response.data= null
        response.message= `an error occured when retrieving the last index of table`
    }

    return response;
}


function getPrimaryKey(res){
    const pk = (()=> {
        let arr={}; 
        res.forEach(item=> { 
            if(item?.Key.toLocaleLowerCase()==='pri') { 
                arr.field=item?.Field;
                arr.extra = item?.Extra.toLocaleLowerCase()=='auto_increment' ? true : false
        }   
        }); 
            return arr; 
        })()

        return pk;
}



// sample test for all the method

// const {ok,data,message} = await find('users',["name",'age'],['junior','20'],"or")
// let { ok,data,message } = await insert("users",["name","age","gender"],[["Victirien",22,'m'],["mit",22,'f']])
// const {ok,data,message} = await deleteOne('users','',2)
// const {ok,data,message} = await deleteAll('users')

/* const {ok,data,message}  = await update('users',{
    name:'daniel update 12',
    id:1,
    age: 27,
    gender: 'm', 
},{id: 1,gender:'m'}) */

// const {ok,data,message}  = await search('users',{name: 'a'})
// const {ok,data,message} = await paginate('users',2,5)

// console.log(data)