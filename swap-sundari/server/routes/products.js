import { Router } from 'express';
import { Product, Order } from '../models/index.js';
import { protect, allow } from '../middleware/auth.js';
const r = Router();
const ACTIVE = ['requested', 'confirmed', 'shipped', 'late'];

// Search + filters. from/to = rental availability window
r.get('/', async (req, res) => {
  const { q, category, brand, size, min, max, luxury, type, from, to } = req.query;
  const f = { status: 'published' };
  if (q) f.$text = { $search: q };
  if (category) f.category = category;
  if (brand) f.brand = new RegExp(`^${brand}$`, 'i');
  if (size) f.size = size;
  if (luxury === 'true') { f.luxury = true; f.authenticity = 'verified'; }
  if (type) f.listingType = { $in: [type, 'both'] };
  if (min || max) f.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };
  let items = await Product.find(f).sort('-createdAt').limit(60).populate('owner', 'name ratingAvg');
  if (from && to) {
    const busy = await Order.find({ type: 'rent', status: { $in: ACTIVE }, 'rentalPeriod.start': { $lt: new Date(to) }, 'rentalPeriod.end': { $gt: new Date(from) } }).distinct('product');
    const set = new Set(busy.map(String));
    items = items.filter((p) => !set.has(String(p._id)));
  }
  res.json(items);
});
r.get('/mine', protect, allow('seller', 'admin'), async (req, res) => {
  res.json(await Product.find({ owner: req.user.id }).sort('-createdAt'));
});
r.get('/admin/pending', protect, allow('admin'), async (req, res) => res.json(await Product.find({ authenticity: 'pending' })));
r.get('/:id', async (req, res) => {
  const p = await Product.findById(req.params.id).populate('owner', 'name ratingAvg');
  p ? res.json(p) : res.status(404).json({ message: 'Not found' });
});
// Luxury items wait for admin approval
r.post('/', protect, allow('seller', 'admin'), async (req, res) => {
  const lux = !!req.body.luxury;
  const p = await Product.create({ ...req.body, owner: req.user.id, authenticity: lux ? 'pending' : 'n/a', status: lux ? 'pending' : 'published' });
  res.status(201).json(p);
});
r.delete('/:id', protect, allow('seller', 'admin'), async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id, status: { $ne: 'draft' } },
    { status: 'draft' },
    { new: true },
  );
  if (!product) return res.status(404).json({ message: 'Listing not found' });
  res.json({ message: 'Listing removed from the shop' });
});
r.put('/:id/verify', protect, allow('admin'), async (req, res) => {
  const ok = req.body.approve !== false;
  res.json(await Product.findByIdAndUpdate(req.params.id, { authenticity: ok ? 'verified' : 'rejected', status: ok ? 'published' : 'draft' }, { new: true }));
});
export default r;
