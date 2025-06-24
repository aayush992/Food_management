const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Outlet = require('../models/Outlet');
const PaymentService = require('../services/PaymentService');

const router = express.Router();

// Create order from cart (checkout)
router.post('/checkout', async (req, res) => {
  try {
    const { userId, paymentMethod, deliveryAddress } = req.body;
    
    if (!userId || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId }).populate('outletId');
    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ error: 'Cart is empty' });
    }

    // Calculate estimated time based on items
    const estimatedTime = Math.max(15, cart.items.length * 8); // Minimum 15 minutes

    // Create order
    const order = new Order({
      customerId: userId,
      outletId: cart.outletId._id,
      items: cart.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: cart.total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
      estimatedTime,
      remainingTime: estimatedTime,
      deliveryAddress: deliveryAddress || 'Pickup from outlet'
    });

    // Generate payment ID for non-cash payments
    if (paymentMethod !== 'cash') {
      order.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    }

    await order.save();

    // Clear cart after successful order
    await Cart.deleteOne({ userId });

    // Populate order details for response
    await order.populate([
      { path: 'customerId', select: 'name email' },
      { path: 'outletId', select: 'name location' }
    ]);

    res.json({
      success: true,
      message: 'Order placed successfully',
      order,
      paymentRequired: paymentMethod !== 'cash'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process payment
router.post('/payment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentData, paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let paymentResult;

    // Process payment based on method
    switch (paymentMethod || order.paymentMethod) {
      case 'card':
        paymentResult = await PaymentService.processCardPayment(order, paymentData);
        break;
      case 'upi':
        paymentResult = await PaymentService.processUPIPayment(order, paymentData);
        break;
      case 'wallet':
        paymentResult = await PaymentService.processWalletPayment(order, paymentData);
        break;
      case 'razorpay':
        paymentResult = await PaymentService.verifyRazorpayPayment(paymentData);
        break;
      default:
        return res.status(400).json({ error: 'Invalid payment method' });
    }

    if (paymentResult.success) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentId = paymentResult.transactionId || paymentResult.paymentId;
      await order.save();

      res.json({
        success: true,
        message: paymentResult.message || 'Payment successful',
        order,
        transactionId: paymentResult.transactionId
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: paymentResult.error || 'Payment failed',
        order
      });
    }

  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { customerId: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('outletId', 'name location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vendor's orders
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status, limit = 10, page = 1 } = req.query;

    // First get outlets owned by this vendor
    const outlets = await Outlet.find({ vendor: vendorId }).select('_id');
    const outletIds = outlets.map(outlet => outlet._id);

    const query = { outletId: { $in: outletIds } };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name email')
      .populate('outletId', 'name location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        hasNext: page * limit < totalOrders,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (for vendors)
router.put('/status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, vendorId } = req.body;

    const order = await Order.findById(orderId).populate('outletId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify vendor owns this outlet
    if (order.outletId.vendor.toString() !== vendorId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    order.status = status;
    
    if (status === 'processing' && !order.startTime) {
      order.startTime = new Date();
    }
    
    if (status === 'completed') {
      order.completionTime = new Date();
      if (order.startTime) {
        order.turnaroundTime = Math.round((order.completionTime - order.startTime) / (1000 * 60)); // in minutes
      }
    }

    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get available payment methods
router.get('/payment-methods', (req, res) => {
  try {
    const paymentMethods = PaymentService.getAvailablePaymentMethods();
    res.json({
      success: true,
      paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create Razorpay order
router.post('/create-razorpay-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const razorpayOrder = await PaymentService.createRazorpayOrder(order);

    if (razorpayOrder.success) {
      res.json({
        success: true,
        razorpayOrderId: razorpayOrder.orderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key'
      });
    } else {
      res.status(400).json({
        success: false,
        error: razorpayOrder.error
      });
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Process refund
router.post('/refund/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, amount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ error: 'Order payment not completed' });
    }

    const refundAmount = amount || order.totalAmount;
    const refundResult = await PaymentService.processRefund(order.paymentId, refundAmount, reason);

    if (refundResult.success) {
      order.paymentStatus = 'refunded';
      order.status = 'cancelled';
      await order.save();

      res.json({
        success: true,
        message: 'Refund processed successfully',
        refundId: refundResult.refundId,
        amount: refundResult.amount
      });
    } else {
      res.status(400).json({
        success: false,
        error: refundResult.error
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order details (must be last to avoid conflicts)
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customerId', 'name email')
      .populate('outletId', 'name location vendor');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
