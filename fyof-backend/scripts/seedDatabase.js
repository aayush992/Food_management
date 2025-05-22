const mongoose = require('mongoose');
const Order = require('../models/Order');
require('dotenv').config();

// Dummy menu items
const menuItems = [
    { _id: new mongoose.Types.ObjectId(), name: 'Burger', price: 10 },
    { _id: new mongoose.Types.ObjectId(), name: 'Pizza', price: 15 },
    { _id: new mongoose.Types.ObjectId(), name: 'Salad', price: 8 },
    { _id: new mongoose.Types.ObjectId(), name: 'Pasta', price: 12 },
    { _id: new mongoose.Types.ObjectId(), name: 'Sandwich', price: 7 }
];

// Dummy users
const users = [
    { _id: new mongoose.Types.ObjectId(), name: 'Regular Customer', type: 'regular' },
    { _id: new mongoose.Types.ObjectId(), name: 'Premium Customer', type: 'premium' },
    { _id: new mongoose.Types.ObjectId(), name: 'VIP Customer', type: 'vip' }
];

// Dummy outlets
const outlets = [
    { _id: new mongoose.Types.ObjectId(), name: 'Main Branch' },
    { _id: new mongoose.Types.ObjectId(), name: 'Express Outlet' }
];

// Generate random orders
function generateOrders(count) {
    const orders = [];
    const startTime = Date.now();

    for (let i = 0; i < count; i++) {
        // Random selections
        const user = users[Math.floor(Math.random() * users.length)];
        const outlet = outlets[Math.floor(Math.random() * outlets.length)];
        const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
        
        // Select random items
        const items = [];
        for (let j = 0; j < itemCount; j++) {
            const item = menuItems[Math.floor(Math.random() * menuItems.length)];
            items.push({
                itemId: item._id,
                quantity: Math.floor(Math.random() * 2) + 1,
                price: item.price
            });
        }

        // Calculate estimated time based on items and complexity
        const estimatedTime = items.length * 5 + Math.floor(Math.random() * 10);

        // Set priority based on user type
        let priority;
        switch(user.type) {
            case 'vip': priority = 3; break;
            case 'premium': priority = 2; break;
            default: priority = 1;
        }

        // Create order
        orders.push({
            customerId: user._id,
            outletId: outlet._id,
            items: items,
            status: 'pending',
            priority: priority,
            estimatedTime: estimatedTime,
            remainingTime: estimatedTime,
            arrivalTime: new Date(startTime + (i * 60000)), // Orders arrive 1 minute apart
            resourceAllocation: {
                chefs: Math.ceil(items.length / 2),
                stations: Math.ceil(items.length / 3),
                delivery: 1
            }
        });
    }

    return orders;
}

// Seed database
async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing orders
        await Order.deleteMany({});
        console.log('Cleared existing orders');

        // Generate and insert new orders
        const orders = generateOrders(20); // Generate 20 dummy orders
        await Order.insertMany(orders);
        console.log('Inserted dummy orders');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeding
seedDatabase(); 