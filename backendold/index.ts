import express from "express"
import router from "./routes/index.ts"
const port = 3001
const app = express()
app.use("/api",router)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
