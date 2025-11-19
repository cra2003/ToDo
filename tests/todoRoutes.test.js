// Set PORT to 0 BEFORE any imports to prevent port conflicts
process.env.PORT = "0";
process.env.DB_FILE = ":memory:";

import "./setup.js";
import request from "supertest";
import { expect } from "chai";

// Import app - server will start but on a random port (0 = OS assigns)
let app;
//let server;

before(async () => {
  // Import app and capture server instance if possible
  const appModule = await import("../src/app.js");
  app = appModule.default;

  // Get the server from app if it exists, or handle errors
  // The server is already listening, we just need to handle errors
  process.removeAllListeners("unhandledRejection");
  process.on("unhandledRejection", (err) => {
    if (err && err.code !== "EADDRINUSE") {
      throw err;
    }
  });
});

describe("Todo API Integration Tests", () => {
  beforeEach(async () => {
    // Clear database before each test
    const { db } = await import("../db.js");
    db.prepare("DELETE FROM todos").run();
  });

  it("should create a new todo", async () => {
    const newTodo = { title: "Integration Todo", priority: "high" };

    const res = await request(app).post("/api/todos").send(newTodo).expect(201);

    expect(res.body.title).to.equal("Integration Todo");
    expect(res.body.priority).to.equal("high");
  });

  it("should get all todos", async () => {
    const res = await request(app).get("/api/todos").expect(200);
    expect(res.body).to.be.an("array");
  });

  it("should return 400 for invalid input", async () => {
    const res = await request(app).post("/api/todos").send({}).expect(400);
    expect(res.body.error).to.match(/Title is required/);
  });

  it("should update an existing todo", async () => {
    const create = await request(app)
      .post("/api/todos")
      .send({ title: "Old Title" })
      .expect(201);

    const id = create.body.id;

    const update = await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: "New Title", completed: 1 })
      .expect(200);

    expect(update.body.title).to.equal("New Title");
    expect(update.body.completed).to.equal(1);
  });

  it("should delete a todo", async () => {
    const create = await request(app)
      .post("/api/todos")
      .send({ title: "To delete" })
      .expect(201);

    const id = create.body.id;
    const del = await request(app).delete(`/api/todos/${id}`).expect(200);

    expect(del.body.message).to.match(/deleted successfully/i);
  });

  it("should return 404 when fetching non-existent todo", async () => {
    const res = await request(app).get("/api/todos/9999").expect(404);
    expect(res.body.error).to.equal("Todo not found");
  });

  it("should get a todo by id", async () => {
    const create = await request(app)
      .post("/api/todos")
      .send({ title: "Get by ID test", priority: "high" })
      .expect(201);

    const id = create.body.id;
    const get = await request(app).get(`/api/todos/${id}`).expect(200);

    expect(get.body.id).to.equal(id);
    expect(get.body.title).to.equal("Get by ID test");
    expect(get.body.priority).to.equal("high");
  });

  it("should return 404 when updating non-existent todo", async () => {
    const res = await request(app)
      .put("/api/todos/9999")
      .send({ title: "Updated" })
      .expect(404);

    expect(res.body.error).to.equal("Todo not found");
  });

  it("should handle partial updates", async () => {
    const create = await request(app)
      .post("/api/todos")
      .send({ title: "Original", priority: "low" })
      .expect(201);

    const id = create.body.id;

    // Update only completed status
    const update = await request(app)
      .put(`/api/todos/${id}`)
      .send({ completed: 1 })
      .expect(200);

    expect(update.body.completed).to.equal(1);
    expect(update.body.title).to.equal("Original");
    expect(update.body.priority).to.equal("low");
  });

  it("should reject empty title in create", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ title: "" })
      .expect(400);

    expect(res.body.error).to.include("Title is required");
  });

  it("should reject missing title in create", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ priority: "high" })
      .expect(400);

    expect(res.body.error).to.include("Title is required");
  });

  it("should handle all priority values", async () => {
    const priorities = ["low", "medium", "high"];

    for (const priority of priorities) {
      const res = await request(app)
        .post("/api/todos")
        .send({ title: `Test ${priority}`, priority })
        .expect(201);

      expect(res.body.priority).to.equal(priority);
    }
  });

  it("should use default priority when not provided", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ title: "No priority" })
      .expect(201);

    expect(res.body.priority).to.equal("medium");
  });

  it("should handle completed status updates", async () => {
    const create = await request(app)
      .post("/api/todos")
      .send({ title: "Complete me" })
      .expect(201);

    expect(create.body.completed).to.equal(0);

    const id = create.body.id;
    const update = await request(app)
      .put(`/api/todos/${id}`)
      .send({ completed: 1 })
      .expect(200);

    expect(update.body.completed).to.equal(1);
  });

  it("should return 404 when deleting non-existent todo", async () => {
    const res = await request(app).delete("/api/todos/9999").expect(404);
    expect(res.body.error).to.equal("Todo not found");
  });

  it("should handle invalid id format gracefully", async () => {
    const res = await request(app).get("/api/todos/abc").expect(404);
    // Should handle gracefully, might return 404 or 400 depending on implementation
    expect(res.status).to.be.oneOf([400, 404]);
  });

  it("should handle multiple updates to same todo", async () => {
    const create = await request(app)
      .post("/api/todos")
      .send({ title: "Multi-update", priority: "low" })
      .expect(201);

    const id = create.body.id;

    const update1 = await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: "Updated once" })
      .expect(200);

    const update2 = await request(app)
      .put(`/api/todos/${id}`)
      .send({ completed: 1, priority: "high" })
      .expect(200);

    expect(update2.body.title).to.equal("Updated once");
    expect(update2.body.completed).to.equal(1);
    expect(update2.body.priority).to.equal("high");
  });
});
