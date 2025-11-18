import express from "express";
import { todoController } from "../controllers/todoController.js";

const router = express.Router();

router.get("/", todoController.getAll);
router.get("/:id", todoController.getById);
router.post("/", todoController.create);
router.put("/:id", todoController.update);
router.delete("/:id", todoController.delete);

export default router;
