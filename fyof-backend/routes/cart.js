const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const router = express.Router();

// Add to cart
router.post('/add', async (req, res) => {
  const { userId, item } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [item], total: item.price });
  } else {
    cart.items.push(item);
    cart.total += item.price;
  }

  await cart.save();
  res.json(cart);
});

// Checkout / Create Order
router.post('/checkout', async (req, res) => {
  const { userId, paymentMethod } = req.body;
  const cart = await Cart.findOne({ userId });

  if (!cart) return res.status(404).json({ error: 'Cart not found' });

  const order = new Order({
    userId,
    items: cart.items,
    totalAmount: cart.total,
    paymentMethod,
    status: paymentMethod.includes('Online') ? 'Paid' : 'Cash on Delivery'
  });

  await order.save();
  await Cart.deleteOne({ userId });

  res.json({ message: 'Order placed', order });
});

module.exports = router;
