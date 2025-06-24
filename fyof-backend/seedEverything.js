const mongoose = require('mongoose');
require('dotenv').config();

// Import seeding functions
const { seedCompleteDatabase, addOrdersAndPayments } = require('./seedDatabaseComplete');

// Import models for statistics
const User = require('./models/User');
const Outlet = require('./models/Outlet');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Cart = require('./models/Cart');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const seedEverything = async () => {
  try {
    console.log('🚀 Starting complete FYOF database population...\n');

    // Step 1: Seed basic data (users, outlets)
    const { customers, vendors, outlets } = await seedCompleteDatabase();

    // Step 2: Add orders and payments
    const { orders, payments } = await addOrdersAndPayments(customers, vendors, outlets);

    // Step 3: Add some active carts
    console.log('\n🛒 Adding active shopping carts...');
    const activeCarts = [
      {
        userId: customers[0]._id,
        outletId: outlets[1]._id, // Cozy Corner Café
        items: [
          {
            itemId: outlets[1].menu[0]._id,
            itemName: 'Cappuccino',
            price: 120,
            quantity: 2
          },
          {
            itemId: outlets[1].menu[3]._id,
            itemName: 'Margherita Pizza',
            price: 220,
            quantity: 1
          }
        ],
        total: 460
      },
      {
        userId: customers[2]._id,
        outletId: outlets[0]._id, // Spice Garden
        items: [
          {
            itemId: outlets[0].menu[1]._id,
            itemName: 'Paneer Tikka Masala',
            price: 250,
            quantity: 1
          },
          {
            itemId: outlets[0].menu[4]._id,
            itemName: 'Naan Bread',
            price: 60,
            quantity: 2
          }
        ],
        total: 370
      },
      {
        userId: customers[4]._id,
        outletId: outlets[2]._id, // Street Food Junction
        items: [
          {
            itemId: outlets[2].menu[0]._id,
            itemName: 'Pani Puri',
            price: 40,
            quantity: 2
          },
          {
            itemId: outlets[2].menu[3]._id,
            itemName: 'Dosa',
            price: 80,
            quantity: 1
          }
        ],
        total: 160
      }
    ];

    const createdCarts = await Cart.insertMany(activeCarts);
    console.log(`🛒 Created ${createdCarts.length} active shopping carts`);

    // Step 4: Generate comprehensive statistics
    console.log('\n📊 Generating database statistics...');
    
    const stats = {
      users: await User.countDocuments(),
      customers: await User.countDocuments({ role: 'user' }),
      vendors: await User.countDocuments({ role: 'vendor' }),
      outlets: await Outlet.countDocuments(),
      orders: await Order.countDocuments(),
      payments: await Payment.countDocuments(),
      activeCarts: await Cart.countDocuments(),
      totalMenuItems: outlets.reduce((total, outlet) => total + outlet.menu.length, 0)
    };

    // Payment statistics
    const paymentStats = await Payment.getPaymentStats();
    const paymentMethodStats = await Payment.getPaymentMethodStats();

    // Order statistics
    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Revenue statistics
    const revenueStats = await Payment.aggregate([
      {
        $match: { paymentStatus: 'completed' }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalFees: { $sum: '$fees.totalFees' },
          netRevenue: { $sum: { $subtract: ['$amount', '$fees.totalFees'] } },
          avgOrderValue: { $avg: '$amount' }
        }
      }
    ]);

    console.log('\n🎉 COMPLETE DATABASE POPULATION SUCCESSFUL!\n');

    console.log('📊 COMPREHENSIVE DATABASE STATISTICS:');
    console.log('=====================================');
    console.log(`👥 Total Users: ${stats.users}`);
    console.log(`   🛍️ Customers: ${stats.customers}`);
    console.log(`   🏪 Vendors: ${stats.vendors}`);
    console.log(`🏪 Outlets: ${stats.outlets}`);
    console.log(`🍽️ Menu Items: ${stats.totalMenuItems}`);
    console.log(`📦 Orders: ${stats.orders}`);
    console.log(`💳 Payment Records: ${stats.payments}`);
    console.log(`🛒 Active Carts: ${stats.activeCarts}`);

    if (paymentStats.length > 0) {
      console.log('\n💰 PAYMENT STATISTICS:');
      console.log('======================');
      console.log(`Total Payments: ${paymentStats[0].totalPayments}`);
      console.log(`Total Amount: ₹${paymentStats[0].totalAmount}`);
      console.log(`Total Fees: ₹${paymentStats[0].totalFees}`);
      console.log(`Average Order: ₹${Math.round(paymentStats[0].avgAmount)}`);
      console.log(`Success Rate: ${Math.round((paymentStats[0].successfulPayments / paymentStats[0].totalPayments) * 100)}%`);
    }

    if (paymentMethodStats.length > 0) {
      console.log('\n📱 PAYMENT METHOD BREAKDOWN:');
      console.log('============================');
      paymentMethodStats.forEach(method => {
        console.log(`${method._id.toUpperCase()}: ${method.count} payments, ₹${method.totalAmount}, ${Math.round(method.successRate * 100)}% success`);
      });
    }

    if (orderStats.length > 0) {
      console.log('\n📦 ORDER STATUS BREAKDOWN:');
      console.log('==========================');
      orderStats.forEach(status => {
        console.log(`${status._id.toUpperCase()}: ${status.count} orders, ₹${status.totalAmount}`);
      });
    }

    if (revenueStats.length > 0) {
      console.log('\n💵 REVENUE STATISTICS:');
      console.log('======================');
      console.log(`Total Revenue: ₹${revenueStats[0].totalRevenue}`);
      console.log(`Platform Fees: ₹${revenueStats[0].totalFees}`);
      console.log(`Net Revenue: ₹${revenueStats[0].netRevenue}`);
      console.log(`Average Order Value: ₹${Math.round(revenueStats[0].avgOrderValue)}`);
    }

    console.log('\n🔑 TEST LOGIN CREDENTIALS:');
    console.log('===========================');
    console.log('CUSTOMERS:');
    console.log('📧 sarah@example.com | 🔒 password123');
    console.log('📧 rahul@example.com | 🔒 password123');
    console.log('📧 priya@example.com | 🔒 password123');
    console.log('📧 amit@example.com | 🔒 password123');
    console.log('📧 neha@example.com | 🔒 password123');
    console.log('📧 arjun@example.com | 🔒 password123');
    console.log('📧 kavya@example.com | 🔒 password123');
    console.log('📧 rohan@example.com | 🔒 password123');

    console.log('\nVENDORS:');
    console.log('📧 rajesh@restaurant.com | 🔒 password123');
    console.log('📧 sunita@cafe.com | 🔒 password123');
    console.log('📧 mohammed@streetfood.com | 🔒 password123');
    console.log('📧 lakshmi@southindian.com | 🔒 password123');
    console.log('📧 vikram@punjabi.com | 🔒 password123');
    console.log('📧 anita@bakery.com | 🔒 password123');
    console.log('📧 deepak@fastfood.com | 🔒 password123');

    console.log('\n🚀 YOUR FYOF PLATFORM IS NOW FULLY POPULATED AND READY FOR PRODUCTION!');
    console.log('✅ Complete cart and order management system');
    console.log('✅ Comprehensive payment tracking');
    console.log('✅ Realistic dummy data for testing');
    console.log('✅ Multiple outlets with diverse menus');
    console.log('✅ Active shopping carts');
    console.log('✅ Order history with various statuses');
    console.log('✅ Payment records with detailed tracking');

    return {
      stats,
      paymentStats: paymentStats[0] || {},
      paymentMethodStats,
      orderStats,
      revenueStats: revenueStats[0] || {}
    };

  } catch (error) {
    console.error('❌ Error during complete database seeding:', error);
    throw error;
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the complete seeding
if (require.main === module) {
  seedEverything()
    .then(() => {
      console.log('\n🎯 Database population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database population failed:', error);
      process.exit(1);
    });
}

module.exports = { seedEverything };
