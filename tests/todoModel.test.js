import "./setup.js";
import { expect } from "chai";
import { TodoModel } from "../src/models/todoModel.js";
import { db } from "../db.js";

describe("TodoModel - DB Integration", () => {
  beforeEach(() => {
    // Clear database before each test
    db.prepare("DELETE FROM todos").run();
  });

  it("should insert a new todo", () => {
    const newTodo = TodoModel.create({
      title: "Real DB test",
      priority: "high",
    });
    expect(newTodo).to.include({ title: "Real DB test", priority: "high" });
    expect(newTodo.id).to.be.a("number");
  });

  it("should retrieve all todos", () => {
    TodoModel.create({ title: "Todo 1" });
    TodoModel.create({ title: "Todo 2" });
    const todos = TodoModel.getAll();
    expect(todos).to.be.an("array").that.is.not.empty;
    expect(todos.length).to.be.at.least(2);
  });

  it("should update a todo", () => {
    const todo = TodoModel.create({ title: "To update" });
    const updated = TodoModel.update(todo.id, { completed: 1 });
    expect(updated.completed).to.equal(1);
  });

  it("should delete a todo", () => {
    const todo = TodoModel.create({ title: "To delete" });
    const result = TodoModel.delete(todo.id);
    expect(result).to.be.true;
  });

  it("should return null when getting non-existent todo", () => {
    const todo = TodoModel.getById(99999);
    expect(todo).to.be.undefined;
  });

  it("should return false when deleting non-existent todo", () => {
    const result = TodoModel.delete(99999);
    expect(result).to.be.false;
  });

  it("should use default priority 'medium' when not provided", () => {
    const todo = TodoModel.create({ title: "No priority" });
    expect(todo.priority).to.equal("medium");
  });

  it("should handle partial updates correctly", () => {
    const todo = TodoModel.create({ title: "Original", priority: "high" });
    const updated = TodoModel.update(todo.id, { completed: 1 });
    expect(updated.title).to.equal("Original");
    expect(updated.priority).to.equal("high");
    expect(updated.completed).to.equal(1);
  });

  it("should return null when updating non-existent todo", () => {
    const result = TodoModel.update(99999, { title: "New" });
    expect(result).to.be.null;
  });

  it("should handle empty title string", () => {
    const todo = TodoModel.create({ title: "", priority: "low" });
    expect(todo.title).to.equal("");
    expect(todo.id).to.be.a("number");
  });

  it("should handle all priority values", () => {
    const priorities = ["low", "medium", "high"];
    priorities.forEach((priority) => {
      const todo = TodoModel.create({ title: `Test ${priority}`, priority });
      expect(todo.priority).to.equal(priority);
    });
  });

  it("should handle completed status as 0 or 1", () => {
    const todo = TodoModel.create({ title: "Test completed" });
    expect(todo.completed).to.equal(0);

    const updated = TodoModel.update(todo.id, { completed: 1 });
    expect(updated.completed).to.equal(1);
  });
});
