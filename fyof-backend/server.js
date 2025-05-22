const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Routes
const authRoutes = require('./routes/auth');
const outletRoutes = require('./routes/outlet');
const cartRoutes = require('./routes/cart');
const orderProcessingRoutes = require('./routes/orderProcessing');

app.use('/api/auth', authRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/process', orderProcessingRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('FYOF backend running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
