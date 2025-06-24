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
        description: 'Authentic Indian cuisine with a modern twist. Experience the rich flavors of traditional recipes.',
        cuisine: ['Indian', 'North Indian', 'Vegetarian'],
        vendor: insertedVendors[0]._id,
        rating: 4.5,
        location: {
          address: 'Shop 12, Main Market, Dehradun',
          city: 'Dehradun'
        },
        menu: [
          {
            itemName: 'Butter Chicken',
            description: 'Creamy tomato-based curry with tender chicken pieces',
            price: 280,
            category: 'Main Course',
            isAvailable: true,
            image: 'butter-chicken.jpg'
          },
          {
            itemName: 'Paneer Tikka Masala',
            description: 'Grilled cottage cheese in rich tomato gravy',
            price: 250,
            category: 'Main Course',
            isAvailable: true,
            image: 'paneer-tikka.jpg'
          },
          {
            itemName: 'Biryani Special',
            description: 'Aromatic basmati rice with spices and your choice of meat',
            price: 320,
            category: 'Rice',
            isAvailable: true,
            image: 'biryani.jpg'
          },
          {
            itemName: 'Dal Makhani',
            description: 'Creamy black lentils slow-cooked with butter and cream',
            price: 180,
            category: 'Dal',
            isAvailable: true,
            image: 'dal-makhani.jpg'
          },
          {
            itemName: 'Naan Bread',
            description: 'Fresh baked Indian bread',
            price: 60,
            category: 'Bread',
            isAvailable: true,
            image: 'naan.jpg'
          }
        ]
      },
      {
        name: 'Cozy Corner Café',
        description: 'Perfect spot for coffee lovers and casual dining. Fresh pastries and aromatic coffee.',
        cuisine: ['Continental', 'Italian', 'Beverages'],
        vendor: insertedVendors[1]._id,
        rating: 4.2,
        location: {
          address: 'Near Clock Tower, Dehradun',
          city: 'Dehradun'
        },
        menu: [
          {
            itemName: 'Cappuccino',
            description: 'Rich espresso with steamed milk and foam',
            price: 120,
            category: 'Beverages',
            isAvailable: true,
            image: 'cappuccino.jpg'
          },
          {
            itemName: 'Chocolate Croissant',
            description: 'Buttery pastry filled with rich chocolate',
            price: 80,
            category: 'Pastry',
            isAvailable: true,
            image: 'croissant.jpg'
          },
          {
            itemName: 'Caesar Salad',
            description: 'Fresh romaine lettuce with parmesan and croutons',
            price: 180,
            category: 'Salads',
            isAvailable: true,
            image: 'caesar-salad.jpg'
          },
          {
            itemName: 'Margherita Pizza',
            description: 'Classic pizza with tomato, mozzarella, and basil',
            price: 220,
            category: 'Pizza',
            isAvailable: true,
            image: 'margherita.jpg'
          }
        ]
      },
      {
        name: 'Street Food Junction',
        description: 'Authentic street food experience with hygiene and taste. Best chaat in town!',
        cuisine: ['Street Food', 'Chaat', 'Fast Food'],
        vendor: insertedVendors[2]._id,
        rating: 4.0,
        location: {
          address: 'Paltan Bazaar, Dehradun',
          city: 'Dehradun'
        },
        menu: [
          {
            itemName: 'Pani Puri',
            description: 'Crispy puris filled with spicy water and chutneys',
            price: 40,
            category: 'Chaat',
            isAvailable: true,
            image: 'pani-puri.jpg'
          },
          {
            itemName: 'Bhel Puri',
            description: 'Puffed rice mixed with vegetables and tangy sauces',
            price: 50,
            category: 'Chaat',
            isAvailable: true,
            image: 'bhel-puri.jpg'
          },
          {
            itemName: 'Vada Pav',
            description: 'Mumbai style potato fritter in a bun',
            price: 35,
            category: 'Fast Food',
            isAvailable: true,
            image: 'vada-pav.jpg'
          },
          {
            itemName: 'Dosa',
            description: 'Crispy South Indian crepe with potato filling',
            price: 80,
            category: 'South Indian',
            isAvailable: true,
            image: 'dosa.jpg'
          }
        ]
      }
    ];

    const insertedOutlets = await Outlet.insertMany(outlets);
    console.log(`🏪 Created ${insertedOutlets.length} outlets with menus`);

    // Add more outlets
    const moreOutlets = [
      {
        name: 'South Indian Delights',
        description: 'Authentic South Indian cuisine. Famous for dosas, idlis, and filter coffee.',
        address: 'Rajpur Road, Dehradun',
        phone: '9876543213',
        email: 'info@southindian.com',
        cuisine: ['South Indian', 'Vegetarian', 'Breakfast'],
        vendor: insertedVendors[3]._id,
        rating: 4.3,
        priceRange: 'low',
        isActive: true,
        images: ['outlet4.jpg'],
        menu: [
          {
            name: 'Masala Dosa',
            description: 'Crispy crepe with spiced potato filling',
            price: 90,
            category: 'Main Course',
            isVegetarian: true,
            isAvailable: true,
            image: 'masala-dosa.jpg'
          },
          {
            name: 'Idli Sambar',
            description: 'Steamed rice cakes with lentil curry',
            price: 70,
            category: 'Breakfast',
            isVegetarian: true,
            isAvailable: true,
            image: 'idli-sambar.jpg'
          },
          {
            name: 'Filter Coffee',
            description: 'Traditional South Indian coffee',
            price: 40,
            category: 'Beverages',
            isVegetarian: true,
            isAvailable: true,
            image: 'filter-coffee.jpg'
          },
          {
            name: 'Uttapam',
            description: 'Thick pancake with vegetables',
            price: 85,
            category: 'Main Course',
            isVegetarian: true,
            isAvailable: true,
            image: 'uttapam.jpg'
          }
        ]
      },
      {
        name: 'Punjabi Dhaba',
        description: 'Hearty Punjabi food that reminds you of home. Rich gravies and fresh rotis.',
        address: 'Saharanpur Road, Dehradun',
        phone: '9876543214',
        email: 'contact@punjabidhaba.com',
        cuisine: ['Punjabi', 'North Indian', 'Tandoor'],
        vendor: insertedVendors[4]._id,
        rating: 4.4,
        priceRange: 'medium',
        isActive: true,
        images: ['outlet5.jpg'],
        menu: [
          {
            name: 'Sarson Ka Saag',
            description: 'Traditional mustard greens with makki roti',
            price: 200,
            category: 'Main Course',
            isVegetarian: true,
            isAvailable: true,
            image: 'sarson-saag.jpg'
          },
          {
            name: 'Tandoori Chicken',
            description: 'Marinated chicken cooked in tandoor',
            price: 350,
            category: 'Tandoor',
            isVegetarian: false,
            isAvailable: true,
            image: 'tandoori-chicken.jpg'
          },
          {
            name: 'Chole Bhature',
            description: 'Spicy chickpeas with fried bread',
            price: 150,
            category: 'Main Course',
            isVegetarian: true,
            isAvailable: true,
            image: 'chole-bhature.jpg'
          },
          {
            name: 'Lassi',
            description: 'Traditional yogurt drink',
            price: 60,
            category: 'Beverages',
            isVegetarian: true,
            isAvailable: true,
            image: 'lassi.jpg'
          }
        ]
      }
    ];

    const moreInsertedOutlets = await Outlet.insertMany(moreOutlets);
    console.log(`🏪 Created ${moreInsertedOutlets.length} additional outlets`);

    const allOutlets = [...insertedOutlets, ...moreInsertedOutlets];

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${insertedCustomers.length + insertedVendors.length} (${insertedCustomers.length} customers, ${insertedVendors.length} vendors)`);
    console.log(`🏪 Outlets: ${allOutlets.length}`);
    console.log(`🍽️ Menu Items: ${[...outlets, ...moreOutlets].reduce((total, outlet) => total + outlet.menu.length, 0)}`);

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
