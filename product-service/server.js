const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017/ecommerce_ci_cd';

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Product Service: Connected to MongoDB'))
  .catch(err => console.error('Product Service: MongoDB connection error:', err));

// Models
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imageUrl: String
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  productId: { type: String, required: true },
  productName: String,
  quantity: { type: Number, default: 1 },
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Product Service is running' });
});

// Products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, description, imageUrl } = req.body;
    const newProduct = new Product({ name, price, description, imageUrl });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders
app.get('/orders', async (req, res) => {
  try {
      const { userId } = req.query;
      const filter = userId ? { userId } : {};
      const orders = await Order.find(filter);
      res.json(orders);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const qty = quantity || 1;
    const totalPrice = product.price * qty;
    const newOrder = new Order({ 
        userId, 
        productId, 
        productName: product.name,
        quantity: qty, 
        totalPrice 
    });
    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
