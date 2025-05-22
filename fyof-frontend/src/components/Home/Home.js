import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AlgorithmVisualizer from '../OS/AlgorithmVisualizer';

const Home = () => {
  const [outlets, setOutlets] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutlets();
    fetchSystemStats();
  }, []);

  const fetchOutlets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/outlets');
      setOutlets(response.data);
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/stats');
      setSystemStats(response.data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Find Your Own Food
        </Typography>
        
        {/* System Statistics */}
        {systemStats && (
          <Card sx={{ mb: 4, p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">System Statistics</Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography>Memory Usage: {systemStats.memory.allocatedMemory}KB</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>Cache Size: {systemStats.memory.cacheSize}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>Resource Utilization: {systemStats.resources.utilization}%</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography>Order Queue: {systemStats.orderQueueSize}</Typography>
              </Grid>
            </Grid>
          </Card>
        )}

        {/* OS Algorithm Visualizer */}
        <AlgorithmVisualizer />

        {/* Outlet Listings */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          Available Outlets
        </Typography>
        <Grid container spacing={4}>
          {outlets.map((outlet) => (
            <Grid item key={outlet._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={outlet.image || 'https://source.unsplash.com/random?restaurant'}
                  alt={outlet.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {outlet.name}
                  </Typography>
                  <Typography>
                    {outlet.cuisine}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {outlet.location.address}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/outlet/${outlet._id}`)}
                  >
                    View Menu
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 