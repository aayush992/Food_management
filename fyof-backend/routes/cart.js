const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Outlet = require('../models/Outlet');

const router = express.Router();

// Get user's cart
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate('outletId', 'name location');

    if (!cart) {
      return res.json({ items: [], total: 0, message: 'Cart is empty' });
    }

    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, outletId, item } = req.body;

    if (!userId || !outletId || !item) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        outletId,
        items: [{
          itemId: item.itemId || item._id,
          itemName: item.itemName || item.name,
          price: item.price,
          quantity: item.quantity || 1
        }],
        total: item.price * (item.quantity || 1)
      });
    } else {
      // Check if cart is for the same outlet
      if (cart.outletId.toString() !== outletId) {
        return res.status(400).json({
          error: 'Cannot add items from different outlets. Please clear your cart first.'
        });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.itemId.toString() === (item.itemId || item._id)
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += (item.quantity || 1);
      } else {
        // Add new item
        cart.items.push({
          itemId: item.itemId || item._id,
          itemName: item.itemName || item.name,
          price: item.price,
          quantity: item.quantity || 1
        });
      }

      // Recalculate total
      cart.total = cart.items.reduce((sum, cartItem) =>
        sum + (cartItem.price * cartItem.quantity), 0
      );
    }

    await cart.save();
    await cart.populate('outletId', 'name location');
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update item quantity in cart
router.put('/update', async (req, res) => {
  try {
    const { userId, itemId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.itemId.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await cart.save();
    await cart.populate('outletId', 'name location');
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.itemId.toString() !== itemId);
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return res.json({ message: 'Cart cleared', items: [], total: 0 });
    }

    await cart.save();
    await cart.populate('outletId', 'name location');
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear entire cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.deleteOne({ userId });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
