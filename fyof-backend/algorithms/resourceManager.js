class ResourceManager {
    constructor(resources) {
        this.available = [...resources];
        this.maxDemand = [];
        this.allocation = [];
        this.need = [];
        this.processes = [];
    }

    // Initialize a new process
    addProcess(processId, maxResourceDemand) {
        if (maxResourceDemand.length !== this.available.length) {
            throw new Error('Invalid resource demand vector length');
        }

        this.processes.push(processId);
        this.maxDemand.push([...maxResourceDemand]);
        this.allocation.push(new Array(this.available.length).fill(0));
        this.need.push([...maxResourceDemand]);
    }

    // Banker's Algorithm for deadlock prevention
    isSafeState(processIndex = -1, requestVector = null) {
        // Create working copies of data structures
        const work = [...this.available];
        const finish = new Array(this.processes.length).fill(false);
        const allocation = this.allocation.map(row => [...row]);
        const need = this.need.map(row => [...row]);

        // If this is a resource request, simulate allocation
        if (processIndex !== -1 && requestVector) {
            for (let i = 0; i < work.length; i++) {
                work[i] -= requestVector[i];
                allocation[processIndex][i] += requestVector[i];
                need[processIndex][i] -= requestVector[i];
            }
        }

        // Find a process that can complete
        let count = 0;
        while (count < this.processes.length) {
            let found = false;
            for (let i = 0; i < this.processes.length; i++) {
                if (!finish[i]) {
                    let canAllocate = true;
                    for (let j = 0; j < work.length; j++) {
                        if (need[i][j] > work[j]) {
                            canAllocate = false;
                            break;
                        }
                    }

                    if (canAllocate) {
                        // Process can complete
                        for (let j = 0; j < work.length; j++) {
                            work[j] += allocation[i][j];
                        }
                        finish[i] = true;
                        found = true;
                        count++;
                    }
                }
            }
            if (!found) break;
        }

        return count === this.processes.length;
    }

    // Request resources
    requestResources(processIndex, requestVector) {
        // Validate request
        for (let i = 0; i < requestVector.length; i++) {
            if (requestVector[i] > this.need[processIndex][i]) {
                throw new Error('Process has exceeded its maximum claim');
            }
            if (requestVector[i] > this.available[i]) {
                throw new Error('Resources are not available');
            }
        }

        // Check if request leads to safe state
        if (this.isSafeState(processIndex, requestVector)) {
            // Grant request
            for (let i = 0; i < requestVector.length; i++) {
                this.available[i] -= requestVector[i];
                this.allocation[processIndex][i] += requestVector[i];
                this.need[processIndex][i] -= requestVector[i];
            }
            return true;
        }

        return false;
    }

    // Release resources
    releaseResources(processIndex, releaseVector) {
        for (let i = 0; i < releaseVector.length; i++) {
            if (releaseVector[i] > this.allocation[processIndex][i]) {
                throw new Error('Process trying to release more resources than allocated');
            }
            this.available[i] += releaseVector[i];
            this.allocation[processIndex][i] -= releaseVector[i];
            this.need[processIndex][i] += releaseVector[i];
        }
    }

    // Get current state
    getState() {
        return {
            processes: this.processes,
            available: this.available,
            maxDemand: this.maxDemand,
            allocation: this.allocation,
            need: this.need
        };
    }

    // Check if process can complete
    canProcessComplete(processIndex) {
        for (let i = 0; i < this.available.length; i++) {
            if (this.need[processIndex][i] > this.available[i]) {
                return false;
            }
        }
        return true;
    }

    // Get resource utilization
    getResourceUtilization() {
        const utilization = new Array(this.available.length).fill(0);
        const total = [...this.available];

        // Add allocated resources to total
        for (let i = 0; i < this.allocation.length; i++) {
            for (let j = 0; j < this.allocation[i].length; j++) {
                total[j] += this.allocation[i][j];
            }
        }

        // Calculate utilization percentage
        for (let i = 0; i < this.available.length; i++) {
            utilization[i] = ((total[i] - this.available[i]) / total[i]) * 100;
        }

        return utilization;
    }
}

module.exports = ResourceManager; 