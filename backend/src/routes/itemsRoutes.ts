import { Router } from "express";
import { upload } from "../middleware/uploadMiddleware.js";
import { uploadItem } from "../controllers/itemsController.js";

const router = Router();

router.post("/upload", upload.single("photo"), uploadItem);

export default router;