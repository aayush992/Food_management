const express = require('express');
const { DehradunDeliveryNetwork } = require('../algorithms/dijkstra');
const { OrderScheduler } = require('../algorithms/scheduling');
const PerformanceMetrics = require('../algorithms/performanceMetrics');

const router = express.Router();

// Initialize algorithm instances
const deliveryNetwork = new DehradunDeliveryNetwork();
const performanceMetrics = new PerformanceMetrics();

// Get available delivery locations
router.get('/locations', (req, res) => {
  try {
    const locations = deliveryNetwork.getAvailableLocations();
    res.json({
      success: true,
      locations: [
        { id: 'clock_tower', name: 'Clock Tower', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'it_park', name: 'IT Park', coordinates: { lat: 30.3753, lng: 78.0322 } },
        { id: 'mall_road', name: 'Mall Road', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'rajpur_road', name: 'Rajpur Road', coordinates: { lat: 30.3753, lng: 78.0322 } },
        { id: 'saharanpur_road', name: 'Saharanpur Road', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'paltan_bazaar', name: 'Paltan Bazaar', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'race_course', name: 'Race Course', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'dehradun_station', name: 'Dehradun Railway Station', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'isbt', name: 'ISBT', coordinates: { lat: 30.3165, lng: 78.0322 } },
        { id: 'fri', name: 'Forest Research Institute', coordinates: { lat: 30.3165, lng: 78.0322 } }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate optimal delivery route using Dijkstra's algorithm
router.post('/delivery-route', (req, res) => {
  try {
    const { restaurantLocation, customerLocation, includeTraffic = false } = req.body;

    if (!restaurantLocation || !customerLocation) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant location and customer location are required'
      });
    }

    let result;
    if (includeTraffic) {
      const currentHour = new Date().getHours();
      result = deliveryNetwork.getRouteWithTraffic(restaurantLocation, customerLocation, currentHour);
    } else {
      result = deliveryNetwork.calculateOptimalRoute(restaurantLocation, customerLocation);
    }

    // Track performance
    const performanceData = performanceMetrics.trackDijkstraPerformance(restaurantLocation, customerLocation);

    res.json({
      success: true,
      route: result,
      algorithm: 'Dijkstra',
      performance: {
        executionTime: performanceData.executionTime,
        efficiency: performanceData.efficiency
      },
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get algorithm performance for delivery route
router.get('/delivery-performance/:restaurant/:customer', (req, res) => {
  try {
    const { restaurant, customer } = req.params;
    const performance = deliveryNetwork.getAlgorithmPerformance(restaurant, customer);

    res.json({
      success: true,
      performance,
      algorithm: 'Dijkstra',
      locations: { restaurant, customer }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Schedule orders using various OS algorithms
router.post('/schedule-orders', (req, res) => {
  try {
    const { orders, algorithm = 'all' } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'Orders array is required'
      });
    }

    // Track performance
    const performanceData = performanceMetrics.trackSchedulingPerformance(orders, algorithm);

    res.json({
      success: true,
      scheduling: performanceData.results,
      performance: {
        executionTime: performanceData.executionTime,
        efficiency: performanceData.efficiency,
        orderCount: performanceData.orderCount
      },
      algorithm: algorithm,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compare scheduling algorithms
router.post('/compare-scheduling', (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: 'Orders array is required'
      });
    }

    const scheduler = new OrderScheduler();
    
    // Add orders to scheduler
    orders.forEach(order => {
      scheduler.addOrder(
        order.id,
        order.arrivalTime || 0,
        order.cookingTime || 10,
        order.priority || 0,
        order
      );
    });

    const comparison = scheduler.compareAlgorithms();

    res.json({
      success: true,
      comparison,
      recommendations: {
        bestAlgorithm: comparison.bestAlgorithm,
        reasoning: scheduler.getRecommendation(comparison.bestAlgorithm)
      },
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get performance metrics
router.get('/performance-metrics', (req, res) => {
  try {
    const report = performanceMetrics.getPerformanceReport();

    res.json({
      success: true,
      metrics: report,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get delivery time trends
router.get('/delivery-trends', (req, res) => {
  try {
    const { timeRange = 24 } = req.query;
    const trends = performanceMetrics.getDeliveryTimeTrends(parseInt(timeRange));

    res.json({
      success: true,
      trends,
      timeRange: `${timeRange} hours`,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get food availability trends
router.get('/availability-trends', (req, res) => {
  try {
    const trends = performanceMetrics.getFoodAvailabilityTrends();

    res.json({
      success: true,
      availability: trends,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analyze delivery efficiency
router.get('/delivery-efficiency', (req, res) => {
  try {
    const efficiency = performanceMetrics.analyzeDeliveryEfficiency();

    res.json({
      success: true,
      efficiency,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test algorithm with sample data
router.post('/test-algorithms', (req, res) => {
  try {
    // Sample delivery route test
    const deliveryTest = deliveryNetwork.calculateOptimalRoute('clock_tower', 'it_park');
    
    // Sample scheduling test
    const sampleOrders = [
      { id: 'order1', arrivalTime: 0, cookingTime: 15, priority: 2 },
      { id: 'order2', arrivalTime: 2, cookingTime: 10, priority: 1 },
      { id: 'order3', arrivalTime: 5, cookingTime: 20, priority: 3 },
      { id: 'order4', arrivalTime: 8, cookingTime: 8, priority: 1 },
      { id: 'order5', arrivalTime: 12, cookingTime: 12, priority: 2 }
    ];

    const scheduler = new OrderScheduler();
    sampleOrders.forEach(order => {
      scheduler.addOrder(order.id, order.arrivalTime, order.cookingTime, order.priority);
    });

    const schedulingTest = scheduler.compareAlgorithms();

    res.json({
      success: true,
      tests: {
        delivery: {
          algorithm: 'Dijkstra',
          route: deliveryTest,
          testCase: 'Clock Tower to IT Park'
        },
        scheduling: {
          algorithms: 'All (FCFS, SJF, Priority, Round Robin, SRTF)',
          results: schedulingTest,
          testCase: '5 sample orders'
        }
      },
      message: 'Algorithm tests completed successfully',
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get algorithm documentation
router.get('/documentation', (req, res) => {
  try {
    const documentation = {
      algorithms: {
        dijkstra: {
          name: "Dijkstra's Shortest Path Algorithm",
          purpose: "Calculate optimal delivery routes",
          timeComplexity: "O((V + E) log V)",
          spaceComplexity: "O(V)",
          useCases: ["Delivery route optimization", "Real-time navigation", "Cost minimization"]
        },
        scheduling: {
          fcfs: {
            name: "First Come First Serve",
            purpose: "Process orders in arrival order",
            timeComplexity: "O(n)",
            advantages: ["Simple", "Fair", "No starvation"],
            disadvantages: ["High average waiting time", "Convoy effect"]
          },
          sjf: {
            name: "Shortest Job First",
            purpose: "Process shortest cooking time orders first",
            timeComplexity: "O(n log n)",
            advantages: ["Minimum average waiting time", "Optimal for known burst times"],
            disadvantages: ["Starvation possible", "Requires cooking time prediction"]
          },
          priority: {
            name: "Priority Scheduling",
            purpose: "Process high-priority orders first",
            timeComplexity: "O(n log n)",
            advantages: ["Important orders processed first", "Flexible"],
            disadvantages: ["Starvation possible", "Priority inversion"]
          },
          roundRobin: {
            name: "Round Robin",
            purpose: "Fair time-sharing for order processing",
            timeComplexity: "O(n)",
            advantages: ["Fair", "Good response time", "No starvation"],
            disadvantages: ["Higher turnaround time", "Context switching overhead"]
          },
          srtf: {
            name: "Shortest Remaining Time First",
            purpose: "Preemptive shortest job scheduling",
            timeComplexity: "O(n²)",
            advantages: ["Optimal average waiting time", "Dynamic"],
            disadvantages: ["High overhead", "Starvation possible"]
          }
        }
      },
      endpoints: {
        "/algorithms/delivery-route": "Calculate optimal delivery route",
        "/algorithms/schedule-orders": "Schedule orders using OS algorithms",
        "/algorithms/compare-scheduling": "Compare all scheduling algorithms",
        "/algorithms/performance-metrics": "Get comprehensive performance metrics",
        "/algorithms/test-algorithms": "Test algorithms with sample data"
      }
    };

    res.json({
      success: true,
      documentation,
      timestamp: new Date()
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
