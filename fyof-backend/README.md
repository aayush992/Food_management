# FYOF (Find Your Own Food) Backend

A food ordering system backend implementing various OS algorithms for order processing and resource management.

## Features

- Process Scheduling (FCFS, SJF, Priority, Round Robin)
- Memory Management (First Fit, Best Fit, LRU, FIFO)
- Resource Management (Banker's Algorithm)
- Synchronization (Semaphores, Mutex)

## Environment Variables

Create a `.env` file with:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

## Installation

```bash
npm install
```

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

- POST `/api/process/orders` - Add new order
- POST `/api/process/process/:algorithm` - Process orders with specified algorithm
- POST `/api/process/allocate/:orderId` - Allocate resources for an order
- GET `/api/process/stats` - Get system statistics 