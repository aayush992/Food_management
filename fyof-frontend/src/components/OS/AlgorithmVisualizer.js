import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, LinearProgress, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';

const AlgorithmVisualizer = () => {
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [processingStats, setProcessingStats] = useState(null);
  const [memoryStats, setMemoryStats] = useState(null);
  const [resourceStats, setResourceStats] = useState(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/stats');
      const { memory, resources, orderQueueSize } = response.data;
      
      setMemoryStats(memory);
      setResourceStats(resources);
      setProcessingStats({
        queueSize: orderQueueSize,
        algorithm: algorithm.toUpperCase()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAlgorithmChange = async (event) => {
    const newAlgorithm = event.target.value;
    setAlgorithm(newAlgorithm);
    
    try {
      await axios.post(`http://localhost:5000/api/orders/process/${newAlgorithm}`);
      fetchStats();
    } catch (error) {
      console.error('Error changing algorithm:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        System Resource Monitor
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Processing Algorithm</InputLabel>
        <Select
          value={algorithm}
          label="Processing Algorithm"
          onChange={handleAlgorithmChange}
        >
          <MenuItem value="fcfs">First Come First Serve (FCFS)</MenuItem>
          <MenuItem value="sjf">Shortest Job First (SJF)</MenuItem>
          <MenuItem value="priority">Priority Scheduling</MenuItem>
          <MenuItem value="roundRobin">Round Robin</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {/* Memory Usage */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Memory Management</Typography>
              {memoryStats && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Allocated Memory: {memoryStats.allocatedMemory}KB
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(memoryStats.allocatedMemory / memoryStats.totalMemory) * 100} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Page Faults: {memoryStats.pageFaults}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cache Size: {memoryStats.cacheSize}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Resource Utilization */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Resource Management</Typography>
              {resourceStats && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    CPU Utilization: {resourceStats.utilization}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={resourceStats.utilization} 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Active Resources: {resourceStats.activeResources}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Waiting Processes: {resourceStats.waitingProcesses}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Process Queue */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Process Queue</Typography>
              {processingStats && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Current Algorithm: {processingStats.algorithm}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Queue Size: {processingStats.queueSize}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(processingStats.queueSize / 20) * 100} 
                    sx={{ mt: 1 }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AlgorithmVisualizer; 