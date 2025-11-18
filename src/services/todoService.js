import { TodoModel } from "../models/todoModel.js";

export const todoService = {
  async getAll() {
    return TodoModel.getAll();
  },
  async getById(id) {
    return TodoModel.getById(id);
  },
  async create(data) {
    return TodoModel.create(data);
  },
  async update(id, data) {
    return TodoModel.update(id, data);
  },
  async delete(id) {
    return TodoModel.delete(id);
  },
};
