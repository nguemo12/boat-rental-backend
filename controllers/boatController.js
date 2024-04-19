import { db } from './index.js'

const tableName = 'boats'

export const getAllBoats = async (req,res)=>{

    try{
    const { ok, data, message} = await db.findAll(tableName,[],0,'asc',['id'])
    if(ok)
        res.status(200).json({data,message})
    else
        res.json(500).json({data,message})
    }catch(err){
        res.json(500).json({message: 'internal server error'})
    }
}

export const getOneBoat = async (req,res)=>{
    try{
        const { ok,data,message } = await db.find(tableName,['id'],[req.params.id],'AND')
        if(ok)
            res.status(200).json({data,message})
        else
            res.json(500).json({data,message})

    }catch(err){
        let message = 'Internal server error'
        if(err.hasOwnProperty('sqlMessage'))
            message = err.sqlMessage
        
        res.status(500).json({data: [],message})
    }
}

export const saveBoat = async (req,res)=>{
    let columns = []
    let values = []

    if(req.body.length > 0){
        columns = Object.keys(req.body[0])
        values = (()=> { let arr=[]; req.body.forEach(element => {
                arr.push(Object.values(element))
           });
           return arr;
        })()
    }
    try{
    const { ok,data,message } = await db.insert(tableName,columns,values)
    if(ok)
        res.status(201).json({data:req.body,message})
    else
        res.status(500).json({data,message})
    }catch(err){
        if(err.hasOwnProperty('sqlMessage'))
            res.status(400).json({data: [],message: err.sqlMessage})
    }
}

export const updateBoat = async (req,res)=>{
    let Boats = req.body

    if(!Boats.hasOwnProperty('id') && req.params.id)
        Boats.id = req.params.id 

    let references={id: req.params.id}

    try{
        const { ok,data,message } = await db.update(tableName,Boats,references,"AND")
        if(ok)
            res.status(200).json({data,message})
        else
            res.status(500).json({data,message})

    }catch(err){
        let message = 'Internal server error'
        if(err.hasOwnProperty('sqlMessage'))
            message = err.sqlMessage
        
        res.status(500).json({data: [],message})
    }
}

export const deleteBoat = async (req,res)=>{
    let field = ''
    let value = ''

    if(req.params.id){
        value = req.params.id
        field = 'id'
    }else if(req.query.email){
        value = req.query.email
        field = 'email'
    }
    try{
        const { ok,data,message } = await db.deleteOne(tableName,field,value)
        if(ok)
            res.status(200).json({data,message})
        else
            res.status(500).json({data,message})
    }catch(err){
        let message = 'Internal server error'
        if(err.hasOwnProperty('sqlMessage'))
            message = err.sqlMessage
        
        res.status(500).json({data: [],message})
    }
}