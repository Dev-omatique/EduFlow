import { Op } from 'sequelize';
import db from '../models/index.js'

const { Roles } = db

const getAll = async (req,res,next) =>{
    try{
        const roles = await Roles.findAll()
        res.status(200).json(roles)
    }catch(err){
        next(err)
    }
};

const create = async (req, res, next) => {
  try {
    const roles = await Roles.create(req.body);
    res.status(201).json(roles);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    await Roles.update(req.body, {
      where: { id: req.params.id }
    });

    res.json({ message: "successful update" });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await Roles.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: "successful delete" });
  } catch (err) {
    next(err);
  }
};


export default { getAll,create,update,delete: remove };