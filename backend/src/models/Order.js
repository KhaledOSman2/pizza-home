const mongoose = require('mongoose');
const { createOrderTimestamp, validateAndCorrectDate } = require('../utils/dateHelpers');
const { createTimestamp, validateTimestamp } = require('../middleware/timestampOverride');

const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // Will be generated automatically
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 30 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
      default: 'pending',
    },
    statusHistory: [{
      status: {
        type: String,
        enum: ['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
        required: true
      },
      timestamp: { type: Date, default: createTimestamp },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      note: String
    }],
    notes: String,
    paymentMethod: { type: String, enum: ['cod', 'card'], default: 'cod' },
    // Override default timestamps with our controlled timing
    createdAt: { type: Date, default: createTimestamp },
    updatedAt: { type: Date, default: createTimestamp }
  },
  { 
    timestamps: false // Disable automatic timestamps to use our custom ones
  }
);

// Generate unique numeric order number and initialize status history before saving
orderSchema.pre('save', async function (next) {
  const now = createTimestamp(); // Use our controlled timestamp
  
  // Force correct timestamps for all orders
  if (this.isNew) {
    // Always use our controlled timestamp, never trust external sources
    this.createdAt = now;
    this.updatedAt = now;
    
    console.log('🕐 Order Creation Timestamp Control:', {
      orderId: this._id?.toString().slice(-6) || 'new',
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      environment: process.env.NODE_ENV || 'development',
      serverTime: new Date().toISOString(),
      cairoTime: now.toISOString(),
      customer: this.customer?.name
    });
  } else {
    // For updates, only update the updatedAt field
    this.updatedAt = now;
    // Validate existing createdAt
    this.createdAt = validateTimestamp(this.createdAt);
  }
  
  if (!this.orderNumber) {
    // Generate a 6-digit order number
    let orderNumber;
    let exists = true;
    
    while (exists) {
      // Generate random 6-digit number
      orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Check if this number already exists
      const existingOrder = await this.constructor.findOne({ orderNumber });
      exists = !!existingOrder;
    }
    
    this.orderNumber = orderNumber;
  }
  
  // Initialize status history with the initial status if it's a new order
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.status,
      timestamp: now, // Use our controlled timestamp
      note: 'طلب جديد'
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);
