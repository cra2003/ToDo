import express from "express";
import todoRoutes from "./routes/todoRoutes.js";
import "./db.js"; // Initialize database

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/todos", todoRoutes);

// Basic health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Todo API is running" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Unknown error" });
});

app.listen(PORT, () => {
  console.log(`✅ Todo API listening on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/`);
  console.log(`📋 Todos API: http://localhost:${PORT}/api/todos`);
});

export default app;
