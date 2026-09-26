import "dotenv/config";
import express from "express";
import itemsRouter from "./routes/itemsRoutes.js";

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ running: true });
});

app.use("/items", itemsRouter);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
