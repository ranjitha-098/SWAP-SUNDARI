import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import products from './routes/products.js';
import orders from './routes/orders.js';
import reviews from './routes/reviews.js';

const app = express();
const frontendOrigins = process.env.FRONTEND_URL
  ?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || !frontendOrigins || frontendOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
}));
app.use(express.json({ limit: '5mb' }));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/orders', orders);
app.use('/api/reviews', reviews);
app.use((err, req, res, next) => res.status(err.status || 500).json({ message: err.message }));

await mongoose.connect(process.env.MONGO_URI);
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => console.log(`API on :${port}`));
