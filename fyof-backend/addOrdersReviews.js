const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Outlet = require('./models/Outlet');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fyof');

const addOrdersAndReviews = async () => {
  try {
    console.log('📦 Adding orders and reviews...');

    // Get existing users and outlets
    const customers = await User.find({ role: 'user' });
    const outlets = await Outlet.find({});

    if (customers.length === 0 || outlets.length === 0) {
      console.log('❌ No customers or outlets found. Please run seedDatabase.js first.');
      return;
    }

    // Sample orders data
    const orders = [
      {
        customer: customers[0]._id,
        outlet: outlets[0]._id,
        items: [
          {
            name: 'Butter Chicken',
            price: 280,
            quantity: 1
          },
          {
            name: 'Naan Bread',
            price: 60,
            quantity: 2
          }
        ],
        totalAmount: 400,
        status: 'delivered',
        orderDate: new Date('2024-01-15'),
        deliveryAddress: '123 Main Street, Dehradun'
      },
      {
        customer: customers[1]._id,
        outlet: outlets[1]._id,
        items: [
          {
            name: 'Cappuccino',
            price: 120,
            quantity: 2
          },
          {
            name: 'Chocolate Croissant',
            price: 80,
            quantity: 1
          }
        ],
        totalAmount: 320,
        status: 'delivered',
        orderDate: new Date('2024-01-16'),
        deliveryAddress: '456 Park Avenue, Dehradun'
      },
      {
        customer: customers[2]._id,
        outlet: outlets[2]._id,
        items: [
          {
            name: 'Pani Puri',
            price: 40,
            quantity: 2
          },
          {
            name: 'Bhel Puri',
            price: 50,
            quantity: 1
          },
          {
            name: 'Dosa',
            price: 80,
            quantity: 1
          }
        ],
        totalAmount: 210,
        status: 'delivered',
        orderDate: new Date('2024-01-17'),
        deliveryAddress: '789 College Road, Dehradun'
      },
      {
        customer: customers[3]._id,
        outlet: outlets[0]._id,
        items: [
          {
            name: 'Biryani Special',
            price: 320,
            quantity: 1
          },
          {
            name: 'Dal Makhani',
            price: 180,
            quantity: 1
          }
        ],
        totalAmount: 500,
        status: 'preparing',
        orderDate: new Date(),
        deliveryAddress: '321 University Area, Dehradun'
      },
      {
        customer: customers[4]._id,
        outlet: outlets[1]._id,
        items: [
          {
            name: 'Margherita Pizza',
            price: 220,
            quantity: 1
          },
          {
            name: 'Caesar Salad',
            price: 180,
            quantity: 1
          }
        ],
        totalAmount: 400,
        status: 'confirmed',
        orderDate: new Date(),
        deliveryAddress: '654 Residential Complex, Dehradun'
      }
    ];

    // Sample reviews data
    const reviews = [
      {
        customer: customers[0]._id,
        outlet: outlets[0]._id,
        rating: 5,
        comment: 'Amazing food! The butter chicken was absolutely delicious and the service was excellent. Will definitely order again!',
        reviewDate: new Date('2024-01-16')
      },
      {
        customer: customers[1]._id,
        outlet: outlets[1]._id,
        rating: 4,
        comment: 'Great coffee and cozy atmosphere. The croissants were fresh and tasty. Perfect place for a morning coffee.',
        reviewDate: new Date('2024-01-17')
      },
      {
        customer: customers[2]._id,
        outlet: outlets[2]._id,
        rating: 4,
        comment: 'Authentic street food taste! The pani puri was just like I remember from Mumbai. Good hygiene standards too.',
        reviewDate: new Date('2024-01-18')
      },
      {
        customer: customers[3]._id,
        outlet: outlets[0]._id,
        rating: 5,
        comment: 'Best biryani in Dehradun! The rice was perfectly cooked and the spices were well balanced. Highly recommended!',
        reviewDate: new Date('2024-01-19')
      },
      {
        customer: customers[4]._id,
        outlet: outlets[1]._id,
        rating: 4,
        comment: 'Nice pizza and good ambiance. The staff was friendly and the food arrived quickly. Will visit again with friends.',
        reviewDate: new Date('2024-01-20')
      },
      {
        customer: customers[0]._id,
        outlet: outlets[2]._id,
        rating: 4,
        comment: 'Love the variety of street food options. Everything was fresh and flavorful. Great value for money!',
        reviewDate: new Date('2024-01-21')
      }
    ];

    // Add orders and reviews to outlets
    for (let i = 0; i < outlets.length; i++) {
      const outletOrders = orders.filter(order => order.outlet.toString() === outlets[i]._id.toString());
      const outletReviews = reviews.filter(review => review.outlet.toString() === outlets[i]._id.toString());
      
      await Outlet.findByIdAndUpdate(outlets[i]._id, {
        $push: {
          orders: { $each: outletOrders },
          reviews: { $each: outletReviews }
        }
      });
    }

    console.log(`📦 Added ${orders.length} orders`);
    console.log(`⭐ Added ${reviews.length} reviews`);

    // Update outlet ratings based on reviews
    for (let outlet of outlets) {
      const outletReviews = reviews.filter(review => review.outlet.toString() === outlet._id.toString());
      if (outletReviews.length > 0) {
        const avgRating = outletReviews.reduce((sum, review) => sum + review.rating, 0) / outletReviews.length;
        await Outlet.findByIdAndUpdate(outlet._id, { rating: Math.round(avgRating * 10) / 10 });
      }
    }

    console.log('📊 Updated outlet ratings based on reviews');

    console.log('\n✅ Orders and reviews added successfully!');
    console.log('\n📊 Additional Data Summary:');
    console.log(`📦 Orders: ${orders.length}`);
    console.log(`⭐ Reviews: ${reviews.length}`);
    console.log(`🏪 Outlets updated: ${outlets.length}`);

  } catch (error) {
    console.error('❌ Error adding orders and reviews:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
addOrdersAndReviews();
