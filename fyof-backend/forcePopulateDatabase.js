const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Cart = require('./models/Cart');

// Connect to MongoDB with explicit database name
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof';
console.log('Connecting to:', MONGO_URI);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const forcePopulateDatabase = async () => {
  try {
    console.log('🚀 Force populating FYOF database...\n');

    // Clear existing orders, payments, and carts
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Cart.deleteMany({});
    console.log('🗑️ Cleared existing orders, payments, and carts');

    // Get existing users and outlets
    const users = await User.find();
    const outlets = await Outlet.find();
    
    console.log(`Found ${users.length} users and ${outlets.length} outlets`);
    
    if (users.length === 0 || outlets.length === 0) {
      console.log('❌ No users or outlets found. Please run seedEverything.js first');
      return;
    }

    const customers = users.filter(u => u.role === 'user');
    const vendors = users.filter(u => u.role === 'vendor');

    console.log(`Using ${customers.length} customers and ${vendors.length} vendors`);

    // Helper function to generate transaction ID
    const generateTransactionId = (method) => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 8).toUpperCase();
      return `${method.toUpperCase()}${timestamp}${random}`;
    };

    // Helper function to calculate fees
    const calculateFees = (amount, method) => {
      let platformFee = Math.round(amount * 0.02); // 2% platform fee
      let paymentGatewayFee = 0;
      
      switch (method) {
        case 'card':
          paymentGatewayFee = Math.round(amount * 0.025); // 2.5% for cards
          break;
        case 'upi':
          paymentGatewayFee = Math.round(amount * 0.01); // 1% for UPI
          break;
        case 'wallet':
          paymentGatewayFee = Math.round(amount * 0.015); // 1.5% for wallets
          break;
        case 'cash':
          paymentGatewayFee = 0; // No gateway fee for cash
          break;
      }
      
      return { platformFee, paymentGatewayFee };
    };

    // Create orders with payments
    const ordersToCreate = [
      {
        customerId: customers[0]._id,
        outletId: outlets[0]._id,
        items: [
          { itemId: outlets[0].menu[0]._id, quantity: 2, price: outlets[0].menu[0].price },
          { itemId: outlets[0].menu[1]._id, quantity: 1, price: outlets[0].menu[1].price }
        ],
        paymentMethod: 'card',
        deliveryAddress: '123 Green Valley, Dehradun',
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        customerId: customers[1]._id,
        outletId: outlets[1]._id,
        items: [
          { itemId: outlets[1].menu[0]._id, quantity: 2, price: outlets[1].menu[0].price },
          { itemId: outlets[1].menu[1]._id, quantity: 1, price: outlets[1].menu[1].price }
        ],
        paymentMethod: 'upi',
        deliveryAddress: '456 Tech Park, Dehradun',
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        customerId: customers[2]._id,
        outletId: outlets[2]._id,
        items: [
          { itemId: outlets[2].menu[0]._id, quantity: 3, price: outlets[2].menu[0].price },
          { itemId: outlets[2].menu[1]._id, quantity: 2, price: outlets[2].menu[1].price }
        ],
        paymentMethod: 'wallet',
        deliveryAddress: '789 University Area, Dehradun',
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        customerId: customers[3]._id,
        outletId: outlets[3]._id,
        items: [
          { itemId: outlets[3].menu[0]._id, quantity: 2, price: outlets[3].menu[0].price }
        ],
        paymentMethod: 'cash',
        deliveryAddress: '321 Residential Complex, Dehradun',
        status: 'completed',
        paymentStatus: 'pending'
      },
      {
        customerId: customers[4]._id,
        outletId: outlets[4]._id,
        items: [
          { itemId: outlets[4].menu[0]._id, quantity: 1, price: outlets[4].menu[0].price },
          { itemId: outlets[4].menu[1]._id, quantity: 1, price: outlets[4].menu[1].price }
        ],
        paymentMethod: 'card',
        deliveryAddress: '654 Mall Road, Dehradun',
        status: 'processing',
        paymentStatus: 'paid'
      },
      {
        customerId: customers[0]._id,
        outletId: outlets[1]._id,
        items: [
          { itemId: outlets[1].menu[2]._id, quantity: 1, price: outlets[1].menu[2].price }
        ],
        paymentMethod: 'upi',
        deliveryAddress: '987 Sector 5, Dehradun',
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        customerId: customers[1]._id,
        outletId: outlets[0]._id,
        items: [
          { itemId: outlets[0].menu[2]._id, quantity: 1, price: outlets[0].menu[2].price }
        ],
        paymentMethod: 'wallet',
        deliveryAddress: '147 Corporate Park, Dehradun',
        status: 'pending',
        paymentStatus: 'pending'
      }
    ];

    console.log('\n📦 Creating orders and payments...');

    const createdOrders = [];
    const createdPayments = [];

    for (let i = 0; i < ordersToCreate.length; i++) {
      const orderData = ordersToCreate[i];
      
      // Calculate total amount
      const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Calculate estimated time
      const estimatedTime = Math.max(15, orderData.items.length * 8);

      // Create order
      const order = new Order({
        customerId: orderData.customerId,
        outletId: orderData.outletId,
        items: orderData.items,
        totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        status: orderData.status,
        estimatedTime,
        remainingTime: orderData.status === 'completed' ? 0 : estimatedTime,
        deliveryAddress: orderData.deliveryAddress,
        priority: 1
      });

      const savedOrder = await order.save();
      createdOrders.push(savedOrder);
      console.log(`✅ Created order ${i + 1}: ${savedOrder._id} - ₹${totalAmount}`);

      // Create payment record if not cash or if cash is completed
      if (orderData.paymentMethod !== 'cash' || orderData.paymentStatus === 'paid') {
        const fees = calculateFees(totalAmount, orderData.paymentMethod);
        
        const payment = new Payment({
          orderId: savedOrder._id,
          customerId: orderData.customerId,
          outletId: orderData.outletId,
          amount: totalAmount,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus === 'paid' ? 'completed' : orderData.paymentStatus,
          transactionId: orderData.paymentStatus === 'paid' ? generateTransactionId(orderData.paymentMethod) : null,
          fees: {
            platformFee: fees.platformFee,
            paymentGatewayFee: fees.paymentGatewayFee,
            totalFees: fees.platformFee + fees.paymentGatewayFee
          },
          paymentDate: new Date(),
          completedAt: orderData.paymentStatus === 'paid' ? new Date() : null,
          paymentDetails: getPaymentDetails(orderData.paymentMethod),
          metadata: {
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop',
            location: {
              city: 'Dehradun',
              state: 'Uttarakhand',
              country: 'India'
            }
          }
        });

        const savedPayment = await payment.save();
        createdPayments.push(savedPayment);
        console.log(`💳 Created payment ${i + 1}: ${savedPayment._id} - ${orderData.paymentMethod.toUpperCase()}`);
      }
    }

    // Create active carts
    console.log('\n🛒 Creating active carts...');
    
    const cartsToCreate = [
      {
        userId: customers[0]._id,
        outletId: outlets[1]._id,
        items: [
          {
            itemId: outlets[1].menu[0]._id,
            itemName: outlets[1].menu[0].itemName,
            price: outlets[1].menu[0].price,
            quantity: 2
          },
          {
            itemId: outlets[1].menu[3]._id,
            itemName: outlets[1].menu[3].itemName,
            price: outlets[1].menu[3].price,
            quantity: 1
          }
        ]
      },
      {
        userId: customers[2]._id,
        outletId: outlets[0]._id,
        items: [
          {
            itemId: outlets[0].menu[1]._id,
            itemName: outlets[0].menu[1].itemName,
            price: outlets[0].menu[1].price,
            quantity: 1
          },
          {
            itemId: outlets[0].menu[4]._id,
            itemName: outlets[0].menu[4].itemName,
            price: outlets[0].menu[4].price,
            quantity: 2
          }
        ]
      },
      {
        userId: customers[4]._id,
        outletId: outlets[2]._id,
        items: [
          {
            itemId: outlets[2].menu[0]._id,
            itemName: outlets[2].menu[0].itemName,
            price: outlets[2].menu[0].price,
            quantity: 2
          }
        ]
      }
    ];

    const createdCarts = [];
    for (let i = 0; i < cartsToCreate.length; i++) {
      const cartData = cartsToCreate[i];
      const total = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const cart = new Cart({
        userId: cartData.userId,
        outletId: cartData.outletId,
        items: cartData.items,
        total
      });

      const savedCart = await cart.save();
      createdCarts.push(savedCart);
      console.log(`🛒 Created cart ${i + 1}: ${savedCart._id} - ₹${total}`);
    }

    // Final verification
    const finalOrderCount = await Order.countDocuments();
    const finalPaymentCount = await Payment.countDocuments();
    const finalCartCount = await Cart.countDocuments();

    console.log('\n🎉 FORCE POPULATION COMPLETED!');
    console.log('================================');
    console.log(`📦 Orders created: ${finalOrderCount}`);
    console.log(`💳 Payments created: ${finalPaymentCount}`);
    console.log(`🛒 Carts created: ${finalCartCount}`);

    // Show sample data
    console.log('\n📊 Sample Data:');
    const sampleOrder = await Order.findOne().populate('customerId', 'name').populate('outletId', 'name');
    if (sampleOrder) {
      console.log(`Order: ${sampleOrder._id} - ${sampleOrder.customerId.name} - ${sampleOrder.outletId.name} - ₹${sampleOrder.totalAmount}`);
    }

    const samplePayment = await Payment.findOne().populate('customerId', 'name');
    if (samplePayment) {
      console.log(`Payment: ${samplePayment._id} - ${samplePayment.customerId.name} - ${samplePayment.paymentMethod} - ₹${samplePayment.amount}`);
    }

    const sampleCart = await Cart.findOne().populate('userId', 'name');
    if (sampleCart) {
      console.log(`Cart: ${sampleCart._id} - ${sampleCart.userId.name} - ${sampleCart.items.length} items - ₹${sampleCart.total}`);
    }

    console.log('\n✅ Your MongoDB database now has visible orders, payments, and carts!');
    console.log('🔍 Check your MongoDB Compass and refresh the fyof database');

  } catch (error) {
    console.error('❌ Error force populating database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Helper function to generate payment details
function getPaymentDetails(method) {
  switch (method) {
    case 'card':
      return {
        cardType: ['Visa', 'Mastercard', 'RuPay'][Math.floor(Math.random() * 3)],
        cardLast4: Math.floor(1000 + Math.random() * 9000).toString()
      };
    case 'upi':
      return {
        upiId: ['user@paytm', 'user@phonepe', 'user@googlepay'][Math.floor(Math.random() * 3)],
        upiApp: ['Paytm', 'PhonePe', 'GooglePay'][Math.floor(Math.random() * 3)]
      };
    case 'wallet':
      return {
        walletType: ['Paytm', 'PhonePe', 'MobiKwik'][Math.floor(Math.random() * 3)],
        walletTransactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6)}`
      };
    case 'cash':
      return {
        cashCollectedBy: 'Delivery Partner',
        cashCollectionTime: null
      };
    default:
      return {};
  }
}

// Run the force population
forcePopulateDatabase();
