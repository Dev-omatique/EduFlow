import db from '../models/index.js'

const { Room } = db

const getAll = async (req,res,next) =>{
    try{
        const rooms = await Rooms.findAll()
        res.status(200).json(rooms)
    }catch(err){
        next(err)
    }
};

export default {  };