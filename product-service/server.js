const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongodb:27017/ecommerce_ci_cd';
const SERVICE_NAME = process.env.SERVICE_NAME || 'product-service';

const register = new client.Registry();
client.collectDefaultMetrics({
  register,
  prefix: 'product_service_',
  labels: { service: SERVICE_NAME }
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['service', 'method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['service', 'method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route && req.route.path ? req.route.path : req.path;
    const labels = {
      service: SERVICE_NAME,
      method: req.method,
      route,
      status_code: res.statusCode
    };
    end(labels);
    httpRequestsTotal.inc(labels);
  });

  next();
});

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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
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
