import { expect } from "chai";
import sinon from "sinon";
import { todoController } from "../src/controllers/todoController.js";
import { todoService } from "../src/services/todoService.js";

describe("Todo Controller Layer", () => {
  let req, res, next, sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    req = { params: {}, body: {} };
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
    };
    next = sandbox.spy(); // spy to ensure error handler called
  });

  afterEach(() => sandbox.restore());

  describe("getAll", () => {
    it("should return all todos", async () => {
      const fakeTodos = [{ id: 1, title: "Test" }];
      sandbox.stub(todoService, "getAll").resolves(fakeTodos);

      await todoController.getAll(req, res, next);

      expect(res.json.calledWith(fakeTodos)).to.be.true;
    });

    it("should handle thrown errors", async () => {
      sandbox.stub(todoService, "getAll").throws(new Error("DB fail"));

      await todoController.getAll(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.an("error");
    });
  });

  describe("create", () => {
    it("should create a todo", async () => {
      req.body = { title: "New Todo" };
      const fakeTodo = { id: 1, title: "New Todo" };
      sandbox.stub(todoService, "create").resolves(fakeTodo);

      await todoController.create(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(fakeTodo)).to.be.true;
    });

    it("should return 400 for missing title", async () => {
      req.body = {};
      await todoController.create(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "Title is required" })).to.be.true;
    });
  });

  describe("delete", () => {
    it("should delete a todo", async () => {
      req.params.id = 1;
      sandbox.stub(todoService, "delete").resolves(true);

      await todoController.delete(req, res, next);
      expect(res.json.calledWith({ message: "Todo deleted successfully" })).to
        .be.true;
    });

    it("should return 404 if todo not found", async () => {
      req.params.id = 99;
      sandbox.stub(todoService, "delete").resolves(false);

      await todoController.delete(req, res, next);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Todo not found" })).to.be.true;
    });
  });

  describe("getById", () => {
    it("should return a todo by id", async () => {
      req.params.id = "1";
      const fakeTodo = { id: 1, title: "Test Todo" };
      sandbox.stub(todoService, "getById").resolves(fakeTodo);

      await todoController.getById(req, res, next);

      expect(res.json.calledWith(fakeTodo)).to.be.true;
      expect(next.called).to.be.false;
    });

    it("should return 404 for non-existent todo", async () => {
      req.params.id = "999";
      sandbox.stub(todoService, "getById").resolves(undefined);

      await todoController.getById(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Todo not found" })).to.be.true;
    });

    it("should handle errors in getById", async () => {
      req.params.id = "1";
      sandbox.stub(todoService, "getById").rejects(new Error("DB error"));

      await todoController.getById(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.an("error");
    });
  });

  describe("update", () => {
    it("should update a todo successfully", async () => {
      req.params.id = "1";
      req.body = { title: "Updated Title", completed: 1 };
      const fakeUpdated = { id: 1, title: "Updated Title", completed: 1 };
      sandbox.stub(todoService, "update").resolves(fakeUpdated);

      await todoController.update(req, res, next);

      expect(res.json.calledWith(fakeUpdated)).to.be.true;
      expect(todoService.update.calledWith("1", req.body)).to.be.true;
    });

    it("should return 404 when updating non-existent todo", async () => {
      req.params.id = "999";
      req.body = { title: "Updated" };
      sandbox.stub(todoService, "update").resolves(null);

      await todoController.update(req, res, next);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ error: "Todo not found" })).to.be.true;
    });

    it("should handle partial updates", async () => {
      req.params.id = "1";
      req.body = { completed: 1 };
      const fakeUpdated = { id: 1, title: "Original", completed: 1 };
      sandbox.stub(todoService, "update").resolves(fakeUpdated);

      await todoController.update(req, res, next);

      expect(res.json.calledWith(fakeUpdated)).to.be.true;
    });

    it("should handle errors in update", async () => {
      req.params.id = "1";
      req.body = { title: "Updated" };
      sandbox.stub(todoService, "update").rejects(new Error("Update failed"));

      await todoController.update(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.an("error");
    });
  });

  describe("input validation", () => {
    it("should reject empty title string", async () => {
      req.body = { title: "" };
      await todoController.create(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ error: "Title is required" })).to.be.true;
    });

    it("should reject whitespace-only title", async () => {
      req.body = { title: "   " };
      await todoController.create(req, res, next);
      expect(res.status.calledWith(400)).to.be.true;
    });

    it("should accept valid priority values", async () => {
      req.body = { title: "Test", priority: "high" };
      const fakeTodo = { id: 1, title: "Test", priority: "high" };
      sandbox.stub(todoService, "create").resolves(fakeTodo);

      await todoController.create(req, res, next);

      expect(res.status.calledWith(201)).to.be.true;
      expect(todoService.create.calledWith({ title: "Test", priority: "high" }))
        .to.be.true;
    });
  });

  describe("error handling", () => {
    it("should handle service errors in create", async () => {
      req.body = { title: "Test" };
      sandbox.stub(todoService, "create").rejects(new Error("Service error"));

      await todoController.create(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.an("error");
    });

    it("should handle service errors in delete", async () => {
      req.params.id = "1";
      sandbox.stub(todoService, "delete").rejects(new Error("Delete failed"));

      await todoController.delete(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.firstCall.args[0]).to.be.an("error");
    });
  });

  describe("using mock expectations", () => {
    it("should call res.json exactly once", async () => {
      const fakeTodos = [{ id: 1, title: "Mock Todo" }];
      sandbox.stub(todoService, "getAll").resolves(fakeTodos);

      // Create a fresh res object for this test since json is already stubbed
      const freshRes = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy(),
      };

      await todoController.getAll(req, freshRes, next);

      expect(freshRes.json.calledOnce).to.be.true;
      expect(freshRes.json.calledWith(fakeTodos)).to.be.true;
    });
  });
});
