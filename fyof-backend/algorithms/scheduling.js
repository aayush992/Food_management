/**
 * OS Scheduling Algorithms Implementation
 * For order processing and kitchen management
 */

class Process {
  constructor(id, arrivalTime, burstTime, priority = 0, orderData = null) {
    this.id = id;
    this.arrivalTime = arrivalTime;
    this.burstTime = burstTime; // Cooking time in minutes
    this.priority = priority;
    this.orderData = orderData;
    this.waitingTime = 0;
    this.turnaroundTime = 0;
    this.completionTime = 0;
    this.startTime = 0;
    this.remainingTime = burstTime;
    this.responseTime = -1;
  }
}

class OrderScheduler {
  constructor() {
    this.processes = [];
    this.completedProcesses = [];
    this.currentTime = 0;
    this.timeQuantum = 5; // 5 minutes for Round Robin
  }

  addOrder(orderId, arrivalTime, cookingTime, priority = 0, orderData = null) {
    const process = new Process(orderId, arrivalTime, cookingTime, priority, orderData);
    this.processes.push(process);
    return process;
  }

  // First Come First Serve (FCFS) Scheduling
  fcfsScheduling() {
    const processes = [...this.processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const result = [];
    let currentTime = 0;

    processes.forEach(process => {
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
      }

      process.startTime = currentTime;
      process.completionTime = currentTime + process.burstTime;
      process.turnaroundTime = process.completionTime - process.arrivalTime;
      process.waitingTime = process.turnaroundTime - process.burstTime;
      process.responseTime = process.startTime - process.arrivalTime;

      currentTime = process.completionTime;
      result.push({ ...process });
    });

    return {
      algorithm: 'FCFS',
      processes: result,
      averageWaitingTime: result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length,
      averageTurnaroundTime: result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length,
      averageResponseTime: result.reduce((sum, p) => sum + p.responseTime, 0) / result.length
    };
  }

  // Shortest Job First (SJF) Scheduling
  sjfScheduling() {
    const processes = [...this.processes];
    const result = [];
    const readyQueue = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < processes.length) {
      // Add arrived processes to ready queue
      processes.forEach(process => {
        if (process.arrivalTime <= currentTime && !readyQueue.includes(process) && !result.includes(process)) {
          readyQueue.push(process);
        }
      });

      if (readyQueue.length === 0) {
        currentTime++;
        continue;
      }

      // Sort by burst time (shortest first)
      readyQueue.sort((a, b) => a.burstTime - b.burstTime);
      const currentProcess = readyQueue.shift();

      currentProcess.startTime = currentTime;
      currentProcess.completionTime = currentTime + currentProcess.burstTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime = currentProcess.startTime - currentProcess.arrivalTime;

      currentTime = currentProcess.completionTime;
      result.push({ ...currentProcess });
      completed++;
    }

    return {
      algorithm: 'SJF',
      processes: result,
      averageWaitingTime: result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length,
      averageTurnaroundTime: result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length,
      averageResponseTime: result.reduce((sum, p) => sum + p.responseTime, 0) / result.length
    };
  }

  // Priority Scheduling (Higher number = Higher priority)
  priorityScheduling() {
    const processes = [...this.processes];
    const result = [];
    const readyQueue = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < processes.length) {
      // Add arrived processes to ready queue
      processes.forEach(process => {
        if (process.arrivalTime <= currentTime && !readyQueue.includes(process) && !result.includes(process)) {
          readyQueue.push(process);
        }
      });

      if (readyQueue.length === 0) {
        currentTime++;
        continue;
      }

      // Sort by priority (highest first)
      readyQueue.sort((a, b) => b.priority - a.priority);
      const currentProcess = readyQueue.shift();

      currentProcess.startTime = currentTime;
      currentProcess.completionTime = currentTime + currentProcess.burstTime;
      currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
      currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
      currentProcess.responseTime = currentProcess.startTime - currentProcess.arrivalTime;

      currentTime = currentProcess.completionTime;
      result.push({ ...currentProcess });
      completed++;
    }

    return {
      algorithm: 'Priority',
      processes: result,
      averageWaitingTime: result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length,
      averageTurnaroundTime: result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length,
      averageResponseTime: result.reduce((sum, p) => sum + p.responseTime, 0) / result.length
    };
  }

  // Round Robin Scheduling
  roundRobinScheduling(timeQuantum = this.timeQuantum) {
    const processes = [...this.processes].map(p => ({ ...p, remainingTime: p.burstTime }));
    const result = [];
    const readyQueue = [];
    const ganttChart = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < processes.length) {
      // Add arrived processes to ready queue
      processes.forEach(process => {
        if (process.arrivalTime <= currentTime && !readyQueue.includes(process) && process.remainingTime > 0) {
          if (!readyQueue.find(p => p.id === process.id)) {
            readyQueue.push(process);
          }
        }
      });

      if (readyQueue.length === 0) {
        currentTime++;
        continue;
      }

      const currentProcess = readyQueue.shift();

      // Set response time if first execution
      if (currentProcess.responseTime === -1) {
        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
      }

      // Execute for time quantum or remaining time
      const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
      
      ganttChart.push({
        processId: currentProcess.id,
        startTime: currentTime,
        endTime: currentTime + executionTime
      });

      currentTime += executionTime;
      currentProcess.remainingTime -= executionTime;

      // Add newly arrived processes
      processes.forEach(process => {
        if (process.arrivalTime <= currentTime && !readyQueue.includes(process) && 
            process.remainingTime > 0 && process.id !== currentProcess.id) {
          if (!readyQueue.find(p => p.id === process.id)) {
            readyQueue.push(process);
          }
        }
      });

      // If process is completed
      if (currentProcess.remainingTime === 0) {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        result.push({ ...currentProcess });
        completed++;
      } else {
        // Add back to queue if not completed
        readyQueue.push(currentProcess);
      }
    }

    return {
      algorithm: 'Round Robin',
      timeQuantum: timeQuantum,
      processes: result,
      ganttChart: ganttChart,
      averageWaitingTime: result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length,
      averageTurnaroundTime: result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length,
      averageResponseTime: result.reduce((sum, p) => sum + p.responseTime, 0) / result.length
    };
  }

  // Shortest Remaining Time First (SRTF) - Preemptive SJF
  srtfScheduling() {
    const processes = [...this.processes].map(p => ({ ...p, remainingTime: p.burstTime }));
    const result = [];
    const ganttChart = [];
    let currentTime = 0;
    let completed = 0;

    while (completed < processes.length) {
      // Find available processes
      const availableProcesses = processes.filter(p => 
        p.arrivalTime <= currentTime && p.remainingTime > 0
      );

      if (availableProcesses.length === 0) {
        currentTime++;
        continue;
      }

      // Select process with shortest remaining time
      const currentProcess = availableProcesses.reduce((min, p) => 
        p.remainingTime < min.remainingTime ? p : min
      );

      // Set response time if first execution
      if (currentProcess.responseTime === -1) {
        currentProcess.responseTime = currentTime - currentProcess.arrivalTime;
      }

      // Execute for 1 time unit
      ganttChart.push({
        processId: currentProcess.id,
        startTime: currentTime,
        endTime: currentTime + 1
      });

      currentTime++;
      currentProcess.remainingTime--;

      // If process is completed
      if (currentProcess.remainingTime === 0) {
        currentProcess.completionTime = currentTime;
        currentProcess.turnaroundTime = currentProcess.completionTime - currentProcess.arrivalTime;
        currentProcess.waitingTime = currentProcess.turnaroundTime - currentProcess.burstTime;
        result.push({ ...currentProcess });
        completed++;
      }
    }

    return {
      algorithm: 'SRTF',
      processes: result,
      ganttChart: ganttChart,
      averageWaitingTime: result.reduce((sum, p) => sum + p.waitingTime, 0) / result.length,
      averageTurnaroundTime: result.reduce((sum, p) => sum + p.turnaroundTime, 0) / result.length,
      averageResponseTime: result.reduce((sum, p) => sum + p.responseTime, 0) / result.length
    };
  }

  // Compare all algorithms
  compareAlgorithms() {
    const fcfs = this.fcfsScheduling();
    const sjf = this.sjfScheduling();
    const priority = this.priorityScheduling();
    const roundRobin = this.roundRobinScheduling();
    const srtf = this.srtfScheduling();

    return {
      comparison: {
        FCFS: {
          avgWaitingTime: fcfs.averageWaitingTime,
          avgTurnaroundTime: fcfs.averageTurnaroundTime,
          avgResponseTime: fcfs.averageResponseTime
        },
        SJF: {
          avgWaitingTime: sjf.averageWaitingTime,
          avgTurnaroundTime: sjf.averageTurnaroundTime,
          avgResponseTime: sjf.averageResponseTime
        },
        Priority: {
          avgWaitingTime: priority.averageWaitingTime,
          avgTurnaroundTime: priority.averageTurnaroundTime,
          avgResponseTime: priority.averageResponseTime
        },
        RoundRobin: {
          avgWaitingTime: roundRobin.averageWaitingTime,
          avgTurnaroundTime: roundRobin.averageTurnaroundTime,
          avgResponseTime: roundRobin.averageResponseTime
        },
        SRTF: {
          avgWaitingTime: srtf.averageWaitingTime,
          avgTurnaroundTime: srtf.averageTurnaroundTime,
          avgResponseTime: srtf.averageResponseTime
        }
      },
      bestAlgorithm: this.findBestAlgorithm([fcfs, sjf, priority, roundRobin, srtf]),
      detailedResults: { fcfs, sjf, priority, roundRobin, srtf }
    };
  }

  findBestAlgorithm(results) {
    let best = results[0];
    let bestScore = this.calculateScore(best);

    results.forEach(result => {
      const score = this.calculateScore(result);
      if (score < bestScore) {
        best = result;
        bestScore = score;
      }
    });

    return {
      algorithm: best.algorithm,
      score: bestScore,
      metrics: {
        avgWaitingTime: best.averageWaitingTime,
        avgTurnaroundTime: best.averageTurnaroundTime,
        avgResponseTime: best.averageResponseTime
      }
    };
  }

  calculateScore(result) {
    // Weighted score: waiting time (40%), turnaround time (40%), response time (20%)
    return (result.averageWaitingTime * 0.4) + 
           (result.averageTurnaroundTime * 0.4) + 
           (result.averageResponseTime * 0.2);
  }

  // Clear all processes
  reset() {
    this.processes = [];
    this.completedProcesses = [];
    this.currentTime = 0;
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const comparison = this.compareAlgorithms();
    return {
      totalOrders: this.processes.length,
      algorithmsCompared: 5,
      bestAlgorithm: comparison.bestAlgorithm,
      performanceComparison: comparison.comparison,
      recommendation: this.getRecommendation(comparison.bestAlgorithm)
    };
  }

  getRecommendation(bestAlgorithm) {
    const recommendations = {
      'FCFS': 'Best for simple, fair processing when order arrival is predictable',
      'SJF': 'Optimal for minimizing average waiting time when cooking times are known',
      'Priority': 'Ideal for VIP customers and urgent orders',
      'Round Robin': 'Best for balanced response time and fair processing',
      'SRTF': 'Optimal for dynamic environments with varying order complexities'
    };

    return recommendations[bestAlgorithm.algorithm] || 'Optimal algorithm based on current metrics';
  }
}

module.exports = {
  OrderScheduler,
  Process
};
