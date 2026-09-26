import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ running: true });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.post("/items/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No photo received" });
  }
  console.log("Received file:", req.file.originalname, req.file.size, "bytes");
  res.json({ ok: true, size: req.file.size });
});
