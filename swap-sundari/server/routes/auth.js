import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
const r = Router();
const sign = (u) => ({
  token: jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { id: u._id, name: u.name, role: u.role },
});
r.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already used' });
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role === 'seller' ? 'seller' : 'buyer' });
  res.status(201).json(sign(u));
});
r.post('/login', async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password, u.password))) return res.status(400).json({ message: 'Invalid credentials' });
  res.json(sign(u));
});
export default r;
