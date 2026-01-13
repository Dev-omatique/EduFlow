import express from "express";
import sequelize from "./db.js";
import UsersRoutes from "./routes/UsersRoutes.js";

import "./models/Role.js";
import "./models/User.js";

const app = express();
app.use(express.json()); // Permet de lire le JSON dans les requêtes POST

app.use("/users", UsersRoutes);

const PORT = 3001;

async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Database synchronized successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
}

startServer();