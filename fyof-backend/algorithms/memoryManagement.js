class MemoryManager {
    constructor(totalMemory = 1024) {
        this.totalMemory = totalMemory;
        this.allocatedBlocks = [];
        this.freeBlocks = [{start: 0, size: totalMemory}];
        this.pageTable = new Map();
        this.cache = new Map();
        this.cacheSize = 100;
        this.pageFaults = 0;
    }

    // First Fit Algorithm
    firstFit(size) {
        for (let i = 0; i < this.freeBlocks.length; i++) {
            const block = this.freeBlocks[i];
            if (block.size >= size) {
                // Allocate memory block
                const allocatedBlock = {
                    start: block.start,
                    size: size
                };
                this.allocatedBlocks.push(allocatedBlock);

                // Update free block
                block.start += size;
                block.size -= size;
                if (block.size === 0) {
                    this.freeBlocks.splice(i, 1);
                }

                return allocatedBlock;
            }
        }
        return null; // No suitable block found
    }

    // Best Fit Algorithm
    bestFit(size) {
        let bestFitIndex = -1;
        let bestFitSize = Infinity;

        for (let i = 0; i < this.freeBlocks.length; i++) {
            const block = this.freeBlocks[i];
            if (block.size >= size && block.size < bestFitSize) {
                bestFitIndex = i;
                bestFitSize = block.size;
            }
        }

        if (bestFitIndex !== -1) {
            const block = this.freeBlocks[bestFitIndex];
            const allocatedBlock = {
                start: block.start,
                size: size
            };
            this.allocatedBlocks.push(allocatedBlock);

            block.start += size;
            block.size -= size;
            if (block.size === 0) {
                this.freeBlocks.splice(bestFitIndex, 1);
            }

            return allocatedBlock;
        }
        return null;
    }

    // Page Replacement - LRU Algorithm
    lruPageReplacement(pageId, pageData) {
        if (this.cache.size >= this.cacheSize) {
            // Find least recently used page
            let oldestAccess = Date.now();
            let lruPage = null;
            
            for (const [id, data] of this.cache.entries()) {
                if (data.lastAccessed < oldestAccess) {
                    oldestAccess = data.lastAccessed;
                    lruPage = id;
                }
            }
            
            // Remove LRU page
            if (lruPage) {
                this.cache.delete(lruPage);
            }
        }
        
        // Add new page
        this.cache.set(pageId, {
            data: pageData,
            lastAccessed: Date.now()
        });
    }

    // Page Replacement - FIFO Algorithm
    fifoPageReplacement(pageId, pageData) {
        if (this.cache.size >= this.cacheSize) {
            // Remove first inserted page
            const firstPage = this.cache.keys().next().value;
            this.cache.delete(firstPage);
        }
        
        // Add new page
        this.cache.set(pageId, {
            data: pageData,
            insertedAt: Date.now()
        });
    }

    // Access page from cache
    accessPage(pageId) {
        if (this.cache.has(pageId)) {
            const page = this.cache.get(pageId);
            page.lastAccessed = Date.now();
            return page.data;
        }
        
        this.pageFaults++;
        return null;
    }

    // Deallocate memory
    deallocate(block) {
        const index = this.allocatedBlocks.indexOf(block);
        if (index !== -1) {
            this.allocatedBlocks.splice(index, 1);
            this.mergeFreeBlocks(block);
        }
    }

    // Merge contiguous free blocks
    mergeFreeBlocks(newBlock) {
        this.freeBlocks.push(newBlock);
        this.freeBlocks.sort((a, b) => a.start - b.start);

        for (let i = 0; i < this.freeBlocks.length - 1; i++) {
            const currentBlock = this.freeBlocks[i];
            const nextBlock = this.freeBlocks[i + 1];

            if (currentBlock.start + currentBlock.size === nextBlock.start) {
                currentBlock.size += nextBlock.size;
                this.freeBlocks.splice(i + 1, 1);
                i--;
            }
        }
    }

    // Get memory statistics
    getStats() {
        const allocatedMemory = this.allocatedBlocks.reduce((sum, block) => sum + block.size, 0);
        const freeMemory = this.totalMemory - allocatedMemory;

        return {
            totalMemory: this.totalMemory,
            allocatedMemory,
            freeMemory,
            pageFaults: this.pageFaults,
            cacheSize: this.cache.size,
            fragmentationPercent: (freeMemory / this.totalMemory) * 100
        };
    }
}

module.exports = MemoryManager; 