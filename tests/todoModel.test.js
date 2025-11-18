import "./setup.js";
import { expect } from "chai";
import { TodoModel } from "../src/models/todoModel.js";
import { db } from "../src/models/db.js";

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
});
