// Test setup - runs before all tests
// Set environment variables before any imports

process.env.DB_FILE = process.env.DB_FILE || ':memory:';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
// Use port 0 to let OS assign an available port, preventing conflicts
process.env.PORT = process.env.PORT || '0';

// Suppress console output during tests for cleaner output
if (process.env.NODE_ENV === 'test') {
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = (...args) => {
    // Suppress db initialization and server startup messages in tests
    const msg = args[0];
    if (typeof msg === 'string') {
      if (msg.includes('SQLite database') || 
          msg.includes('Todo API listening') ||
          msg.includes('Health check') ||
          msg.includes('Todos API')) {
        return;
      }
    }
    originalLog(...args);
  };
  
  console.error = (...args) => {
    // Suppress expected errors in tests (port conflicts, etc.)
    const err = args[0];
    if (err && (err.code === 'EADDRINUSE' || err.syscall === 'listen')) {
      return; // Ignore port in use errors - multiple test files may import app
    }
    originalError(...args);
  };
  
  // Handle uncaught server errors to prevent test crashes
  process.on('unhandledRejection', (reason) => {
    if (reason && typeof reason === 'object' && reason.code === 'EADDRINUSE') {
      return; // Ignore port conflicts
    }
  });
}

