const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Cart = require('./models/Cart');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking current database state...\n');

    // Count documents in each collection
    const userCount = await User.countDocuments();
    const outletCount = await Outlet.countDocuments();
    const orderCount = await Order.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const cartCount = await Cart.countDocuments();

    console.log('📊 CURRENT DATABASE STATE:');
    console.log('==========================');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🏪 Outlets: ${outletCount}`);
    console.log(`📦 Orders: ${orderCount}`);
    console.log(`💳 Payments: ${paymentCount}`);
    console.log(`🛒 Carts: ${cartCount}`);

    // Get sample data
    if (userCount > 0) {
      const sampleUsers = await User.find().limit(3);
      console.log('\n👥 Sample Users:');
      sampleUsers.forEach(user => {
        console.log(`   ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    if (outletCount > 0) {
      const sampleOutlets = await Outlet.find().limit(3);
      console.log('\n🏪 Sample Outlets:');
      sampleOutlets.forEach(outlet => {
        console.log(`   ${outlet.name} - ${outlet.menu.length} menu items`);
      });
    }

    if (orderCount > 0) {
      const sampleOrders = await Order.find().limit(3);
      console.log('\n📦 Sample Orders:');
      sampleOrders.forEach(order => {
        console.log(`   Order ${order._id} - ${order.status} - ₹${order.totalAmount}`);
      });
    } else {
      console.log('\n❌ No orders found in database');
    }

    if (paymentCount > 0) {
      const samplePayments = await Payment.find().limit(3);
      console.log('\n💳 Sample Payments:');
      samplePayments.forEach(payment => {
        console.log(`   Payment ${payment._id} - ${payment.paymentStatus} - ₹${payment.amount}`);
      });
    } else {
      console.log('\n❌ No payments found in database');
    }

    // Check if we need to populate orders and payments
    if (orderCount === 0 || paymentCount === 0) {
      console.log('\n⚠️ Orders or Payments collection is empty!');
      console.log('🔧 Need to populate orders and payments data');
      return false;
    }

    return true;

  } catch (error) {
    console.error('❌ Error checking database:', error);
    return false;
  } finally {
    mongoose.connection.close();
  }
};

// Run the check
checkDatabase().then(isComplete => {
  if (isComplete) {
    console.log('\n✅ Database is complete and ready!');
  } else {
    console.log('\n🔧 Database needs orders and payments data');
  }
});
