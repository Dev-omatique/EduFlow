import express, { type Request, type Response } from "express"

const getAll = async (req:Request ,res:Response) => {
    
    res.send("test with express api")
}

export default { getAll }