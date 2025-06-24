const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const verifyDatabase = async () => {
  try {
    console.log('🔍 Verifying database contents...\n');

    // Count documents
    const userCount = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: 'user' });
    const vendorCount = await User.countDocuments({ role: 'vendor' });
    const outletCount = await Outlet.countDocuments();
    const orderCount = await Order.countDocuments();

    console.log('📊 DATABASE SUMMARY:');
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`   🛍️ Customers: ${customerCount}`);
    console.log(`   🏪 Vendors: ${vendorCount}`);
    console.log(`🏪 Total Outlets: ${outletCount}`);
    console.log(`📦 Total Orders: ${orderCount}\n`);

    // Get sample data
    const sampleCustomers = await User.find({ role: 'user' }).limit(3);
    const sampleVendors = await User.find({ role: 'vendor' }).limit(3);
    const sampleOutlets = await Outlet.find().populate('vendor', 'name email').limit(3);
    const sampleOrders = await Order.find().limit(3);

    console.log('👥 SAMPLE CUSTOMERS:');
    sampleCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.name} (${customer.email})`);
    });

    console.log('\n🏪 SAMPLE VENDORS:');
    sampleVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.name} (${vendor.email})`);
    });

    console.log('\n🍽️ SAMPLE OUTLETS:');
    sampleOutlets.forEach((outlet, index) => {
      console.log(`${index + 1}. ${outlet.name}`);
      console.log(`   Owner: ${outlet.vendor.name}`);
      console.log(`   Cuisine: ${outlet.cuisine.join(', ')}`);
      console.log(`   Rating: ${outlet.rating}/5`);
      console.log(`   Menu Items: ${outlet.menu.length}`);
      console.log(`   Location: ${outlet.location.address}, ${outlet.location.city}\n`);
    });

    console.log('📦 SAMPLE ORDERS:');
    sampleOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ID: ${order._id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Items: ${order.items.length}`);
      console.log(`   Total: ₹${order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}`);
      console.log(`   Estimated Time: ${order.estimatedTime} minutes\n`);
    });

    // Order statistics
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    console.log('📈 ORDER STATISTICS:');
    console.log(`✅ Completed: ${completedOrders}`);
    console.log(`🔄 Processing: ${processingOrders}`);
    console.log(`⏳ Pending: ${pendingOrders}`);

    // Menu statistics
    const totalMenuItems = await Outlet.aggregate([
      { $unwind: '$menu' },
      { $count: 'totalItems' }
    ]);

    console.log(`\n🍽️ MENU STATISTICS:`);
    console.log(`Total Menu Items: ${totalMenuItems[0]?.totalItems || 0}`);

    console.log('\n✅ Database verification completed successfully!');
    console.log('\n🎯 YOUR FYOF DATABASE IS FULLY POPULATED AND READY!');

  } catch (error) {
    console.error('❌ Error verifying database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the verification
verifyDatabase();
