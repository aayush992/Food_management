/**
 * Performance Metrics Module
 * Tracks and analyzes OS algorithm performance and system efficiency
 */

const { DehradunDeliveryNetwork } = require('./dijkstra');
const { OrderScheduler } = require('./scheduling');

class PerformanceMetrics {
  constructor() {
    this.deliveryNetwork = new DehradunDeliveryNetwork();
    this.orderScheduler = new OrderScheduler();
    this.metrics = {
      dijkstra: [],
      scheduling: [],
      system: []
    };
  }

  // Track Dijkstra algorithm performance
  trackDijkstraPerformance(startLocation, endLocation) {
    const startTime = performance.now();
    const result = this.deliveryNetwork.calculateOptimalRoute(startLocation, endLocation);
    const endTime = performance.now();

    const performanceData = {
      timestamp: new Date(),
      algorithm: 'Dijkstra',
      executionTime: endTime - startTime,
      startLocation,
      endLocation,
      distance: result.distance,
      estimatedTime: result.estimatedTime,
      pathLength: result.path ? result.path.length : 0,
      success: result.estimatedTime !== null,
      efficiency: result.distance / (result.path ? result.path.length : 1)
    };

    this.metrics.dijkstra.push(performanceData);
    return performanceData;
  }

  // Track scheduling algorithm performance
  trackSchedulingPerformance(orders, algorithm = 'all') {
    const startTime = performance.now();
    
    // Clear previous orders
    this.orderScheduler.reset();
    
    // Add orders to scheduler
    orders.forEach(order => {
      this.orderScheduler.addOrder(
        order.id,
        order.arrivalTime,
        order.cookingTime,
        order.priority,
        order.data
      );
    });

    let results;
    if (algorithm === 'all') {
      results = this.orderScheduler.compareAlgorithms();
    } else {
      switch (algorithm) {
        case 'fcfs':
          results = this.orderScheduler.fcfsScheduling();
          break;
        case 'sjf':
          results = this.orderScheduler.sjfScheduling();
          break;
        case 'priority':
          results = this.orderScheduler.priorityScheduling();
          break;
        case 'roundrobin':
          results = this.orderScheduler.roundRobinScheduling();
          break;
        case 'srtf':
          results = this.orderScheduler.srtfScheduling();
          break;
        default:
          results = this.orderScheduler.compareAlgorithms();
      }
    }

    const endTime = performance.now();

    const performanceData = {
      timestamp: new Date(),
      algorithm: algorithm,
      executionTime: endTime - startTime,
      orderCount: orders.length,
      results: results,
      efficiency: this.calculateSchedulingEfficiency(results)
    };

    this.metrics.scheduling.push(performanceData);
    return performanceData;
  }

  // Calculate scheduling efficiency
  calculateSchedulingEfficiency(results) {
    if (results.comparison) {
      // For comparison results
      const algorithms = Object.keys(results.comparison);
      let totalEfficiency = 0;
      
      algorithms.forEach(alg => {
        const metrics = results.comparison[alg];
        const efficiency = 1 / (metrics.avgWaitingTime + metrics.avgTurnaroundTime);
        totalEfficiency += efficiency;
      });
      
      return totalEfficiency / algorithms.length;
    } else {
      // For single algorithm results
      return 1 / (results.averageWaitingTime + results.averageTurnaroundTime);
    }
  }

  // Track system performance
  trackSystemPerformance(operationType, data) {
    const performanceData = {
      timestamp: new Date(),
      operationType,
      data,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    this.metrics.system.push(performanceData);
    return performanceData;
  }

  // Get delivery time trends
  getDeliveryTimeTrends(timeRange = 24) { // hours
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    const recentMetrics = this.metrics.dijkstra.filter(m => m.timestamp > cutoffTime);

    if (recentMetrics.length === 0) {
      return { trend: 'no_data', averageTime: 0, efficiency: 0 };
    }

    const averageTime = recentMetrics.reduce((sum, m) => sum + m.estimatedTime, 0) / recentMetrics.length;
    const averageEfficiency = recentMetrics.reduce((sum, m) => sum + m.efficiency, 0) / recentMetrics.length;

    return {
      trend: 'stable',
      averageTime: Math.round(averageTime),
      efficiency: averageEfficiency,
      totalCalculations: recentMetrics.length,
      successRate: recentMetrics.filter(m => m.success).length / recentMetrics.length
    };
  }

  // Get food availability trends
  getFoodAvailabilityTrends() {
    // Simulate food availability data based on order patterns
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const availability = hours.map(hour => {
      let baseAvailability = 80; // Base 80% availability
      
      // Peak hours have lower availability
      if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
        baseAvailability -= 20;
      }
      
      // Late night has higher availability
      if (hour >= 22 || hour <= 6) {
        baseAvailability += 10;
      }
      
      return {
        hour,
        availability: Math.min(100, Math.max(0, baseAvailability + Math.random() * 20 - 10))
      };
    });

    return {
      hourlyAvailability: availability,
      peakHours: availability.filter(h => h.availability < 70).map(h => h.hour),
      optimalHours: availability.filter(h => h.availability > 90).map(h => h.hour),
      averageAvailability: availability.reduce((sum, h) => sum + h.availability, 0) / 24
    };
  }

  // Analyze delivery efficiency
  analyzeDeliveryEfficiency() {
    const recentMetrics = this.metrics.dijkstra.slice(-100); // Last 100 calculations
    
    if (recentMetrics.length === 0) {
      return { status: 'no_data' };
    }

    const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / recentMetrics.length;
    const avgDistance = recentMetrics.reduce((sum, m) => sum + m.distance, 0) / recentMetrics.length;
    const avgEstimatedTime = recentMetrics.reduce((sum, m) => sum + m.estimatedTime, 0) / recentMetrics.length;
    const successRate = recentMetrics.filter(m => m.success).length / recentMetrics.length;

    return {
      algorithmPerformance: {
        averageExecutionTime: avgExecutionTime,
        averageDistance: avgDistance,
        averageEstimatedTime: avgEstimatedTime,
        successRate: successRate
      },
      efficiency: {
        timePerKm: avgEstimatedTime / avgDistance,
        algorithmSpeed: avgExecutionTime,
        reliability: successRate
      },
      recommendations: this.generateDeliveryRecommendations(avgExecutionTime, successRate)
    };
  }

  // Generate delivery recommendations
  generateDeliveryRecommendations(executionTime, successRate) {
    const recommendations = [];

    if (executionTime > 10) {
      recommendations.push('Consider optimizing graph structure for faster route calculation');
    }

    if (successRate < 0.95) {
      recommendations.push('Add more delivery routes to improve connectivity');
    }

    if (recommendations.length === 0) {
      recommendations.push('Delivery routing is performing optimally');
    }

    return recommendations;
  }

  // Get comprehensive performance report
  getPerformanceReport() {
    const deliveryTrends = this.getDeliveryTimeTrends();
    const availabilityTrends = this.getFoodAvailabilityTrends();
    const deliveryEfficiency = this.analyzeDeliveryEfficiency();

    return {
      timestamp: new Date(),
      summary: {
        totalDijkstraCalculations: this.metrics.dijkstra.length,
        totalSchedulingOperations: this.metrics.scheduling.length,
        totalSystemOperations: this.metrics.system.length
      },
      deliveryPerformance: {
        trends: deliveryTrends,
        efficiency: deliveryEfficiency
      },
      foodAvailability: availabilityTrends,
      algorithmComparison: this.getAlgorithmComparison(),
      systemHealth: this.getSystemHealth(),
      recommendations: this.generateSystemRecommendations()
    };
  }

  // Compare algorithm performance
  getAlgorithmComparison() {
    const dijkstraMetrics = this.metrics.dijkstra.slice(-50);
    const schedulingMetrics = this.metrics.scheduling.slice(-10);

    return {
      dijkstra: {
        averageExecutionTime: dijkstraMetrics.length > 0 ? 
          dijkstraMetrics.reduce((sum, m) => sum + m.executionTime, 0) / dijkstraMetrics.length : 0,
        successRate: dijkstraMetrics.length > 0 ?
          dijkstraMetrics.filter(m => m.success).length / dijkstraMetrics.length : 0,
        efficiency: dijkstraMetrics.length > 0 ?
          dijkstraMetrics.reduce((sum, m) => sum + m.efficiency, 0) / dijkstraMetrics.length : 0
      },
      scheduling: {
        averageExecutionTime: schedulingMetrics.length > 0 ?
          schedulingMetrics.reduce((sum, m) => sum + m.executionTime, 0) / schedulingMetrics.length : 0,
        averageEfficiency: schedulingMetrics.length > 0 ?
          schedulingMetrics.reduce((sum, m) => sum + m.efficiency, 0) / schedulingMetrics.length : 0
      }
    };
  }

  // Get system health metrics
  getSystemHealth() {
    const recentSystemMetrics = this.metrics.system.slice(-10);
    
    if (recentSystemMetrics.length === 0) {
      return { status: 'unknown' };
    }

    const latestMetric = recentSystemMetrics[recentSystemMetrics.length - 1];
    const memoryUsage = latestMetric.memoryUsage;

    return {
      status: 'healthy',
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        usage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100) // %
      },
      uptime: process.uptime(),
      nodeVersion: process.version
    };
  }

  // Generate system recommendations
  generateSystemRecommendations() {
    const recommendations = [];
    const systemHealth = this.getSystemHealth();
    const algorithmComparison = this.getAlgorithmComparison();

    if (systemHealth.memory && systemHealth.memory.usage > 80) {
      recommendations.push('High memory usage detected. Consider optimizing data structures.');
    }

    if (algorithmComparison.dijkstra.averageExecutionTime > 5) {
      recommendations.push('Dijkstra algorithm execution time is high. Consider graph optimization.');
    }

    if (algorithmComparison.dijkstra.successRate < 0.9) {
      recommendations.push('Low success rate for route calculations. Add more delivery routes.');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing optimally. Continue monitoring.');
    }

    return recommendations;
  }

  // Clear old metrics (keep last 1000 entries)
  cleanupMetrics() {
    const maxEntries = 1000;
    
    if (this.metrics.dijkstra.length > maxEntries) {
      this.metrics.dijkstra = this.metrics.dijkstra.slice(-maxEntries);
    }
    
    if (this.metrics.scheduling.length > maxEntries) {
      this.metrics.scheduling = this.metrics.scheduling.slice(-maxEntries);
    }
    
    if (this.metrics.system.length > maxEntries) {
      this.metrics.system = this.metrics.system.slice(-maxEntries);
    }
  }
}

module.exports = PerformanceMetrics;
