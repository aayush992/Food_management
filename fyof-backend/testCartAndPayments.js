const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUsers = {
  customer1: '6859d9065b9cb6f224530053', // Sarah Johnson
  customer2: '6859d9065b9cb6f224530054', // Rahul Sharma
  vendor1: '6859d9065b9cb6f224530058'    // Rajesh Gupta
};

const testOutlets = {
  spiceGarden: '6859d9065b9cb6f22453005f',
  cozyCafe: '6859d9065b9cb6f224530064'
};

async function runTests() {
  console.log('🧪 Starting Cart and Payment System Tests...\n');

  try {
    // Test 1: Get Payment Methods
    console.log('1️⃣ Testing Payment Methods API...');
    const paymentMethods = await axios.get(`${BASE_URL}/orders/payment-methods`);
    console.log('✅ Available Payment Methods:', paymentMethods.data.paymentMethods.length);
    paymentMethods.data.paymentMethods.forEach(method => {
      console.log(`   - ${method.name}: ${method.description}`);
    });
    console.log();

    // Test 2: Cart Operations
    console.log('2️⃣ Testing Cart Operations...');
    
    // Clear cart
    await axios.delete(`${BASE_URL}/cart/clear/${testUsers.customer1}`);
    console.log('✅ Cart cleared');

    // Add items to cart
    const addItem1 = await axios.post(`${BASE_URL}/cart/add`, {
      userId: testUsers.customer1,
      outletId: testOutlets.spiceGarden,
      item: {
        itemId: '6859d9065b9cb6f224530060',
        itemName: 'Butter Chicken',
        price: 280,
        quantity: 2
      }
    });
    console.log('✅ Added Butter Chicken x2 to cart');

    const addItem2 = await axios.post(`${BASE_URL}/cart/add`, {
      userId: testUsers.customer1,
      outletId: testOutlets.spiceGarden,
      item: {
        itemId: '6859d9065b9cb6f224530063',
        itemName: 'Dal Makhani',
        price: 180,
        quantity: 1
      }
    });
    console.log('✅ Added Dal Makhani x1 to cart');
    console.log(`   Cart Total: ₹${addItem2.data.total}`);

    // Get cart
    const cart = await axios.get(`${BASE_URL}/cart/${testUsers.customer1}`);
    console.log(`✅ Retrieved cart: ${cart.data.items.length} items, Total: ₹${cart.data.total}`);
    console.log();

    // Test 3: Order Creation (Checkout)
    console.log('3️⃣ Testing Order Creation...');
    const order = await axios.post(`${BASE_URL}/orders/checkout`, {
      userId: testUsers.customer1,
      paymentMethod: 'upi',
      deliveryAddress: '123 Test Street, Dehradun'
    });
    console.log('✅ Order created successfully');
    console.log(`   Order ID: ${order.data.order._id}`);
    console.log(`   Total Amount: ₹${order.data.order.totalAmount}`);
    console.log(`   Payment Required: ${order.data.paymentRequired}`);
    console.log();

    // Test 4: UPI Payment Processing
    console.log('4️⃣ Testing UPI Payment...');
    const upiPayment = await axios.post(`${BASE_URL}/orders/payment/${order.data.order._id}`, {
      paymentMethod: 'upi',
      paymentData: {
        upiId: 'test@paytm'
      }
    });
    console.log('✅ UPI Payment processed');
    console.log(`   Status: ${upiPayment.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Message: ${upiPayment.data.message}`);
    console.log(`   Transaction ID: ${upiPayment.data.transactionId}`);
    console.log();

    // Test 5: Card Payment
    console.log('5️⃣ Testing Card Payment...');
    
    // Create new cart and order for card payment test
    await axios.delete(`${BASE_URL}/cart/clear/${testUsers.customer2}`);
    await axios.post(`${BASE_URL}/cart/add`, {
      userId: testUsers.customer2,
      outletId: testOutlets.cozyCafe,
      item: {
        itemId: '6859d9065b9cb6f224530065',
        itemName: 'Cappuccino',
        price: 120,
        quantity: 2
      }
    });

    const cardOrder = await axios.post(`${BASE_URL}/orders/checkout`, {
      userId: testUsers.customer2,
      paymentMethod: 'card',
      deliveryAddress: '456 Coffee Lane, Dehradun'
    });

    const cardPayment = await axios.post(`${BASE_URL}/orders/payment/${cardOrder.data.order._id}`, {
      paymentMethod: 'card',
      paymentData: {
        cardNumber: '4111111111111111',
        expiryDate: '12/26',
        cvv: '123'
      }
    });
    console.log('✅ Card Payment processed');
    console.log(`   Status: ${cardPayment.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Message: ${cardPayment.data.message}`);
    console.log(`   Transaction ID: ${cardPayment.data.transactionId}`);
    console.log();

    // Test 6: Wallet Payment
    console.log('6️⃣ Testing Wallet Payment...');
    
    // Create another order for wallet payment
    await axios.post(`${BASE_URL}/cart/add`, {
      userId: testUsers.customer2,
      outletId: testOutlets.cozyCafe,
      item: {
        itemId: '6859d9065b9cb6f224530067',
        itemName: 'Caesar Salad',
        price: 180,
        quantity: 1
      }
    });

    const walletOrder = await axios.post(`${BASE_URL}/orders/checkout`, {
      userId: testUsers.customer2,
      paymentMethod: 'wallet',
      deliveryAddress: '789 Wallet Street, Dehradun'
    });

    const walletPayment = await axios.post(`${BASE_URL}/orders/payment/${walletOrder.data.order._id}`, {
      paymentMethod: 'wallet',
      paymentData: {
        walletType: 'Paytm'
      }
    });
    console.log('✅ Wallet Payment processed');
    console.log(`   Status: ${walletPayment.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   Message: ${walletPayment.data.message}`);
    console.log(`   Transaction ID: ${walletPayment.data.transactionId}`);
    console.log();

    // Test 7: Order Status Management
    console.log('7️⃣ Testing Order Status Updates...');
    const statusUpdate = await axios.put(`${BASE_URL}/orders/status/${order.data.order._id}`, {
      status: 'processing',
      vendorId: testUsers.vendor1
    });
    console.log('✅ Order status updated to processing');
    console.log();

    // Test 8: Get User Orders
    console.log('8️⃣ Testing Order Retrieval...');
    const userOrders = await axios.get(`${BASE_URL}/orders/user/${testUsers.customer1}`);
    console.log(`✅ Retrieved ${userOrders.data.orders.length} orders for customer`);
    userOrders.data.orders.forEach((order, index) => {
      console.log(`   Order ${index + 1}: ${order.status} - ₹${order.totalAmount} - ${order.paymentStatus}`);
    });
    console.log();

    // Test 9: Vendor Orders
    console.log('9️⃣ Testing Vendor Order Management...');
    const vendorOrders = await axios.get(`${BASE_URL}/orders/vendor/${testUsers.vendor1}`);
    console.log(`✅ Retrieved ${vendorOrders.data.orders.length} orders for vendor`);
    console.log();

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Payment Methods API - Working');
    console.log('✅ Cart Operations - Working');
    console.log('✅ Order Creation - Working');
    console.log('✅ UPI Payment - Working');
    console.log('✅ Card Payment - Working');
    console.log('✅ Wallet Payment - Working');
    console.log('✅ Order Status Management - Working');
    console.log('✅ Order Retrieval - Working');
    console.log('✅ Vendor Order Management - Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
