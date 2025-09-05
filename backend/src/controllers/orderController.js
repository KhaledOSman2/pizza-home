const mongoose = require('mongoose');
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { createOrderTimestamp } = require('../utils/dateHelpers');

const allowedStatuses = ['pending', 'preparing', 'on_the_way', 'delivered', 'cancelled'];

exports.create = catchAsync(async (req, res, next) => {
  const { customer, items } = req.body;
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return next(new ApiError('customer.name, customer.phone and customer.address are required', 400));
  }
  if (!Array.isArray(items) || items.length === 0) {
    return next(new ApiError('items array is required', 400));
  }

  // validate items and calculate totals using DB prices
  const dishIds = items.map((it) => it.dish).filter(Boolean);
  const dishes = await Dish.find({ _id: { $in: dishIds } });
  const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

  const normalizedItems = [];
  for (const it of items) {
    const d = dishMap.get(it.dish);
    if (!d) return next(new ApiError('One or more dishes are invalid', 400));
    const quantity = Math.max(1, Number(it.quantity || 1));
    normalizedItems.push({ dish: d._id, name: d.name, price: d.price, quantity });
  }

  const subtotal = normalizedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  // Ensure we use timezone-aware server time for order creation
  const orderData = {
    user: req.user ? req.user._id : undefined,
    customer,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    total,
    status: 'pending',
  };

  // Explicitly set timestamps to timezone-aware server time
  const now = createOrderTimestamp();
  orderData.createdAt = now;
  orderData.updatedAt = now;

  console.log('Creating order with timestamp:', {
    timestamp: now.toISOString(),
    environment: process.env.NODE_ENV || 'development',
    timezone: process.env.TZ || 'UTC',
    customer: customer.name
  });

  const order = await Order.create(orderData);

  res.status(201).json({ order });
});

exports.list = catchAsync(async (req, res) => {
  const filter = {};
  
  // جميع المستخدمين (بما في ذلك الأدمن) يرون طلباتهم الشخصية فقط في هذا الـ endpoint
  filter.user = req.user._id;
  
  // فلترة حسب الحالة إذا تم تمريرها
  if (req.query.status && allowedStatuses.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  
  const orders = await Order.find(filter)
    .populate('user', 'name email role')
    .populate('items.dish', 'name price')
    .sort({ createdAt: -1 });
  
  res.status(200).json({ 
    results: orders.length, 
    orders,
    userRole: req.user.role 
  });
});

// دالة خاصة للأدمن لعرض جميع الطلبات
exports.listAllForAdmin = catchAsync(async (req, res) => {
  const filter = {};
  
  // فلترة حسب الحالة إذا تم تمريرها
  if (req.query.status && allowedStatuses.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  
  const orders = await Order.find(filter)
    .populate('user', 'name email role')
    .populate('items.dish', 'name price')
    .sort({ createdAt: -1 });
  
  res.status(200).json({ 
    results: orders.length, 
    orders,
    userRole: req.user.role 
  });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email role')
    .populate('items.dish', 'name price');
    
  if (!order) return next(new ApiError('Order not found', 404));
  
  const isAdmin = req.user.role === 'admin';
  const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
  
  // المستخدم العادي يمكنه رؤية طلباته فقط، الأدمن يرى جميع الطلبات
  if (!isAdmin && !isOwner) {
    return next(new ApiError('غير مصرح لك بعرض هذا الطلب', 403));
  }
  
  res.status(200).json({ order });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError('Order not found', 404));
  const { status, note } = req.body;
  if (!allowedStatuses.includes(status)) return next(new ApiError('Invalid status', 400));
  
  // Only track if status actually changed
  if (order.status !== status) {
    // Add status change to history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: note || getStatusChangeNote(status)
    });
    
    order.status = status;
  }
  
  await order.save();
  res.status(200).json({ order });
});

// Helper function to get default status change notes in Arabic
const getStatusChangeNote = (status) => {
  switch (status) {
    case 'pending':
      return 'تم إرجاع الطلب إلى قائمة الانتظار';
    case 'preparing':
      return 'بدأ تحضير الطلب';
    case 'on_the_way':
      return 'الطلب في الطريق للتوصيل';
    case 'delivered':
      return 'تم تسليم الطلب بنجاح';
    case 'cancelled':
      return 'تم إلغاء الطلب';
    default:
      return 'تم تحديث حالة الطلب';
  }
};
