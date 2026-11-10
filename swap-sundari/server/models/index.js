import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const id = (ref) => ({ type: Schema.Types.ObjectId, ref });

export const User = model('User', new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  address: String,
  wishlist: [id('Product')],
  ratingAvg: { type: Number, default: 0 },
}, { timestamps: true }));

const productSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  category: String, brand: String, size: String, condition: String,
  images: [String],
  luxury: { type: Boolean, default: false },
  authenticity: { type: String, enum: ['n/a', 'pending', 'verified', 'rejected'], default: 'n/a' },
  listingType: { type: String, enum: ['thrift', 'rent', 'both'], required: true },
  price: Number, rentPerDay: Number, deposit: { type: Number, default: 0 },
  owner: id('User'),
  status: { type: String, enum: ['draft', 'pending', 'published', 'sold'], default: 'published' },
}, { timestamps: true });
productSchema.index({ title: 'text', brand: 'text', description: 'text' });
export const Product = model('Product', productSchema);

export const Order = model('Order', new Schema({
  buyer: id('User'), product: id('Product'),
  type: { type: String, enum: ['buy', 'rent'] },
  rentalPeriod: { start: Date, end: Date },
  status: { type: String, enum: ['requested', 'confirmed', 'shipped', 'returned', 'completed', 'cancelled', 'late'], default: 'requested' },
  total: Number, deposit: { type: Number, default: 0 }, lateFee: { type: Number, default: 0 },
}, { timestamps: true }));

export const Review = model('Review', new Schema({
  order: id('Order'), reviewer: id('User'), reviewee: id('User'), product: id('Product'),
  rating: { type: Number, min: 1, max: 5 }, comment: String,
}, { timestamps: true }));
