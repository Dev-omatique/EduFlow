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

/**
 * Met à jour une entrée existante via son ID
 */
const update = async (req, res, next) => {
    try {
        await Room.update(req.body, {
            where: { id: req.params.id },
        });
        res.json({ message: "successful update" });
    } catch (err) {
        next(err);
    }
};

/**
 * Supprime une entrée via son ID
 */
const remove = async (req, res, next) => {
    try {
        await Room.destroy({
            where: { id: req.params.id },
        });
        res.json({ message: "successful delete" });
    } catch (err) {
        next(err);
    }
};

export default {  };