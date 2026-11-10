import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import products from './routes/products.js';
import orders from './routes/orders.js';
import reviews from './routes/reviews.js';

const app = express();
app.use(cors(), express.json({ limit: '5mb' }));
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/reviews', reviews);
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));

await mongoose.connect(process.env.MONGO_URI);
app.listen(5000, () => console.log('API on :5000'));
