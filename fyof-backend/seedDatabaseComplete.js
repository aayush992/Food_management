const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const Cart = require('./models/Cart');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const seedCompleteDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Outlet.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Cart.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create Users (Customers)
    const customers = [
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Amit Kumar',
        email: 'amit@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Neha Singh',
        email: 'neha@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Arjun Reddy',
        email: 'arjun@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Kavya Nair',
        email: 'kavya@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      }
    ];

    // Create Users (Vendors)
    const vendors = [
      {
        name: 'Rajesh Gupta',
        email: 'rajesh@restaurant.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      },
      {
        name: 'Sunita Devi',
        email: 'sunita@cafe.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      },
      {
        name: 'Mohammed Ali',
        email: 'mohammed@streetfood.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      },
      {
        name: 'Lakshmi Nair',
        email: 'lakshmi@southindian.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@punjabi.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      },
      {
        name: 'Anita Sharma',
        email: 'anita@bakery.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      },
      {
        name: 'Deepak Joshi',
        email: 'deepak@fastfood.com',
        password: await bcrypt.hash('password123', 10),
        role: 'vendor'
      }
    ];

    // Insert users
    const insertedCustomers = await User.insertMany(customers);
    const insertedVendors = await User.insertMany(vendors);
    console.log(`👥 Created ${insertedCustomers.length} customers and ${insertedVendors.length} vendors`);

    // Create Outlets with comprehensive menus
    const outlets = [
      {
        name: 'Spice Garden Restaurant',
        vendor: insertedVendors[0]._id,
        description: 'Authentic Indian cuisine with a modern twist',
        cuisine: ['Indian', 'North Indian', 'Vegetarian'],
        location: {
          address: 'Shop 12, Main Market, Dehradun',
          city: 'Dehradun'
        },
        rating: 4.5,
        menu: [
          {
            itemName: 'Butter Chicken',
            description: 'Creamy tomato-based curry with tender chicken pieces',
            price: 280,
            category: 'Main Course',
            isAvailable: true
          },
          {
            itemName: 'Paneer Tikka Masala',
            description: 'Grilled cottage cheese in rich tomato gravy',
            price: 250,
            category: 'Main Course',
            isAvailable: true
          },
          {
            itemName: 'Biryani Special',
            description: 'Aromatic basmati rice with spices',
            price: 320,
            category: 'Rice',
            isAvailable: true
          },
          {
            itemName: 'Dal Makhani',
            description: 'Creamy black lentils slow-cooked with butter',
            price: 180,
            category: 'Dal',
            isAvailable: true
          },
          {
            itemName: 'Naan Bread',
            description: 'Fresh baked Indian bread',
            price: 60,
            category: 'Bread',
            isAvailable: true
          },
          {
            itemName: 'Gulab Jamun',
            description: 'Sweet milk dumplings in sugar syrup',
            price: 80,
            category: 'Dessert',
            isAvailable: true
          }
        ]
      },
      {
        name: 'Cozy Corner Café',
        vendor: insertedVendors[1]._id,
        description: 'Perfect spot for coffee lovers and casual dining',
        cuisine: ['Continental', 'Italian', 'Beverages'],
        location: {
          address: 'Near Clock Tower, Dehradun',
          city: 'Dehradun'
        },
        rating: 4.2,
        menu: [
          {
            itemName: 'Cappuccino',
            description: 'Rich espresso with steamed milk and foam',
            price: 120,
            category: 'Beverages',
            isAvailable: true
          },
          {
            itemName: 'Chocolate Croissant',
            description: 'Buttery pastry filled with rich chocolate',
            price: 80,
            category: 'Pastry',
            isAvailable: true
          },
          {
            itemName: 'Caesar Salad',
            description: 'Fresh romaine lettuce with parmesan',
            price: 180,
            category: 'Salads',
            isAvailable: true
          },
          {
            itemName: 'Margherita Pizza',
            description: 'Classic pizza with tomato, mozzarella, and basil',
            price: 220,
            category: 'Pizza',
            isAvailable: true
          },
          {
            itemName: 'Iced Latte',
            description: 'Cold coffee with milk and ice',
            price: 140,
            category: 'Beverages',
            isAvailable: true
          }
        ]
      },
      {
        name: 'Street Food Junction',
        vendor: insertedVendors[2]._id,
        description: 'Authentic street food experience with hygiene',
        cuisine: ['Street Food', 'Chaat', 'Fast Food'],
        location: {
          address: 'Paltan Bazaar, Dehradun',
          city: 'Dehradun'
        },
        rating: 4.0,
        menu: [
          {
            itemName: 'Pani Puri',
            description: 'Crispy puris filled with spicy water',
            price: 40,
            category: 'Chaat',
            isAvailable: true
          },
          {
            itemName: 'Bhel Puri',
            description: 'Puffed rice mixed with vegetables',
            price: 50,
            category: 'Chaat',
            isAvailable: true
          },
          {
            itemName: 'Vada Pav',
            description: 'Mumbai style potato fritter in a bun',
            price: 35,
            category: 'Fast Food',
            isAvailable: true
          },
          {
            itemName: 'Dosa',
            description: 'Crispy South Indian crepe with potato filling',
            price: 80,
            category: 'South Indian',
            isAvailable: true
          },
          {
            itemName: 'Samosa',
            description: 'Crispy pastry with spiced potato filling',
            price: 25,
            category: 'Snacks',
            isAvailable: true
          }
        ]
      },
      {
        name: 'South Indian Delights',
        vendor: insertedVendors[3]._id,
        description: 'Authentic South Indian cuisine',
        cuisine: ['South Indian', 'Vegetarian', 'Breakfast'],
        location: {
          address: 'Rajpur Road, Dehradun',
          city: 'Dehradun'
        },
        rating: 4.3,
        menu: [
          {
            itemName: 'Masala Dosa',
            description: 'Crispy crepe with spiced potato filling',
            price: 90,
            category: 'Main Course',
            isAvailable: true
          },
          {
            itemName: 'Idli Sambar',
            description: 'Steamed rice cakes with lentil curry',
            price: 70,
            category: 'Breakfast',
            isAvailable: true
          },
          {
            itemName: 'Filter Coffee',
            description: 'Traditional South Indian coffee',
            price: 40,
            category: 'Beverages',
            isAvailable: true
          },
          {
            itemName: 'Uttapam',
            description: 'Thick pancake with vegetables',
            price: 85,
            category: 'Main Course',
            isAvailable: true
          }
        ]
      },
      {
        name: 'Punjabi Dhaba',
        vendor: insertedVendors[4]._id,
        description: 'Hearty Punjabi food that reminds you of home',
        cuisine: ['Punjabi', 'North Indian', 'Tandoor'],
        location: {
          address: 'Saharanpur Road, Dehradun',
          city: 'Dehradun'
        },
        rating: 4.4,
        menu: [
          {
            itemName: 'Sarson Ka Saag',
            description: 'Traditional mustard greens with makki roti',
            price: 200,
            category: 'Main Course',
            isAvailable: true
          },
          {
            itemName: 'Tandoori Chicken',
            description: 'Marinated chicken cooked in tandoor',
            price: 350,
            category: 'Tandoor',
            isAvailable: true
          },
          {
            itemName: 'Chole Bhature',
            description: 'Spicy chickpeas with fried bread',
            price: 150,
            category: 'Main Course',
            isAvailable: true
          },
          {
            itemName: 'Lassi',
            description: 'Traditional yogurt drink',
            price: 60,
            category: 'Beverages',
            isAvailable: true
          }
        ]
      },
      {
        name: 'Sweet Treats Bakery',
        vendor: insertedVendors[5]._id,
        description: 'Fresh baked goods and desserts daily',
        cuisine: ['Bakery', 'Desserts', 'Continental'],
        location: {
          address: 'Mall Road, Dehradun',
          city: 'Dehradun'
        },
        rating: 4.1,
        menu: [
          {
            itemName: 'Chocolate Cake',
            description: 'Rich chocolate cake with cream frosting',
            price: 450,
            category: 'Dessert',
            isAvailable: true
          },
          {
            itemName: 'Blueberry Muffin',
            description: 'Fresh baked muffin with blueberries',
            price: 90,
            category: 'Pastry',
            isAvailable: true
          },
          {
            itemName: 'Garlic Bread',
            description: 'Toasted bread with garlic butter',
            price: 120,
            category: 'Bread',
            isAvailable: true
          }
        ]
      },
      {
        name: 'Quick Bites Express',
        vendor: insertedVendors[6]._id,
        description: 'Fast food for busy people',
        cuisine: ['Fast Food', 'American', 'Burgers'],
        location: {
          address: 'IT Park, Dehradun',
          city: 'Dehradun'
        },
        rating: 3.9,
        menu: [
          {
            itemName: 'Chicken Burger',
            description: 'Grilled chicken burger with fries',
            price: 180,
            category: 'Burger',
            isAvailable: true
          },
          {
            itemName: 'French Fries',
            description: 'Crispy golden french fries',
            price: 80,
            category: 'Sides',
            isAvailable: true
          },
          {
            itemName: 'Chicken Wings',
            description: 'Spicy chicken wings with sauce',
            price: 220,
            category: 'Appetizer',
            isAvailable: true
          }
        ]
      }
    ];

    const insertedOutlets = await Outlet.insertMany(outlets);
    console.log(`🏪 Created ${insertedOutlets.length} outlets with comprehensive menus`);

    console.log('✅ Basic data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${insertedCustomers.length + insertedVendors.length} (${insertedCustomers.length} customers, ${insertedVendors.length} vendors)`);
    console.log(`🏪 Outlets: ${insertedOutlets.length}`);
    console.log(`🍽️ Menu Items: ${outlets.reduce((total, outlet) => total + outlet.menu.length, 0)}`);

    return {
      customers: insertedCustomers,
      vendors: insertedVendors,
      outlets: insertedOutlets
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedCompleteDatabase()
    .then(() => {
      console.log('🎉 Database seeding completed!');
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      mongoose.connection.close();
    });
}

// Function to add orders and payments
const addOrdersAndPayments = async (customers, vendors, outlets) => {
  try {
    console.log('\n📦 Adding comprehensive orders and payments...');

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

    // Create comprehensive orders with payments
    const ordersData = [
      {
        customer: customers[0]._id, // Sarah Johnson
        outlet: outlets[0]._id, // Spice Garden
        items: [
          { itemId: outlets[0].menu[0]._id, quantity: 2, price: 280 }, // Butter Chicken x2
          { itemId: outlets[0].menu[4]._id, quantity: 3, price: 60 }   // Naan x3
        ],
        paymentMethod: 'card',
        deliveryAddress: '123 Green Valley, Dehradun',
        orderDate: new Date('2024-01-15T12:30:00'),
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        customer: customers[1]._id, // Rahul Sharma
        outlet: outlets[1]._id, // Cozy Corner Café
        items: [
          { itemId: outlets[1].menu[0]._id, quantity: 2, price: 120 }, // Cappuccino x2
          { itemId: outlets[1].menu[1]._id, quantity: 1, price: 80 }   // Chocolate Croissant
        ],
        paymentMethod: 'upi',
        deliveryAddress: '456 Tech Park, Dehradun',
        orderDate: new Date('2024-01-16T09:15:00'),
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        customer: customers[2]._id, // Priya Patel
        outlet: outlets[2]._id, // Street Food Junction
        items: [
          { itemId: outlets[2].menu[0]._id, quantity: 3, price: 40 }, // Pani Puri x3
          { itemId: outlets[2].menu[1]._id, quantity: 2, price: 50 }, // Bhel Puri x2
          { itemId: outlets[2].menu[4]._id, quantity: 4, price: 25 }  // Samosa x4
        ],
        paymentMethod: 'wallet',
        deliveryAddress: '789 University Area, Dehradun',
        orderDate: new Date('2024-01-17T14:20:00'),
        status: 'completed',
        paymentStatus: 'paid'
      },
      {
        customer: customers[3]._id, // Amit Kumar
        outlet: outlets[3]._id, // South Indian Delights
        items: [
          { itemId: outlets[3].menu[0]._id, quantity: 2, price: 90 }, // Masala Dosa x2
          { itemId: outlets[3].menu[2]._id, quantity: 2, price: 40 }  // Filter Coffee x2
        ],
        paymentMethod: 'cash',
        deliveryAddress: '321 Residential Complex, Dehradun',
        orderDate: new Date('2024-01-18T11:00:00'),
        status: 'completed',
        paymentStatus: 'pending'
      },
      {
        customer: customers[4]._id, // Neha Singh
        outlet: outlets[4]._id, // Punjabi Dhaba
        items: [
          { itemId: outlets[4].menu[1]._id, quantity: 1, price: 350 }, // Tandoori Chicken
          { itemId: outlets[4].menu[2]._id, quantity: 1, price: 150 }, // Chole Bhature
          { itemId: outlets[4].menu[3]._id, quantity: 2, price: 60 }   // Lassi x2
        ],
        paymentMethod: 'card',
        deliveryAddress: '654 Mall Road, Dehradun',
        orderDate: new Date('2024-01-19T13:45:00'),
        status: 'processing',
        paymentStatus: 'paid'
      },
      {
        customer: customers[5]._id, // Arjun Reddy
        outlet: outlets[5]._id, // Sweet Treats Bakery
        items: [
          { itemId: outlets[5].menu[0]._id, quantity: 1, price: 450 }, // Chocolate Cake
          { itemId: outlets[5].menu[1]._id, quantity: 3, price: 90 }   // Blueberry Muffin x3
        ],
        paymentMethod: 'upi',
        deliveryAddress: '987 Sector 5, Dehradun',
        orderDate: new Date('2024-01-20T16:30:00'),
        status: 'confirmed',
        paymentStatus: 'paid'
      },
      {
        customer: customers[6]._id, // Kavya Nair
        outlet: outlets[6]._id, // Quick Bites Express
        items: [
          { itemId: outlets[6].menu[0]._id, quantity: 2, price: 180 }, // Chicken Burger x2
          { itemId: outlets[6].menu[1]._id, quantity: 2, price: 80 },  // French Fries x2
          { itemId: outlets[6].menu[2]._id, quantity: 1, price: 220 }  // Chicken Wings
        ],
        paymentMethod: 'wallet',
        deliveryAddress: '147 Corporate Park, Dehradun',
        orderDate: new Date('2024-01-21T19:15:00'),
        status: 'pending',
        paymentStatus: 'pending'
      },
      {
        customer: customers[7]._id, // Rohan Gupta
        outlet: outlets[0]._id, // Spice Garden (repeat customer)
        items: [
          { itemId: outlets[0].menu[2]._id, quantity: 1, price: 320 }, // Biryani Special
          { itemId: outlets[0].menu[3]._id, quantity: 1, price: 180 }, // Dal Makhani
          { itemId: outlets[0].menu[5]._id, quantity: 2, price: 80 }   // Gulab Jamun x2
        ],
        paymentMethod: 'card',
        deliveryAddress: '258 Heritage Colony, Dehradun',
        orderDate: new Date('2024-01-22T20:00:00'),
        status: 'completed',
        paymentStatus: 'paid'
      }
    ];

    const createdOrders = [];
    const createdPayments = [];

    for (const orderData of ordersData) {
      // Calculate total amount
      const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Calculate estimated time
      const estimatedTime = Math.max(15, orderData.items.length * 8);

      // Create order
      const order = new Order({
        customerId: orderData.customer,
        outletId: orderData.outlet,
        items: orderData.items,
        totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus,
        status: orderData.status,
        estimatedTime,
        remainingTime: orderData.status === 'completed' ? 0 : estimatedTime,
        arrivalTime: orderData.orderDate,
        deliveryAddress: orderData.deliveryAddress,
        priority: 1
      });

      if (orderData.status === 'processing' || orderData.status === 'completed') {
        order.startTime = new Date(orderData.orderDate.getTime() + 5 * 60000); // 5 minutes after order
      }

      if (orderData.status === 'completed') {
        order.completionTime = new Date(orderData.orderDate.getTime() + estimatedTime * 60000);
        order.turnaroundTime = estimatedTime + 5;
      }

      const savedOrder = await order.save();
      createdOrders.push(savedOrder);

      // Create payment record
      if (orderData.paymentMethod !== 'cash' || orderData.paymentStatus === 'paid') {
        const fees = calculateFees(totalAmount, orderData.paymentMethod);

        const payment = new Payment({
          orderId: savedOrder._id,
          customerId: orderData.customer,
          outletId: orderData.outlet,
          amount: totalAmount,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus === 'paid' ? 'completed' : orderData.paymentStatus,
          transactionId: orderData.paymentStatus === 'paid' ? generateTransactionId(orderData.paymentMethod) : null,
          fees: fees,
          paymentDate: orderData.orderDate,
          completedAt: orderData.paymentStatus === 'paid' ? new Date(orderData.orderDate.getTime() + 30000) : null,
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
      }
    }

    console.log(`📦 Created ${createdOrders.length} orders`);
    console.log(`💳 Created ${createdPayments.length} payment records`);

    return { orders: createdOrders, payments: createdPayments };

  } catch (error) {
    console.error('❌ Error adding orders and payments:', error);
    throw error;
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

module.exports = { seedCompleteDatabase, addOrdersAndPayments };
