import db from '../models/index.js'

const { Permission } = db



export default { getOne,getAll,create,update,delete: remove };