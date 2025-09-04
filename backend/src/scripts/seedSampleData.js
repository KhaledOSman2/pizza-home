const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const Dish = require('../models/Dish');
const Order = require('../models/Order');
const User = require('../models/User');

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

const sampleCategories = [
  {
    name: 'بيتزا',
    slug: 'pizza',
    description: 'أشهى أنواع البيتزا الطازجة',
    image: { url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', publicId: 'pizza_category' }
  },
  {
    name: 'برجر',
    slug: 'burger', 
    description: 'برجر لذيذ بمكونات طازجة',
    image: { url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', publicId: 'burger_category' }
  }
];

const sampleDishes = [
  {
    name: 'بيتزا مارجريتا',
    slug: 'margherita-pizza',
    description: 'بيتزا كلاسيكية بالطماطم والموزاريلا والريحان',
    price: 75,
    image: { url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3', publicId: 'margherita_pizza' },
    category: null, // Will be set to pizza category ID
    available: true,
    tags: ['نباتي', 'كلاسيكي']
  },
  {
    name: 'بيتزا بيبروني',
    slug: 'pepperoni-pizza',
    description: 'بيتزا شهية مع شرائح البيبروني والجبن',
    price: 85,
    image: { url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e', publicId: 'pepperoni_pizza' },
    category: null,
    available: true,
    tags: ['حار', 'شعبي']
  },
  {
    name: 'تشيز برجر',
    slug: 'cheese-burger',
    description: 'برجر لحم بقري مع الجبن والخضروات الطازجة',
    price: 65,
    image: { url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', publicId: 'cheese_burger' },
    category: null, // Will be set to burger category ID
    available: true,
    tags: ['لحم', 'جبن']
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('🧹 Clearing existing data...');
    // Drop collections to avoid unique constraint issues
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.dropCollection(collection.name);
    }
    console.log('🧹 Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(sampleCategories);
    console.log('📂 Created categories:', createdCategories.length);

    // Set category IDs for dishes
    sampleDishes[0].category = createdCategories[0]._id; // Pizza
    sampleDishes[1].category = createdCategories[0]._id; // Pizza
    sampleDishes[2].category = createdCategories[1]._id; // Burger

    // Create dishes
    const createdDishes = await Dish.insertMany(sampleDishes);
    console.log('🍕 Created dishes:', createdDishes.length);

    // Find a user to create orders for (if any exists)
    const user = await User.findOne({ role: { $ne: 'admin' } });
    
    if (user) {
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
              dish: createdDishes[0]._id,
              name: createdDishes[0].name,
              price: createdDishes[0].price,
              quantity: 1
            },
            {
              dish: createdDishes[2]._id,
              name: createdDishes[2].name,
              price: createdDishes[2].price,
              quantity: 2
            }
          ],
          subtotal: createdDishes[0].price + (createdDishes[2].price * 2),
          deliveryFee: 30,
          total: createdDishes[0].price + (createdDishes[2].price * 2) + 30,
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
              dish: createdDishes[1]._id,
              name: createdDishes[1].name,
              price: createdDishes[1].price,
              quantity: 1
            }
          ],
          subtotal: createdDishes[1].price,
          deliveryFee: 30,
          total: createdDishes[1].price + 30,
          status: 'preparing',
          paymentMethod: 'cod'
        }
      ];

      const createdOrders = await Order.insertMany(sampleOrders);
      console.log('📦 Created sample orders:', createdOrders.length);
    } else {
      console.log('⚠️ No user found to create orders for. Create a user account first.');
    }

    console.log('🎉 Sample data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();