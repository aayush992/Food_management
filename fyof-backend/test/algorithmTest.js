const {
    ProcessScheduler,
    MemoryManager,
    ResourceManager,
    ProducerConsumer
} = require('../algorithms');

// Dummy order data
const dummyOrders = [
    { id: 1, customerId: 'C1', items: ['Burger', 'Fries'], estimatedTime: 10, priority: 2, arrivalTime: 0 },
    { id: 2, customerId: 'C2', items: ['Pizza'], estimatedTime: 15, priority: 1, arrivalTime: 2 },
    { id: 3, customerId: 'C3', items: ['Salad'], estimatedTime: 5, priority: 3, arrivalTime: 4 },
    { id: 4, customerId: 'C4', items: ['Pasta', 'Soup'], estimatedTime: 12, priority: 2, arrivalTime: 5 },
    { id: 5, customerId: 'C5', items: ['Sandwich'], estimatedTime: 7, priority: 1, arrivalTime: 6 }
];

// Test Process Scheduling
async function testProcessScheduling() {
    console.log('\n=== Testing Process Scheduling Algorithms ===');
    const scheduler = new ProcessScheduler();

    // Test FCFS
    console.log('\nFirst Come First Serve (FCFS):');
    const fcfsResult = scheduler.fcfs([...dummyOrders]);
    console.log('Order Processing Sequence:', fcfsResult.map(p => p.id));

    // Test SJF
    console.log('\nShortest Job First (SJF):');
    const sjfResult = scheduler.sjf([...dummyOrders]);
    console.log('Order Processing Sequence:', sjfResult.map(p => p.id));

    // Test Priority Scheduling
    console.log('\nPriority Scheduling:');
    const priorityResult = scheduler.priorityScheduling([...dummyOrders]);
    console.log('Order Processing Sequence:', priorityResult.map(p => p.id));

    // Test Round Robin
    console.log('\nRound Robin (Time Quantum = 4):');
    const processesForRR = dummyOrders.map(order => ({
        ...order,
        remainingTime: order.estimatedTime
    }));
    
    scheduler.on('process_quantum_complete', (data) => {
        console.log(`Order ${data.processId} - Remaining Time: ${data.remainingTime}`);
    });
    
    scheduler.on('process_complete', (data) => {
        console.log(`Order ${data.processId} completed at time ${data.completionTime}`);
    });

    const rrResult = await scheduler.roundRobin(processesForRR);
    const metrics = scheduler.calculateMetrics(rrResult);
    console.log('\nPerformance Metrics:');
    console.log('Average Waiting Time:', metrics.averageWaitingTime.toFixed(2));
    console.log('Average Turnaround Time:', metrics.averageTurnaroundTime.toFixed(2));
}

// Test Memory Management
function testMemoryManagement() {
    console.log('\n=== Testing Memory Management ===');
    const memoryManager = new MemoryManager(1024); // 1KB total memory

    // Test First Fit
    console.log('\nFirst Fit Algorithm:');
    const block1 = memoryManager.firstFit(200);
    const block2 = memoryManager.firstFit(300);
    const block3 = memoryManager.firstFit(150);
    
    console.log('Allocated Blocks:', memoryManager.allocatedBlocks);
    console.log('Memory Stats:', memoryManager.getStats());

    // Test Page Replacement
    console.log('\nLRU Cache for Menu Items:');
    const menuItems = [
        { id: 'M1', name: 'Burger', price: 10 },
        { id: 'M2', name: 'Pizza', price: 15 },
        { id: 'M3', name: 'Salad', price: 8 },
        { id: 'M4', name: 'Pasta', price: 12 }
    ];

    menuItems.forEach(item => {
        memoryManager.lruPageReplacement(item.id, item);
        console.log(`Cached item: ${item.name}`);
    });

    // Access some items
    console.log('\nAccessing cached items:');
    console.log('Accessing M1:', memoryManager.accessPage('M1'));
    console.log('Accessing M3:', memoryManager.accessPage('M3'));
    console.log('Cache Stats:', memoryManager.getStats());
}

// Test Resource Management
function testResourceManagement() {
    console.log('\n=== Testing Resource Management ===');
    
    // Initialize with available resources (chefs, cooking stations, delivery personnel)
    const resourceManager = new ResourceManager([3, 2, 4]);
    
    console.log('\nInitial Resources:', resourceManager.available);

    // Add processes (orders) with maximum resource demands
    resourceManager.addProcess('Order1', [2, 1, 1]); // Needs 2 chefs, 1 station, 1 delivery
    resourceManager.addProcess('Order2', [1, 1, 2]); // Needs 1 chef, 1 station, 2 delivery
    resourceManager.addProcess('Order3', [1, 1, 1]); // Needs 1 chef, 1 station, 1 delivery

    console.log('\nCurrent State:', resourceManager.getState());

    // Test resource requests
    console.log('\nTesting Resource Requests:');
    try {
        const request1Success = resourceManager.requestResources(0, [2, 1, 1]);
        console.log('Order1 resource request:', request1Success ? 'Granted' : 'Denied');
        
        const request2Success = resourceManager.requestResources(1, [1, 1, 1]);
        console.log('Order2 resource request:', request2Success ? 'Granted' : 'Denied');
        
        console.log('\nResource Utilization:', resourceManager.getResourceUtilization());
    } catch (error) {
        console.error('Resource allocation error:', error.message);
    }
}

// Test Producer-Consumer
async function testProducerConsumer() {
    console.log('\n=== Testing Producer-Consumer Pattern ===');
    const orderQueue = new ProducerConsumer(5); // Buffer size of 5 orders

    // Listen for events
    orderQueue.on('produced', (order) => {
        console.log('New order received:', order.id);
    });

    orderQueue.on('consumed', (order) => {
        console.log('Order processed:', order.id);
    });

    // Simulate order production and consumption
    console.log('\nSimulating Order Processing:');
    
    // Produce orders
    for (const order of dummyOrders) {
        await orderQueue.produce(order);
        console.log('Buffer size after production:', orderQueue.getBufferSize());
    }

    // Consume orders
    for (let i = 0; i < dummyOrders.length; i++) {
        const order = await orderQueue.consume();
        console.log('Remaining orders in buffer:', orderQueue.getBufferSize());
    }
}

// Run all tests
async function runTests() {
    try {
        await testProcessScheduling();
        testMemoryManagement();
        testResourceManagement();
        await testProducerConsumer();
    } catch (error) {
        console.error('Test execution failed:', error);
    }
}

runTests(); 