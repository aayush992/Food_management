const EventEmitter = require('events');

class ProcessScheduler extends EventEmitter {
    constructor() {
        super();
        this.readyQueue = [];
        this.runningProcess = null;
        this.timeQuantum = 4; // For Round Robin
        this.currentTime = 0;
    }

    // First Come First Serve (FCFS)
    fcfs(processes) {
        return processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }

    // Shortest Job First (SJF)
    sjf(processes) {
        return processes.sort((a, b) => {
            if (a.burstTime === b.burstTime) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.burstTime - b.burstTime;
        });
    }

    // Priority Scheduling
    priorityScheduling(processes) {
        return processes.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.arrivalTime - b.arrivalTime;
            }
            return b.priority - a.priority; // Higher number = higher priority
        });
    }

    // Round Robin
    async roundRobin(processes) {
        const queue = [...processes];
        const completed = [];
        
        while (queue.length > 0) {
            const currentProcess = queue.shift();
            
            if (currentProcess.remainingTime > this.timeQuantum) {
                // Process needs more time
                currentProcess.remainingTime -= this.timeQuantum;
                this.currentTime += this.timeQuantum;
                queue.push(currentProcess);
                
                this.emit('process_quantum_complete', {
                    processId: currentProcess.id,
                    remainingTime: currentProcess.remainingTime,
                    timeQuantum: this.timeQuantum
                });
            } else {
                // Process will complete
                this.currentTime += currentProcess.remainingTime;
                currentProcess.completionTime = this.currentTime;
                completed.push(currentProcess);
                
                this.emit('process_complete', {
                    processId: currentProcess.id,
                    completionTime: currentProcess.completionTime
                });
            }
            
            // Simulate async processing
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        return completed;
    }

    // Calculate metrics
    calculateMetrics(processes) {
        let totalWaitingTime = 0;
        let totalTurnaroundTime = 0;

        processes.forEach(process => {
            const waitingTime = process.completionTime - process.arrivalTime - process.burstTime;
            const turnaroundTime = process.completionTime - process.arrivalTime;
            
            totalWaitingTime += waitingTime;
            totalTurnaroundTime += turnaroundTime;
            
            process.waitingTime = waitingTime;
            process.turnaroundTime = turnaroundTime;
        });

        return {
            averageWaitingTime: totalWaitingTime / processes.length,
            averageTurnaroundTime: totalTurnaroundTime / processes.length
        };
    }

    // Add process to ready queue
    addProcess(process) {
        this.readyQueue.push({
            id: process.id,
            arrivalTime: Date.now(),
            burstTime: process.estimatedTime,
            priority: process.priority || 0,
            remainingTime: process.estimatedTime,
            data: process
        });
        
        this.emit('process_added', process);
    }
}

module.exports = ProcessScheduler; 