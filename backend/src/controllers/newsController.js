import db from '../models/index.js'

const { News } = db

const getOne = async (req, res, next) => {
  try {
    const news = await News.findOne({where : { id : req.params.id }});
    res.status(201).json(news);
  } catch (err) {
    next(err);
  }
};

const getAll = async (req,res,next) =>{
    try{
        const news = await News.findAll()
        res.status(200).json(news)
    }catch(err){
        next(err)
    }
};

const create = async (req, res, next) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json(news);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    await News.update(req.body, {
      where: { id: req.params.id }
    });

    res.json({ message: "successful update" });
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await Attendance.destroy({
      where: { id: req.params.id }
    });
    res.json({ message: "successful delete" });
  } catch (err) {
    next(err);
  }
};

export default { getOne,getAll,create,update,delete: remove };