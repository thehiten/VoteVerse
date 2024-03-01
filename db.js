const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/voting_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// MongoDB connection instance
const db = mongoose.connection;

// Event listeners for database connection
db.on('connected', () => {
  console.log('Connected to MongoDB server');
});

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1); // Exit process with failure
});

db.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

// Export database connection instance
module.exports = db;

