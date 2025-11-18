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
