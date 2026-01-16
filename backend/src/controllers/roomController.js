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

const create = async (req, res, next) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

export default {  };