const mongoose = require('mongoose');
const Order = require('../models/Order');
const Dish = require('../models/Dish');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

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
  const deliveryFee = 30;
  const total = subtotal + deliveryFee;

  const order = await Order.create({
    user: req.user ? req.user._id : undefined,
    customer,
    items: normalizedItems,
    subtotal,
    deliveryFee,
    total,
    status: 'pending',
  });

  res.status(201).json({ order });
});

exports.list = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = {};
  if (!isAdmin) filter.user = req.user._id;
  if (req.query.status && allowedStatuses.includes(req.query.status)) filter.status = req.query.status;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ results: orders.length, orders });
});

exports.getOne = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError('Order not found', 404));
  const isAdmin = req.user.role === 'admin';
  const isOwner = order.user && order.user.toString() === req.user.id;
  if (!isAdmin && !isOwner) return next(new ApiError('Forbidden', 403));
  res.status(200).json({ order });
});

exports.updateStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ApiError('Order not found', 404));
  const { status } = req.body;
  if (!allowedStatuses.includes(status)) return next(new ApiError('Invalid status', 400));
  order.status = status;
  await order.save();
  res.status(200).json({ order });
});
