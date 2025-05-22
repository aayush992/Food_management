const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Outlet = require('../models/Outlet');
const { check, validationResult } = require('express-validator');

// @route   POST api/outlets
// @desc    Create an outlet
// @access  Private (Vendor only)
router.post('/', [auth, [
  check('name', 'Name is required').not().isEmpty(),
  check('location.address', 'Address is required').not().isEmpty(),
  check('cuisine', 'Cuisine type is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const newOutlet = new Outlet({
      ...req.body,
      vendor: req.user.id
    });

    const outlet = await newOutlet.save();
    
    // Emit socket event
    req.app.get('io').emit('outletUpdate', outlet);
    
    res.json(outlet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/outlets
// @desc    Get all outlets
// @access  Public
router.get('/', async (req, res) => {
  try {
    const outlets = await Outlet.find().populate('vendor', ['name', 'email']);
    res.json(outlets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/outlets/:id
// @desc    Get outlet by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id).populate('vendor', ['name', 'email']);
    if (!outlet) {
      return res.status(404).json({ msg: 'Outlet not found' });
    }
    res.json(outlet);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Outlet not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/outlets/:id
// @desc    Update outlet
// @access  Private (Vendor only)
router.put('/:id', auth, async (req, res) => {
  try {
    let outlet = await Outlet.findById(req.params.id);
    if (!outlet) {
      return res.status(404).json({ msg: 'Outlet not found' });
    }

    // Make sure user owns outlet
    if (outlet.vendor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    outlet = await Outlet.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Emit socket event
    req.app.get('io').emit('outletUpdate', outlet);
    
    res.json(outlet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/outlets/:id/menu
// @desc    Add menu item to outlet
// @access  Private (Vendor only)
router.post('/:id/menu', [auth, [
  check('itemName', 'Item name is required').not().isEmpty(),
  check('price', 'Price is required').isNumeric()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const outlet = await Outlet.findById(req.params.id);
    if (!outlet) {
      return res.status(404).json({ msg: 'Outlet not found' });
    }

    // Make sure user owns outlet
    if (outlet.vendor.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    outlet.menu.unshift(req.body);
    await outlet.save();
    
    // Emit socket event
    req.app.get('io').emit('outletUpdate', outlet);
    
    res.json(outlet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/outlets/:id
// @desc    Delete outlet
// @access  Private (Vendor only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id);
    
    if (!outlet) {
      return res.status(404).json({ msg: 'Outlet not found' });
    }

    await outlet.remove();
    
    // Emit socket event for deletion
    req.app.get('io').emit('outletDelete', req.params.id);
    
    res.json({ msg: 'Outlet removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/outlets/:id/toggle-status
// @desc    Toggle outlet status
// @access  Private (Vendor only)
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const outlet = await Outlet.findById(req.params.id);
    
    if (!outlet) {
      return res.status(404).json({ msg: 'Outlet not found' });
    }

    outlet.isOpen = !outlet.isOpen;
    await outlet.save();
    
    // Emit socket event
    req.app.get('io').emit('outletUpdate', outlet);
    
    res.json(outlet);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router; 