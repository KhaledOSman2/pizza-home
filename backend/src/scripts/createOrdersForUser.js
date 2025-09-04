const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const Dish = require('../models/Dish');

// Load environment variables
dotenv.config({ path: require('path').join(__dirname, '..', '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createOrdersForUser = async () => {
  try {
    await connectDB();
    
    // Find any user (not admin)
    const user = await User.findOne({ role: { $ne: 'admin' } });
    
    if (!user) {
      console.log('⚠️ No regular user found. Please create a user account first.');
      process.exit(0);
    }
    
    console.log('👤 Found user:', user.name);
    
    // Get available dishes
    const dishes = await Dish.find({});
    
    if (dishes.length === 0) {
      console.log('⚠️ No dishes found. Please run seed:sample first.');
      process.exit(0);
    }
    
    console.log('🍕 Found dishes:', dishes.length);
    
    // Create sample orders
    const sampleOrders = [
      {
        user: user._id,
        customer: {
          name: user.name,
          phone: user.phone || '01234567890',
          address: 'شارع النيل، القاهرة، مصر'
        },
        items: [
          {
            dish: dishes[0]._id,
            name: dishes[0].name,
            price: dishes[0].price,
            quantity: 1
          },
          dishes.length > 2 ? {
            dish: dishes[2]._id,
            name: dishes[2].name,
            price: dishes[2].price,
            quantity: 2
          } : null
        ].filter(Boolean),
        subtotal: dishes[0].price + (dishes.length > 2 ? dishes[2].price * 2 : 0),
        deliveryFee: 30,
        total: dishes[0].price + (dishes.length > 2 ? dishes[2].price * 2 : 0) + 30,
        status: 'delivered',
        paymentMethod: 'cod'
      },
      {
        user: user._id,
        customer: {
          name: user.name,
          phone: user.phone || '01234567890',
          address: 'شارع التحرير، الجيزة، مصر'
        },
        items: [
          {
            dish: dishes[1] ? dishes[1]._id : dishes[0]._id,
            name: dishes[1] ? dishes[1].name : dishes[0].name,
            price: dishes[1] ? dishes[1].price : dishes[0].price,
            quantity: 1
          }
        ],
        subtotal: dishes[1] ? dishes[1].price : dishes[0].price,
        deliveryFee: 30,
        total: (dishes[1] ? dishes[1].price : dishes[0].price) + 30,
        status: 'preparing',
        paymentMethod: 'cod'
      },
      {
        user: user._id,
        customer: {
          name: user.name,
          phone: user.phone || '01234567890',
          address: 'شارع الهرم، الجيزة، مصر'
        },
        items: [
          {
            dish: dishes[0]._id,
            name: dishes[0].name,
            price: dishes[0].price,
            quantity: 2
          }
        ],
        subtotal: dishes[0].price * 2,
        deliveryFee: 30,
        total: (dishes[0].price * 2) + 30,
        status: 'on_the_way',
        paymentMethod: 'cod'
      }
    ];

    // Clear existing orders for this user
    await Order.deleteMany({ user: user._id });
    
    // Create new orders
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log('📦 Created sample orders:', createdOrders.length);
    
    console.log('🎉 Orders created successfully for user:', user.name);
    
    // Display created orders
    createdOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`  - ID: ${order._id}`);
      console.log(`  - Status: ${order.status}`);
      console.log(`  - Total: ${order.total} EGP`);
      console.log(`  - Items: ${order.items.length}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating orders:', error);
    process.exit(1);
  }
};

createOrdersForUser();