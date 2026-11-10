import { Router } from 'express';
import { Product, Order } from '../models/index.js';
import { protect } from '../middleware/auth.js';
const r = Router();
const ACTIVE = ['requested', 'confirmed', 'shipped', 'late'];
const DAY = 864e5;
const paymentOk = async () => true; // TODO: Stripe/Razorpay test-mode charge + deposit hold

r.post('/', protect, async (req, res) => {
  const { productId, type, start, end } = req.body;
  const p = await Product.findById(productId);
  if (!p || p.status !== 'published') return res.status(404).json({ message: 'Unavailable' });
  if (String(p.owner) === req.user.id) return res.status(400).json({ message: 'Cannot order your own item' });
  let data = { buyer: req.user.id, product: p._id, type };

  if (type === 'buy') {
    if (p.listingType === 'rent') return res.status(400).json({ message: 'Rental only' });
    data.total = p.price;
  } else {
    if (p.listingType === 'thrift') return res.status(400).json({ message: 'Not rentable' });
    const s = new Date(start), e = new Date(end);
    if (!(s < e) || s < new Date().setHours(0, 0, 0, 0)) return res.status(400).json({ message: 'Invalid dates' });
    const clash = await Order.exists({ product: p._id, type: 'rent', status: { $in: ACTIVE }, 'rentalPeriod.start': { $lt: e }, 'rentalPeriod.end': { $gt: s } });
    if (clash) return res.status(409).json({ message: 'Dates not available' });
    data = { ...data, rentalPeriod: { start: s, end: e }, total: Math.ceil((e - s) / DAY) * p.rentPerDay, deposit: p.deposit };
  }
  if (!(await paymentOk(data))) return res.status(402).json({ message: 'Payment failed' });
  const order = await Order.create({ ...data, status: 'confirmed' });
  if (type === 'buy') await Product.findByIdAndUpdate(p._id, { status: 'sold' });
  res.status(201).json(order);
});

r.get('/mine', protect, async (req, res) => {
  const mine = await Product.find({ owner: req.user.id }).distinct('_id');
  res.json(await Order.find({ $or: [{ buyer: req.user.id }, { product: { $in: mine } }] }).populate('product', 'title images owner').sort('-createdAt'));
});

// Status transitions; late fee computed on return
r.patch('/:id/status', protect, async (req, res) => {
  const o = await Order.findById(req.params.id).populate('product');
  if (!o) return res.status(404).json({ message: 'Not found' });
  const isParty = [String(o.buyer), String(o.product.owner)].includes(req.user.id) || req.user.role === 'admin';
  if (!isParty) return res.status(403).json({ message: 'Forbidden' });
  const next = req.body.status;
  if (next === 'returned' && o.type === 'rent') {
    const lateDays = Math.max(0, Math.ceil((Date.now() - o.rentalPeriod.end) / DAY));
    o.lateFee = Math.min(lateDays * +(process.env.LATE_FEE_PER_DAY || 200), o.deposit);
  }
  o.status = next;
  await o.save();
  res.json({ ...o.toObject(), depositRefund: o.deposit - o.lateFee });
});

// Flag overdue rentals (call from cron/admin)
r.post('/flag-late', protect, async (req, res) => {
  res.json(await Order.updateMany({ type: 'rent', status: { $in: ['confirmed', 'shipped'] }, 'rentalPeriod.end': { $lt: new Date() } }, { status: 'late' }));
});
export default r;
