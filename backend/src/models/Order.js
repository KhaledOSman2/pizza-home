const mongoose = require('mongoose');

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
      timestamp: { type: Date, default: Date.now },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      note: String
    }],
    notes: String,
    paymentMethod: { type: String, enum: ['cod', 'card'], default: 'cod' },
  },
  { timestamps: true }
);

// Generate unique numeric order number and initialize status history before saving
orderSchema.pre('save', async function (next) {
  const now = new Date();
  
  // Ensure createdAt is not in the future for new orders
  if (this.isNew) {
    // Force createdAt to current server time if it's in the future
    if (this.createdAt > now) {
      console.warn(`Order created with future date: ${this.createdAt}, setting to current time: ${now}`);
      this.createdAt = now;
    }
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
      timestamp: now, // Use server time, not potentially incorrect client time
      note: 'طلب جديد'
    });
  }
  
  next();
});

module.exports = mongoose.model('Order', orderSchema);
