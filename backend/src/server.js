import express from "express";
import UsersRoutes from "./routes/UsersRoutes.js";

const app = express();

app.use("/users", UsersRoutes);

const PORT = 3010;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
