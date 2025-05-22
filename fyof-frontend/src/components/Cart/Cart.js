import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Box, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';

const Cart = () => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [processingStats, setProcessingStats] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleCheckout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://localhost:5000/api/cart/checkout', {
        userId,
        paymentMethod: 'Online Payment'
      });

      // Start order processing with FCFS algorithm
      const processResponse = await axios.post('http://localhost:5000/api/orders/process/fcfs');
      setProcessingStats(processResponse.data);

      // Clear cart after successful checkout
      setCart({ items: [], total: 0 });
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Cart
        </Typography>

        {/* Cart Items */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <List>
              {cart.items.map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={item.itemName}
                    secondary={`₹${item.price}`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: ₹{cart.total}
            </Typography>
          </CardContent>
        </Card>

        {/* Order Processing Visualization */}
        {processingStats && (
          <Card sx={{ mb: 4, bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Order Processing Stats</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Average Waiting Time: {processingStats.averageWaitingTime}s</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Average Turnaround Time: {processingStats.averageTurnaroundTime}s</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>Processing Algorithm: FCFS</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleCheckout}
          disabled={cart.items.length === 0}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Container>
  );
};

export default Cart; 