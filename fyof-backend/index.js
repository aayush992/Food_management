const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'FYOF Backend Server is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mock outlets data
app.get('/api/outlets', (req, res) => {
  res.json([
    { id: 1, name: 'Test Restaurant', location: 'Test Location' }
  ]);
});

// Mock algorithms data
app.get('/api/algorithms/locations', (req, res) => {
  res.json({
    success: true,
    locations: [
      { id: 'clock_tower', name: 'Clock Tower' },
      { id: 'it_park', name: 'IT Park' }
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
