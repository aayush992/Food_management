const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Outlet.deleteMany({});
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
      }
    ];

    // Insert users
    const insertedCustomers = await User.insertMany(customers);
    const insertedVendors = await User.insertMany(vendors);
    console.log(`👥 Created ${insertedCustomers.length} customers and ${insertedVendors.length} vendors`);

    // Create Outlets
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
          }
        ]
      }
    ];

    const insertedOutlets = await Outlet.insertMany(outlets);
    console.log(`🏪 Created ${insertedOutlets.length} outlets with menus`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${insertedCustomers.length + insertedVendors.length} (${insertedCustomers.length} customers, ${insertedVendors.length} vendors)`);
    console.log(`🏪 Outlets: ${insertedOutlets.length}`);
    console.log(`🍽️ Menu Items: ${outlets.reduce((total, outlet) => total + outlet.menu.length, 0)}`);

    console.log('\n🔑 Test Login Credentials:');
    console.log('Customers:');
    customers.forEach(customer => {
      console.log(`  📧 ${customer.email} | 🔒 password123`);
    });
    console.log('Vendors:');
    vendors.forEach(vendor => {
      console.log(`  📧 ${vendor.email} | 🔒 password123`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the seeding
seedDatabase();
