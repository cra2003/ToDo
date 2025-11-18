import { todoService } from "../services/todoService.js";

export const todoController = {
  async getAll(req, res, next) {
    try {
      const todos = await todoService.getAll();
      console.log("#A4", JSON.stringify(todos));
      res.json(todos);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const todo = await todoService.getById(req.params.id);
      if (!todo) return res.status(404).json({ error: "Todo not found" });
      res.json(todo);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title, priority } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
      }
      const todo = await todoService.create({ title: title.trim(), priority });
      res.status(201).json(todo);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await todoService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Todo not found" });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const deleted = await todoService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Todo not found" });
      res.json({ message: "Todo deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
};
