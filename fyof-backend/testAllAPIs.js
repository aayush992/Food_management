const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAllAPIs() {
  console.log('🧪 Testing All FYOF APIs...\n');

  try {
    // Test 1: Basic API Health
    console.log('1️⃣ Testing Basic API Health...');
    const outlets = await axios.get(`${BASE_URL}/outlets`);
    console.log(`✅ Outlets API: ${outlets.data.length} outlets found`);

    // Test 2: Algorithm Locations
    console.log('\n2️⃣ Testing Algorithm Locations...');
    const locations = await axios.get(`${BASE_URL}/algorithms/locations`);
    console.log(`✅ Locations API: ${locations.data.locations.length} locations found`);

    // Test 3: Dijkstra Algorithm
    console.log('\n3️⃣ Testing Dijkstra Algorithm...');
    const dijkstra = await axios.post(`${BASE_URL}/algorithms/delivery-route`, {
      restaurantLocation: 'clock_tower',
      customerLocation: 'it_park',
      includeTraffic: true
    });
    console.log(`✅ Dijkstra API: Route calculated successfully`);
    console.log(`   Distance: ${dijkstra.data.route.distance} km`);
    console.log(`   Time: ${dijkstra.data.route.estimatedTime} minutes`);
    console.log(`   Execution: ${dijkstra.data.performance.executionTime.toFixed(3)} ms`);

    // Test 4: Scheduling Algorithms
    console.log('\n4️⃣ Testing Scheduling Algorithms...');
    const scheduling = await axios.post(`${BASE_URL}/algorithms/compare-scheduling`, {
      orders: [
        { id: 'order1', arrivalTime: 0, cookingTime: 15, priority: 2 },
        { id: 'order2', arrivalTime: 2, cookingTime: 10, priority: 1 },
        { id: 'order3', arrivalTime: 5, cookingTime: 20, priority: 3 }
      ]
    });
    console.log(`✅ Scheduling API: Algorithms compared successfully`);
    console.log(`   Best Algorithm: ${scheduling.data.comparison.bestAlgorithm.algorithm}`);
    console.log(`   Score: ${scheduling.data.comparison.bestAlgorithm.score.toFixed(2)}`);

    // Test 5: Performance Metrics
    console.log('\n5️⃣ Testing Performance Metrics...');
    const performance = await axios.get(`${BASE_URL}/algorithms/performance-metrics`);
    console.log(`✅ Performance API: Metrics retrieved successfully`);

    // Test 6: Availability Trends
    console.log('\n6️⃣ Testing Availability Trends...');
    const availability = await axios.get(`${BASE_URL}/algorithms/availability-trends`);
    console.log(`✅ Availability API: Trends calculated successfully`);
    console.log(`   Average Availability: ${availability.data.availability.averageAvailability.toFixed(1)}%`);

    // Test 7: Complete Algorithm Test
    console.log('\n7️⃣ Testing Complete Algorithm Suite...');
    const complete = await axios.post(`${BASE_URL}/algorithms/test-algorithms`);
    console.log(`✅ Complete Test API: All algorithms tested successfully`);

    // Test 8: Payment APIs
    console.log('\n8️⃣ Testing Payment APIs...');
    const payments = await axios.get(`${BASE_URL}/payments`);
    console.log(`✅ Payments API: ${payments.data.pagination.totalPayments} payments found`);

    // Test 9: Orders APIs
    console.log('\n9️⃣ Testing Orders APIs...');
    const orders = await axios.get(`${BASE_URL}/orders/user/6859e05249ff98fbdc8fd032`);
    console.log(`✅ Orders API: ${orders.data.orders.length} orders found`);

    console.log('\n🎉 ALL API TESTS PASSED SUCCESSFULLY!');
    console.log('\n📊 SUMMARY:');
    console.log('✅ Basic APIs: Working');
    console.log('✅ Dijkstra Algorithm: Working');
    console.log('✅ Scheduling Algorithms: Working');
    console.log('✅ Performance Metrics: Working');
    console.log('✅ Availability Trends: Working');
    console.log('✅ Payment System: Working');
    console.log('✅ Order System: Working');

    console.log('\n🚀 YOUR FYOF PLATFORM WITH OS ALGORITHMS IS FULLY FUNCTIONAL!');

  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the tests
testAllAPIs();
