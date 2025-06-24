const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    quantity: Number,
    price: Number
  }],
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet'],
    required: true
  },
  paymentId: {
    type: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  priority: {
    type: Number,
    default: 1 // 1: Normal, 2: Premium, 3: VIP
  },
  estimatedTime: {
    type: Number,
    required: true // in minutes
  },
  remainingTime: {
    type: Number
  },
  arrivalTime: {
    type: Date,
    default: Date.now
  },
  startTime: Date,
  completionTime: Date,
  resourceAllocation: {
    chefs: Number,
    stations: Number,
    delivery: Number
  },
  waitingTime: Number,
  turnaroundTime: Number,

  // OS Algorithm Data
  algorithmData: {
    deliveryRoute: {
      algorithm: { type: String, default: 'Dijkstra' },
      calculatedDistance: Number,
      optimizedPath: [String],
      routeEfficiency: Number,
      trafficFactor: { type: Number, default: 1.0 },
      calculationTime: Number // Algorithm execution time in ms
    },
    scheduling: {
      algorithm: String, // FCFS, SJF, Priority, RoundRobin, SRTF
      arrivalTime: { type: Number, default: 0 },
      burstTime: Number, // Cooking time
      waitingTime: Number,
      turnaroundTime: Number,
      responseTime: Number,
      completionTime: Number,
      schedulingEfficiency: Number
    },
    performance: {
      algorithmExecutionTime: Number,
      systemLoad: Number,
      memoryUsage: Number,
      cpuUsage: Number,
      optimizationLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
