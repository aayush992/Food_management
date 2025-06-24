/**
 * Dijkstra's Shortest Path Algorithm Implementation
 * For calculating optimal delivery routes and time estimation
 */

class PriorityQueue {
  constructor() {
    this.queue = [];
  }

  enqueue(element, priority) {
    this.queue.push({ element, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.queue.shift();
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

class DeliveryGraph {
  constructor() {
    this.vertices = new Map();
    this.edges = new Map();
  }

  addVertex(vertex, coordinates = null) {
    if (!this.vertices.has(vertex)) {
      this.vertices.set(vertex, {
        id: vertex,
        coordinates: coordinates,
        connections: new Map()
      });
      this.edges.set(vertex, new Map());
    }
  }

  addEdge(vertex1, vertex2, weight, trafficFactor = 1) {
    // Add vertices if they don't exist
    this.addVertex(vertex1);
    this.addVertex(vertex2);

    // Calculate actual weight considering traffic
    const actualWeight = weight * trafficFactor;

    // Add bidirectional edges
    this.edges.get(vertex1).set(vertex2, actualWeight);
    this.edges.get(vertex2).set(vertex1, actualWeight);

    // Update vertex connections
    this.vertices.get(vertex1).connections.set(vertex2, actualWeight);
    this.vertices.get(vertex2).connections.set(vertex1, actualWeight);
  }

  // Dijkstra's Algorithm Implementation
  dijkstra(startVertex, endVertex) {
    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const pq = new PriorityQueue();

    // Initialize distances
    for (let vertex of this.vertices.keys()) {
      distances.set(vertex, vertex === startVertex ? 0 : Infinity);
      previous.set(vertex, null);
    }

    pq.enqueue(startVertex, 0);

    while (!pq.isEmpty()) {
      const { element: currentVertex } = pq.dequeue();

      if (visited.has(currentVertex)) continue;
      visited.add(currentVertex);

      // If we reached the destination
      if (currentVertex === endVertex) {
        break;
      }

      // Check all neighbors
      const neighbors = this.edges.get(currentVertex);
      if (neighbors) {
        for (let [neighbor, weight] of neighbors) {
          if (!visited.has(neighbor)) {
            const newDistance = distances.get(currentVertex) + weight;

            if (newDistance < distances.get(neighbor)) {
              distances.set(neighbor, newDistance);
              previous.set(neighbor, currentVertex);
              pq.enqueue(neighbor, newDistance);
            }
          }
        }
      }
    }

    // Reconstruct path
    const path = [];
    let currentVertex = endVertex;

    while (currentVertex !== null) {
      path.unshift(currentVertex);
      currentVertex = previous.get(currentVertex);
    }

    return {
      distance: distances.get(endVertex),
      path: path,
      isReachable: distances.get(endVertex) !== Infinity
    };
  }

  // Calculate delivery time based on distance and traffic
  calculateDeliveryTime(startVertex, endVertex, baseSpeed = 30) { // 30 km/h average speed
    const result = this.dijkstra(startVertex, endVertex);
    
    if (!result.isReachable) {
      return {
        estimatedTime: null,
        distance: null,
        path: [],
        error: 'Route not reachable'
      };
    }

    // Convert distance to time (assuming distance is in km and speed in km/h)
    const timeInHours = result.distance / baseSpeed;
    const timeInMinutes = Math.ceil(timeInHours * 60);

    return {
      estimatedTime: timeInMinutes,
      distance: result.distance,
      path: result.path,
      optimizedRoute: true
    };
  }

  // Get all possible routes with their costs
  getAllRoutes(startVertex, endVertex, maxDepth = 5) {
    const routes = [];
    const visited = new Set();

    const dfs = (current, target, path, cost, depth) => {
      if (depth > maxDepth) return;
      
      if (current === target) {
        routes.push({
          path: [...path],
          cost: cost,
          efficiency: cost / path.length
        });
        return;
      }

      visited.add(current);
      const neighbors = this.edges.get(current);
      
      if (neighbors) {
        for (let [neighbor, weight] of neighbors) {
          if (!visited.has(neighbor)) {
            path.push(neighbor);
            dfs(neighbor, target, path, cost + weight, depth + 1);
            path.pop();
          }
        }
      }
      
      visited.delete(current);
    };

    dfs(startVertex, endVertex, [startVertex], 0, 0);
    return routes.sort((a, b) => a.cost - b.cost);
  }
}

// Dehradun City Delivery Network
class DehradunDeliveryNetwork {
  constructor() {
    this.graph = new DeliveryGraph();
    this.initializeNetwork();
  }

  initializeNetwork() {
    // Add major locations in Dehradun
    const locations = [
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
    ];

    // Add vertices
    locations.forEach(location => {
      this.graph.addVertex(location.id, location.coordinates);
    });

    // Add edges with distances (in km) and traffic factors
    const connections = [
      { from: 'clock_tower', to: 'mall_road', distance: 2.5, traffic: 1.2 },
      { from: 'clock_tower', to: 'paltan_bazaar', distance: 1.8, traffic: 1.5 },
      { from: 'mall_road', to: 'rajpur_road', distance: 3.2, traffic: 1.1 },
      { from: 'rajpur_road', to: 'it_park', distance: 4.5, traffic: 1.0 },
      { from: 'it_park', to: 'saharanpur_road', distance: 6.8, traffic: 1.3 },
      { from: 'saharanpur_road', to: 'dehradun_station', distance: 3.5, traffic: 1.4 },
      { from: 'dehradun_station', to: 'isbt', distance: 2.1, traffic: 1.6 },
      { from: 'isbt', to: 'race_course', distance: 4.2, traffic: 1.1 },
      { from: 'race_course', to: 'fri', distance: 5.5, traffic: 1.0 },
      { from: 'fri', to: 'rajpur_road', distance: 3.8, traffic: 1.2 },
      { from: 'paltan_bazaar', to: 'dehradun_station', distance: 2.8, traffic: 1.3 },
      { from: 'clock_tower', to: 'race_course', distance: 4.1, traffic: 1.2 },
      { from: 'mall_road', to: 'it_park', distance: 5.2, traffic: 1.1 }
    ];

    connections.forEach(conn => {
      this.graph.addEdge(conn.from, conn.to, conn.distance, conn.traffic);
    });
  }

  // Calculate optimal delivery route
  calculateOptimalRoute(restaurantLocation, customerLocation) {
    return this.graph.calculateDeliveryTime(restaurantLocation, customerLocation);
  }

  // Get route with real-time traffic consideration
  getRouteWithTraffic(restaurantLocation, customerLocation, currentHour) {
    // Adjust traffic based on time of day
    const trafficMultiplier = this.getTrafficMultiplier(currentHour);
    
    // Create temporary graph with updated traffic
    const tempGraph = new DeliveryGraph();
    
    // Copy vertices
    for (let [vertexId, vertex] of this.graph.vertices) {
      tempGraph.addVertex(vertexId, vertex.coordinates);
    }
    
    // Copy edges with traffic adjustment
    for (let [fromVertex, edges] of this.graph.edges) {
      for (let [toVertex, weight] of edges) {
        tempGraph.addEdge(fromVertex, toVertex, weight * trafficMultiplier, 1);
      }
    }
    
    return tempGraph.calculateDeliveryTime(restaurantLocation, customerLocation);
  }

  // Traffic multiplier based on time of day
  getTrafficMultiplier(hour) {
    // Peak hours: 8-10 AM, 12-2 PM, 6-9 PM
    if ((hour >= 8 && hour <= 10) || (hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21)) {
      return 1.5; // 50% more time during peak hours
    } else if (hour >= 22 || hour <= 6) {
      return 0.8; // 20% less time during night hours
    }
    return 1.0; // Normal traffic
  }

  // Get all available locations
  getAvailableLocations() {
    const locations = [];
    for (let [vertexId, vertex] of this.graph.vertices) {
      locations.push({
        id: vertexId,
        coordinates: vertex.coordinates
      });
    }
    return locations;
  }

  // Performance metrics for the algorithm
  getAlgorithmPerformance(startLocation, endLocation) {
    const startTime = performance.now();
    const result = this.graph.dijkstra(startLocation, endLocation);
    const endTime = performance.now();
    
    return {
      executionTime: endTime - startTime,
      pathLength: result.path.length,
      totalDistance: result.distance,
      algorithmsUsed: ['Dijkstra'],
      efficiency: result.distance / result.path.length
    };
  }
}

module.exports = {
  DeliveryGraph,
  DehradunDeliveryNetwork,
  PriorityQueue
};
