const { ProcessScheduler, MemoryManager, ResourceManager, ProducerConsumer } = require('../algorithms');
const Order = require('../models/Order');

class OrderProcessingService {
    constructor() {
        this.scheduler = new ProcessScheduler();
        this.memoryManager = new MemoryManager(1024 * 10); // 10KB for menu cache
        this.resourceManager = new ResourceManager([5, 3, 8]); // 5 chefs, 3 stations, 8 delivery
        this.orderQueue = new ProducerConsumer(20); // Buffer size of 20 orders

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.scheduler.on('process_quantum_complete', async (data) => {
            await this.updateOrderProgress(data);
        });

        this.scheduler.on('process_complete', async (data) => {
            await this.completeOrder(data);
        });

        this.orderQueue.on('produced', (order) => {
            console.log(`Order ${order.id} added to queue`);
        });

        this.orderQueue.on('consumed', (order) => {
            console.log(`Processing order ${order.id}`);
        });
    }

    async addOrder(orderData) {
        try {
            // Create order in database
            const order = new Order({
                ...orderData,
                remainingTime: orderData.estimatedTime
            });
            await order.save();

            // Add to processing queue
            await this.orderQueue.produce(order);

            // Add to scheduler
            this.scheduler.addProcess({
                id: order._id,
                estimatedTime: order.estimatedTime,
                priority: order.priority,
                arrivalTime: order.arrivalTime
            });

            return order;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    }

    async processOrders(algorithm = 'fcfs') {
        try {
            const pendingOrders = await Order.find({ status: 'pending' });
            let processedOrders;

            switch(algorithm) {
                case 'sjf':
                    processedOrders = this.scheduler.sjf(pendingOrders);
                    break;
                case 'priority':
                    processedOrders = this.scheduler.priorityScheduling(pendingOrders);
                    break;
                case 'roundRobin':
                    processedOrders = await this.scheduler.roundRobin(pendingOrders);
                    break;
                case 'fcfs':
                default:
                    processedOrders = this.scheduler.fcfs(pendingOrders);
            }

            // Update order sequence in database
            for (const order of processedOrders) {
                await Order.findByIdAndUpdate(order.id, {
                    status: 'processing',
                    startTime: new Date()
                });
            }

            return processedOrders;
        } catch (error) {
            console.error('Error processing orders:', error);
            throw error;
        }
    }

    async allocateResources(orderId) {
        try {
            const order = await Order.findById(orderId);
            const resourceNeeds = this.calculateResourceNeeds(order);

            const allocated = this.resourceManager.requestResources(
                orderId,
                [resourceNeeds.chefs, resourceNeeds.stations, resourceNeeds.delivery]
            );

            if (allocated) {
                await Order.findByIdAndUpdate(orderId, {
                    resourceAllocation: resourceNeeds
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error allocating resources:', error);
            throw error;
        }
    }

    calculateResourceNeeds(order) {
        // Simple resource calculation based on order size
        const itemCount = order.items.length;
        return {
            chefs: Math.ceil(itemCount / 2),
            stations: Math.ceil(itemCount / 3),
            delivery: 1
        };
    }

    async updateOrderProgress(data) {
        try {
            await Order.findByIdAndUpdate(data.processId, {
                remainingTime: data.remainingTime
            });
        } catch (error) {
            console.error('Error updating order progress:', error);
        }
    }

    async completeOrder(data) {
        try {
            const order = await Order.findById(data.processId);
            if (!order) return;

            // Release resources
            if (order.resourceAllocation) {
                this.resourceManager.releaseResources(
                    data.processId,
                    [
                        order.resourceAllocation.chefs,
                        order.resourceAllocation.stations,
                        order.resourceAllocation.delivery
                    ]
                );
            }

            // Update order status
            await Order.findByIdAndUpdate(data.processId, {
                status: 'completed',
                completionTime: new Date(data.completionTime),
                waitingTime: data.waitingTime,
                turnaroundTime: data.turnaroundTime
            });
        } catch (error) {
            console.error('Error completing order:', error);
        }
    }

    // Cache menu items
    cacheMenuItem(item) {
        this.memoryManager.lruPageReplacement(item._id.toString(), item);
    }

    // Get cached menu item
    getCachedMenuItem(itemId) {
        return this.memoryManager.accessPage(itemId.toString());
    }

    // Get system statistics
    getSystemStats() {
        return {
            memory: this.memoryManager.getStats(),
            resources: this.resourceManager.getResourceUtilization(),
            orderQueueSize: this.orderQueue.getBufferSize(),
            orderQueueCapacity: this.orderQueue.getCapacity()
        };
    }
}

module.exports = new OrderProcessingService(); 