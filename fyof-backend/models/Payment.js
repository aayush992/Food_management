const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  outletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Outlet',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', 'razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  paymentGatewayResponse: {
    type: mongoose.Schema.Types.Mixed // Store gateway response data
  },
  paymentDetails: {
    // For card payments
    cardType: String, // Visa, Mastercard, etc.
    cardLast4: String, // Last 4 digits
    
    // For UPI payments
    upiId: String,
    upiApp: String, // GooglePay, PhonePe, Paytm
    
    // For wallet payments
    walletType: String, // Paytm, PhonePe, etc.
    walletTransactionId: String,
    
    // For cash payments
    cashCollectedBy: String,
    cashCollectionTime: Date
  },
  fees: {
    platformFee: {
      type: Number,
      default: 0
    },
    paymentGatewayFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  refund: {
    isRefunded: {
      type: Boolean,
      default: false
    },
    refundAmount: Number,
    refundTransactionId: String,
    refundReason: String,
    refundDate: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceType: String,
    location: {
      city: String,
      state: String,
      country: String
    }
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ outletId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentStatus: 1 });
paymentSchema.index({ paymentMethod: 1 });
paymentSchema.index({ paymentDate: -1 });

// Virtual for net amount (amount - fees)
paymentSchema.virtual('netAmount').get(function() {
  return this.amount - (this.fees.totalFees || 0);
});

// Pre-save middleware to calculate total fees
paymentSchema.pre('save', function(next) {
  if (this.fees.platformFee || this.fees.paymentGatewayFee) {
    this.fees.totalFees = (this.fees.platformFee || 0) + (this.fees.paymentGatewayFee || 0);
  }
  next();
});

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(filter = {}) {
  return await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fees.totalFees' },
        avgAmount: { $avg: '$amount' },
        successfulPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
        },
        failedPayments: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get payment method breakdown
paymentSchema.statics.getPaymentMethodStats = async function(filter = {}) {
  return await this.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' },
        successRate: {
          $avg: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
