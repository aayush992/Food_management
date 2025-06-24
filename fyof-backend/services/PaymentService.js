const Razorpay = require('razorpay');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    // Initialize Razorpay (popular in India)
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    });
  }

  // Create Razorpay order
  async createRazorpayOrder(orderData) {
    try {
      const options = {
        amount: orderData.totalAmount * 100, // Amount in paise
        currency: 'INR',
        receipt: `order_${orderData._id}`,
        notes: {
          orderId: orderData._id.toString(),
          customerId: orderData.customerId.toString(),
          outletId: orderData.outletId.toString()
        }
      };

      const razorpayOrder = await this.razorpay.orders.create(options);
      
      return {
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verify Razorpay payment
  async verifyRazorpayPayment(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
        .update(body.toString())
        .digest('hex');

      if (expectedSignature === razorpay_signature) {
        return {
          success: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        };
      } else {
        return {
          success: false,
          error: 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // UPI Payment simulation
  async processUPIPayment(orderData, upiData) {
    try {
      // Simulate UPI payment processing
      console.log(`Processing UPI payment for order ${orderData._id}`);
      console.log(`UPI ID: ${upiData.upiId}`);
      console.log(`Amount: ₹${orderData.totalAmount}`);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock UPI transaction ID
      const transactionId = `UPI${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Simulate 98% success rate for UPI
      const success = Math.random() > 0.02;

      if (success) {
        return {
          success: true,
          transactionId,
          paymentMethod: 'upi',
          message: 'UPI payment successful'
        };
      } else {
        return {
          success: false,
          error: 'UPI payment failed. Please try again.'
        };
      }
    } catch (error) {
      console.error('UPI payment processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Wallet Payment simulation (Paytm, PhonePe, etc.)
  async processWalletPayment(orderData, walletData) {
    try {
      console.log(`Processing wallet payment for order ${orderData._id}`);
      console.log(`Wallet: ${walletData.walletType}`);
      console.log(`Amount: ₹${orderData.totalAmount}`);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock wallet transaction ID
      const transactionId = `${walletData.walletType.toUpperCase()}${Date.now()}${Math.random().toString(36).substr(2, 6)}`;

      // Simulate 97% success rate for wallet payments
      const success = Math.random() > 0.03;

      if (success) {
        return {
          success: true,
          transactionId,
          paymentMethod: 'wallet',
          walletType: walletData.walletType,
          message: `${walletData.walletType} payment successful`
        };
      } else {
        return {
          success: false,
          error: `${walletData.walletType} payment failed. Please check your wallet balance.`
        };
      }
    } catch (error) {
      console.error('Wallet payment processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Card Payment simulation
  async processCardPayment(orderData, cardData) {
    try {
      console.log(`Processing card payment for order ${orderData._id}`);
      console.log(`Card: ****${cardData.cardNumber.slice(-4)}`);
      console.log(`Amount: ₹${orderData.totalAmount}`);

      // Basic card validation
      if (!this.validateCard(cardData)) {
        return {
          success: false,
          error: 'Invalid card details'
        };
      }

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generate mock transaction ID
      const transactionId = `CARD${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      // Simulate 95% success rate for card payments
      const success = Math.random() > 0.05;

      if (success) {
        return {
          success: true,
          transactionId,
          paymentMethod: 'card',
          cardType: this.getCardType(cardData.cardNumber),
          message: 'Card payment successful'
        };
      } else {
        return {
          success: false,
          error: 'Card payment failed. Please check your card details or try another payment method.'
        };
      }
    } catch (error) {
      console.error('Card payment processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Validate card details
  validateCard(cardData) {
    const { cardNumber, expiryDate, cvv } = cardData;
    
    // Basic validations
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      return false;
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      return false;
    }
    
    if (!cvv || cvv.length < 3 || cvv.length > 4) {
      return false;
    }
    
    // Check if card is not expired
    const [month, year] = expiryDate.split('/');
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    
    if (expiry < now) {
      return false;
    }
    
    return true;
  }

  // Get card type from card number
  getCardType(cardNumber) {
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = cardNumber.substring(0, 2);
    
    if (firstDigit === '4') return 'Visa';
    if (firstTwoDigits >= '51' && firstTwoDigits <= '55') return 'Mastercard';
    if (firstTwoDigits === '34' || firstTwoDigits === '37') return 'American Express';
    if (firstTwoDigits === '60' || firstTwoDigits === '65') return 'Discover';
    
    return 'Unknown';
  }

  // Process refund
  async processRefund(paymentId, amount, reason) {
    try {
      console.log(`Processing refund for payment ${paymentId}`);
      console.log(`Amount: ₹${amount}`);
      console.log(`Reason: ${reason}`);

      // Simulate refund processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const refundId = `REF${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      return {
        success: true,
        refundId,
        amount,
        status: 'processed',
        message: 'Refund processed successfully'
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get payment methods available
  getAvailablePaymentMethods() {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using your credit or debit card',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay using UPI (Google Pay, PhonePe, Paytm)',
        icon: 'mobile',
        enabled: true
      },
      {
        id: 'wallet',
        name: 'Digital Wallet',
        description: 'Pay using Paytm, PhonePe, or other wallets',
        icon: 'wallet',
        enabled: true
      },
      {
        id: 'cash',
        name: 'Cash on Delivery',
        description: 'Pay when your order is delivered',
        icon: 'money',
        enabled: true
      }
    ];
  }
}

module.exports = new PaymentService();
