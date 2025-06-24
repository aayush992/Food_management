const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

const router = express.Router();

// Get all payments with filters
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      method, 
      customerId, 
      outletId, 
      startDate, 
      endDate, 
      limit = 20, 
      page = 1 
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.paymentStatus = status;
    if (method) filter.paymentMethod = method;
    if (customerId) filter.customerId = customerId;
    if (outletId) filter.outletId = outletId;
    
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter)
      .populate('customerId', 'name email')
      .populate('outletId', 'name location')
      .populate('orderId', 'status totalAmount')
      .sort({ paymentDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPayments = await Payment.countDocuments(filter);

    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / parseInt(limit)),
        totalPayments,
        hasNext: page * limit < totalPayments,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment by ID
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('customerId', 'name email')
      .populate('outletId', 'name location vendor')
      .populate('orderId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate, outletId } = req.query;

    // Build filter
    const filter = {};
    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) filter.paymentDate.$gte = new Date(startDate);
      if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }
    if (outletId) filter.outletId = outletId;

    // Get overall statistics
    const overallStats = await Payment.getPaymentStats(filter);
    
    // Get payment method breakdown
    const methodStats = await Payment.getPaymentMethodStats(filter);

    // Get daily revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyRevenue = await Payment.aggregate([
      {
        $match: {
          ...filter,
          paymentDate: { $gte: thirtyDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
            day: { $dayOfMonth: '$paymentDate' }
          },
          totalRevenue: { $sum: '$amount' },
          totalFees: { $sum: '$fees.totalFees' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        overall: overallStats[0] || {},
        paymentMethods: methodStats,
        dailyRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer payment history
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const payments = await Payment.find({ customerId })
      .populate('outletId', 'name location')
      .populate('orderId', 'status items')
      .sort({ paymentDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPayments = await Payment.countDocuments({ customerId });

    // Get customer payment summary
    const customerStats = await Payment.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$amount' },
          favoritePaymentMethod: { $first: '$paymentMethod' } // This is simplified
        }
      }
    ]);

    res.json({
      success: true,
      payments,
      customerStats: customerStats[0] || {},
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / parseInt(limit)),
        totalPayments
      }
    });

  } catch (error) {
    console.error('Error fetching customer payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get outlet payment history
router.get('/outlet/:outletId', async (req, res) => {
  try {
    const { outletId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const payments = await Payment.find({ outletId })
      .populate('customerId', 'name email')
      .populate('orderId', 'status items')
      .sort({ paymentDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalPayments = await Payment.countDocuments({ outletId });

    // Get outlet payment summary
    const outletStats = await Payment.aggregate([
      { $match: { outletId: mongoose.Types.ObjectId(outletId) } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalFees: { $sum: '$fees.totalFees' },
          netRevenue: { $sum: { $subtract: ['$amount', '$fees.totalFees'] } },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      payments,
      outletStats: outletStats[0] || {},
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPayments / parseInt(limit)),
        totalPayments
      }
    });

  } catch (error) {
    console.error('Error fetching outlet payments:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status (for admin/system use)
router.put('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.paymentStatus = status;
    
    if (status === 'completed') {
      payment.completedAt = new Date();
    } else if (status === 'failed') {
      payment.failureReason = reason;
    } else if (status === 'refunded') {
      payment.refund.isRefunded = true;
      payment.refund.refundReason = reason;
      payment.refund.refundDate = new Date();
      payment.refund.refundStatus = 'processed';
    }

    await payment.save();

    res.json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process refund
router.post('/:paymentId/refund', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.paymentStatus !== 'completed') {
      return res.status(400).json({ error: 'Can only refund completed payments' });
    }

    if (payment.refund.isRefunded) {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      return res.status(400).json({ error: 'Refund amount cannot exceed payment amount' });
    }

    // Generate refund transaction ID
    const refundTransactionId = `REF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    payment.refund = {
      isRefunded: true,
      refundAmount,
      refundTransactionId,
      refundReason: reason,
      refundDate: new Date(),
      refundStatus: 'processed'
    };

    payment.paymentStatus = 'refunded';
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundTransactionId,
      refundAmount,
      payment
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
