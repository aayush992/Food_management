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
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
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
  turnaroundTime: Number
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
