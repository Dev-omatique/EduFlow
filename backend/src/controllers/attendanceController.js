import Attendance from "../models/attendance.js";

const create = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.json(attendance);
  } catch (err) {
    res.status(500).json(err);
  }
};

const update = async (req,res) => {
    try{
        await Attendance.update(res.body,{
            where : { id : req.parms.id }
        });
        res.json({message : 'successful update'})
    }catch(err){
        res.status(500).json(err);
    }

};

const remove = async(req,res) =>{
    try{
        await Attendance.destroy(res.body,{
            where: { id : req.parms.id }
        });
        res.json({ message:'successful delete' })
    }catch(err){
        res.status(500).json(err);
    }
};

const getTypeAll = async (req, res) => {
  try {
    const { type, id } = req.params;

    let where = {};

    if (type === "user") {
      where = { studientId: id };
    } 
    else if (type === "cours") {
      where = { courseId: id };
    } 
    else {
      return res.status(400).json({ message: "Type invalide" });
    }

    const attendances = await Attendance.findAll({ where });
    res.json(attendances);

  } catch (err) {
    res.status(500).json(err);
  }
};

export default { create,update,delete:remove,getTypeAll }