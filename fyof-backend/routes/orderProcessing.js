const express = require('express');
const router = express.Router();
const OrderProcessingService = require('../services/OrderProcessingService');

// Add new order
router.post('/orders', async (req, res) => {
    try {
        const order = await OrderProcessingService.addOrder(req.body);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Process pending orders with specified algorithm
router.post('/process/:algorithm', async (req, res) => {
    try {
        const { algorithm } = req.params;
        const processedOrders = await OrderProcessingService.processOrders(algorithm);
        res.json(processedOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Allocate resources for an order
router.post('/allocate/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const allocated = await OrderProcessingService.allocateResources(orderId);
        res.json({ success: allocated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get system statistics
router.get('/stats', (req, res) => {
    try {
        const stats = OrderProcessingService.getSystemStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 