const ProcessScheduler = require('./processScheduling');
const MemoryManager = require('./memoryManagement');
const ResourceManager = require('./resourceManager');
const { Semaphore, Mutex, ReadWriteLock, ProducerConsumer } = require('./synchronization');

module.exports = {
    ProcessScheduler,
    MemoryManager,
    ResourceManager,
    Semaphore,
    Mutex,
    ReadWriteLock,
    ProducerConsumer
}; 