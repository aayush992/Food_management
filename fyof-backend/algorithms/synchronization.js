const EventEmitter = require('events');

class Semaphore {
    constructor(count) {
        this.count = count;
        this.waitingQueue = [];
    }

    async acquire() {
        if (this.count > 0) {
            this.count--;
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.waitingQueue.push(resolve);
        });
    }

    release() {
        this.count++;
        if (this.waitingQueue.length > 0) {
            const resolve = this.waitingQueue.shift();
            resolve();
        }
    }

    getCount() {
        return this.count;
    }

    getWaitingCount() {
        return this.waitingQueue.length;
    }
}

class Mutex {
    constructor() {
        this.locked = false;
        this.waitingQueue = [];
    }

    async lock() {
        if (!this.locked) {
            this.locked = true;
            return Promise.resolve();
        }

        return new Promise(resolve => {
            this.waitingQueue.push(resolve);
        });
    }

    unlock() {
        if (this.waitingQueue.length > 0) {
            const resolve = this.waitingQueue.shift();
            resolve();
        } else {
            this.locked = false;
        }
    }

    isLocked() {
        return this.locked;
    }

    getWaitingCount() {
        return this.waitingQueue.length;
    }
}

class ReadWriteLock {
    constructor() {
        this.readCount = 0;
        this.writeCount = 0;
        this.readMutex = new Mutex();
        this.writeMutex = new Mutex();
        this.readTryMutex = new Mutex();
        this.resourceMutex = new Mutex();
    }

    async acquireReadLock() {
        await this.readTryMutex.lock();
        await this.readMutex.lock();
        
        if (this.readCount === 0) {
            await this.resourceMutex.lock();
        }
        this.readCount++;
        
        this.readMutex.unlock();
        this.readTryMutex.unlock();
    }

    async releaseReadLock() {
        await this.readMutex.lock();
        
        this.readCount--;
        if (this.readCount === 0) {
            this.resourceMutex.unlock();
        }
        
        this.readMutex.unlock();
    }

    async acquireWriteLock() {
        await this.writeMutex.lock();
        
        if (this.writeCount === 0) {
            await this.readTryMutex.lock();
        }
        this.writeCount++;
        
        await this.resourceMutex.lock();
        this.writeMutex.unlock();
    }

    async releaseWriteLock() {
        this.resourceMutex.unlock();
        
        await this.writeMutex.lock();
        this.writeCount--;
        
        if (this.writeCount === 0) {
            this.readTryMutex.unlock();
        }
        
        this.writeMutex.unlock();
    }

    getReadCount() {
        return this.readCount;
    }

    getWriteCount() {
        return this.writeCount;
    }
}

class ProducerConsumer extends EventEmitter {
    constructor(bufferSize) {
        super();
        this.bufferSize = bufferSize;
        this.buffer = [];
        this.mutex = new Mutex();
        this.notFull = new Semaphore(bufferSize);
        this.notEmpty = new Semaphore(0);
    }

    async produce(item) {
        await this.notFull.acquire();
        await this.mutex.lock();

        this.buffer.push(item);
        this.emit('produced', item);

        this.mutex.unlock();
        this.notEmpty.release();

        return this.buffer.length;
    }

    async consume() {
        await this.notEmpty.acquire();
        await this.mutex.lock();

        const item = this.buffer.shift();
        this.emit('consumed', item);

        this.mutex.unlock();
        this.notFull.release();

        return item;
    }

    getBufferSize() {
        return this.buffer.length;
    }

    getCapacity() {
        return this.bufferSize;
    }
}

module.exports = {
    Semaphore,
    Mutex,
    ReadWriteLock,
    ProducerConsumer
}; 