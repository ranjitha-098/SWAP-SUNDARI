import { Router } from 'express';
import { Order, Review, User } from '../models/index.js';
import { protect } from '../middleware/auth.js';
const r = Router();
r.post('/', protect, async (req, res) => {
  const o = await Order.findById(req.body.order).populate('product');
  if (!o || String(o.buyer) !== req.user.id || !['returned', 'completed', 'confirmed'].includes(o.status)) return res.status(400).json({ message: 'Cannot review this order' });
  if (await Review.exists({ order: o._id, reviewer: req.user.id })) return res.status(400).json({ message: 'Already reviewed' });
  const rev = await Review.create({ order: o._id, reviewer: req.user.id, reviewee: o.product.owner, product: o.product._id, rating: req.body.rating, comment: req.body.comment });
  const all = await Review.find({ reviewee: o.product.owner });
  await User.findByIdAndUpdate(o.product.owner, { ratingAvg: all.reduce((a, x) => a + x.rating, 0) / all.length });
  res.status(201).json(rev);
});
r.get('/product/:id', async (req, res) => res.json(await Review.find({ product: req.params.id }).populate('reviewer', 'name')));
export default r;
