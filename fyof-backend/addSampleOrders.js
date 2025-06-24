const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const addSampleOrders = async () => {
  try {
    console.log('📦 Adding sample orders...');

    // Get existing users and outlets
    const customers = await User.find({ role: 'user' });
    const outlets = await Outlet.find({});

    if (customers.length === 0 || outlets.length === 0) {
      console.log('❌ No customers or outlets found. Please run seedDatabaseFixed.js first.');
      return;
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️ Cleared existing orders');

    // Sample orders
    const orders = [
      {
        customerId: customers[0]._id,
        outletId: outlets[0]._id,
        items: [
          {
            quantity: 1,
            price: 280
          },
          {
            quantity: 2,
            price: 60
          }
        ],
        status: 'completed',
        priority: 1,
        estimatedTime: 30,
        remainingTime: 0,
        arrivalTime: new Date('2024-01-15T12:00:00'),
        startTime: new Date('2024-01-15T12:05:00'),
        completionTime: new Date('2024-01-15T12:35:00'),
        resourceAllocation: {
          chefs: 2,
          stations: 1,
          delivery: 1
        },
        waitingTime: 5,
        turnaroundTime: 35
      },
      {
        customerId: customers[1]._id,
        outletId: outlets[1]._id,
        items: [
          {
            quantity: 2,
            price: 120
          },
          {
            quantity: 1,
            price: 80
          }
        ],
        status: 'completed',
        priority: 1,
        estimatedTime: 15,
        remainingTime: 0,
        arrivalTime: new Date('2024-01-16T09:30:00'),
        startTime: new Date('2024-01-16T09:32:00'),
        completionTime: new Date('2024-01-16T09:47:00'),
        resourceAllocation: {
          chefs: 1,
          stations: 1,
          delivery: 1
        },
        waitingTime: 2,
        turnaroundTime: 17
      },
      {
        customerId: customers[2]._id,
        outletId: outlets[2]._id,
        items: [
          {
            quantity: 2,
            price: 40
          },
          {
            quantity: 1,
            price: 50
          },
          {
            quantity: 1,
            price: 35
          }
        ],
        status: 'completed',
        priority: 1,
        estimatedTime: 20,
        remainingTime: 0,
        arrivalTime: new Date('2024-01-17T14:15:00'),
        startTime: new Date('2024-01-17T14:18:00'),
        completionTime: new Date('2024-01-17T14:38:00'),
        resourceAllocation: {
          chefs: 1,
          stations: 2,
          delivery: 1
        },
        waitingTime: 3,
        turnaroundTime: 23
      },
      {
        customerId: customers[3]._id,
        outletId: outlets[0]._id,
        items: [
          {
            quantity: 1,
            price: 320
          },
          {
            quantity: 1,
            price: 180
          }
        ],
        status: 'processing',
        priority: 2,
        estimatedTime: 35,
        remainingTime: 15,
        arrivalTime: new Date(),
        startTime: new Date(Date.now() - 20 * 60000), // Started 20 minutes ago
        resourceAllocation: {
          chefs: 2,
          stations: 1,
          delivery: 1
        },
        waitingTime: 5,
        turnaroundTime: null
      },
      {
        customerId: customers[4]._id,
        outletId: outlets[1]._id,
        items: [
          {
            quantity: 1,
            price: 180
          }
        ],
        status: 'pending',
        priority: 1,
        estimatedTime: 25,
        remainingTime: 25,
        arrivalTime: new Date(),
        resourceAllocation: {
          chefs: 1,
          stations: 1,
          delivery: 1
        },
        waitingTime: 0,
        turnaroundTime: null
      },
      {
        customerId: customers[0]._id,
        outletId: outlets[3]._id,
        items: [
          {
            quantity: 2,
            price: 90
          },
          {
            quantity: 1,
            price: 40
          }
        ],
        status: 'completed',
        priority: 1,
        estimatedTime: 20,
        remainingTime: 0,
        arrivalTime: new Date('2024-01-18T11:00:00'),
        startTime: new Date('2024-01-18T11:03:00'),
        completionTime: new Date('2024-01-18T11:23:00'),
        resourceAllocation: {
          chefs: 1,
          stations: 1,
          delivery: 1
        },
        waitingTime: 3,
        turnaroundTime: 23
      },
      {
        customerId: customers[2]._id,
        outletId: outlets[4]._id,
        items: [
          {
            quantity: 1,
            price: 200
          },
          {
            quantity: 1,
            price: 150
          }
        ],
        status: 'completed',
        priority: 1,
        estimatedTime: 40,
        remainingTime: 0,
        arrivalTime: new Date('2024-01-19T13:30:00'),
        startTime: new Date('2024-01-19T13:35:00'),
        completionTime: new Date('2024-01-19T14:15:00'),
        resourceAllocation: {
          chefs: 2,
          stations: 1,
          delivery: 1
        },
        waitingTime: 5,
        turnaroundTime: 45
      }
    ];

    const insertedOrders = await Order.insertMany(orders);
    console.log(`📦 Created ${insertedOrders.length} sample orders`);

    console.log('\n✅ Sample orders added successfully!');
    console.log('\n📊 Orders Summary:');
    console.log(`📦 Total Orders: ${insertedOrders.length}`);
    console.log(`✅ Completed: ${orders.filter(o => o.status === 'completed').length}`);
    console.log(`🔄 Processing: ${orders.filter(o => o.status === 'processing').length}`);
    console.log(`⏳ Pending: ${orders.filter(o => o.status === 'pending').length}`);

    // Show some order details
    console.log('\n📋 Sample Order Details:');
    insertedOrders.slice(0, 3).forEach((order, index) => {
      console.log(`Order ${index + 1}: ${order.status} - ${order.items.length} items - ₹${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}`);
    });

  } catch (error) {
    console.error('❌ Error adding sample orders:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
addSampleOrders();
