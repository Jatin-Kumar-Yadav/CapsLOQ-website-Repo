const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'MISSING');

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());






// Serve static files (CSS, JS, images, Phones.json)
app.use(express.static(path.join(__dirname, '..')));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve specific .html pages
app.get('/:page.html', (req, res) => {
  const page = req.params.page;
  const validPages = ['index', 'Login', 'cart', 'About', 'Customize', 'support_help'];
  
  if (validPages.includes(page)) {
    res.sendFile(path.join(__dirname, '..', `${page}.html`));
  } else {
    res.status(404).send('Page not found');
  }
});





mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// User Schema (for auth and cart linking)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  pastPurchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
  savedForLater: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CartItem' }],
});
const User = mongoose.model('User', userSchema);

// CartItem Schema (shared for all sections)
const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  ram: String,
  storage: String,
  battery: String,
  price: Number,
  img: String,
  processor: String,
  camera: String,
  display: String,
  quantity: { type: Number, default: 1 },
  section: { type: String, enum: ['cart', 'pastPurchases', 'savedForLater'], default: 'cart' }, // Tracks which section
});
const CartItem = mongoose.model('CartItem', cartItemSchema);

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '87654321');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Routes

// Register (for new users)
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPw = await bcrypt.hash(password, 10);
  try {
    const user = new User({ email, password: hashedPw });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '87654321');
    res.json({ token, userId: user._id });
  } catch (e) {
    res.status(400).json({ error: 'User exists' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '87654321');
  res.json({ token, userId: user._id });
});

// Get user's cart data
app.get('/api/cart', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('cart pastPurchases savedForLater');
  res.json({
    cart: user.cart,
    pastPurchases: user.pastPurchases,
    savedForLater: user.savedForLater,
  });
});

// Add to cart
app.post('/api/cart/add', authMiddleware, async (req, res) => {
  const { name, ram, storage, battery, price, img, processor, camera, display, quantity = 1 } = req.body;
  let item = await CartItem.findOne({ userId: req.user.userId, name, section: 'cart' });
  if (item) {
    item.quantity += quantity;
    await item.save();
  } else {
    item = new CartItem({ userId: req.user.userId, name, ram, storage, battery, price, img, processor, camera, display, quantity, section: 'cart' });
    await item.save();
    await User.findByIdAndUpdate(req.user.userId, { $push: { cart: item._id } });
  }
  res.json({ message: 'Added to cart' });
});

// Move to past purchases (buy now)
app.post('/api/cart/buy/:itemId', authMiddleware, async (req, res) => {
  const item = await CartItem.findById(req.params.itemId);
  if (!item || item.userId.toString() !== req.user.userId) return res.status(404).json({ error: 'Item not found' });
  item.section = 'pastPurchases';
  await item.save();
  await User.findByIdAndUpdate(req.user.userId, { $pull: { cart: item._id }, $push: { pastPurchases: item._id } });
  res.json({ message: 'Moved to purchases' });
});

// Save for later
app.post('/api/cart/save/:itemId', authMiddleware, async (req, res) => {
  const item = await CartItem.findById(req.params.itemId);
  if (!item || item.userId.toString() !== req.user.userId) return res.status(404).json({ error: 'Item not found' });
  item.section = 'savedForLater';
  await item.save();
  await User.findByIdAndUpdate(req.user.userId, { $pull: { cart: item._id }, $push: { savedForLater: item._id } });
  res.json({ message: 'Saved for later' });
});

// Clear cart
app.delete('/api/cart/clear', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);
  await CartItem.deleteMany({ userId: req.user.userId, section: 'cart' });
  user.cart = [];
  await user.save();
  res.json({ message: 'Cart cleared' });
});

// Checkout all (move cart to purchases)
app.post('/api/cart/checkout', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId).populate('cart');
  for (let item of user.cart) {
    item.section = 'pastPurchases';
    await item.save();
  }
  user.pastPurchases.push(...user.cart.map(item => item._id));
  user.cart = [];
  await user.save();
  res.json({ message: 'Checked out' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));