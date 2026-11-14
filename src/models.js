const mongoose = require('mongoose');

const options = { timestamps: true, versionKey: false };

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'manager', 'agent', 'landlord', 'tenant', 'client'], default: 'agent' },
  company: { type: String, trim: true, default: '' },
  active: { type: Boolean, default: true },
}, options);

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  bedrooms: { type: Number, min: 0, default: 0 },
  bathrooms: { type: Number, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'AED', enum: ['AED'] },
  purpose: { type: String, enum: ['sale', 'rent'], default: 'sale' },
  status: { type: String, enum: ['Available', 'Rented', 'Booked', 'Under Renovation', 'Sold'], default: 'Available' },
  owner: { type: String, trim: true, default: 'Private Owner' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, options);

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Buyer', 'Seller', 'Tenant', 'Landlord', 'Investor', 'Other'], default: 'Other' },
  phone: { type: String, trim: true, default: '' },
  email: { type: String, lowercase: true, trim: true, default: '' },
  city: { type: String, trim: true, default: '' },
  status: { type: String, trim: true, default: 'New' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, options);

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  rent: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Current', 'Pending', 'Review', 'Former'], default: 'Current' },
  dueDate: { type: Date },
  email: { type: String, lowercase: true, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
}, options);

const contractSchema = new mongoose.Schema({
  property: { type: String, required: true, trim: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  tenant: { type: String, required: true, trim: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  rent: { type: Number, required: true, min: 0 },
  startDate: { type: Date },
  dueDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['Active', 'Renewal', 'Pending', 'Expired', 'Terminated'], default: 'Pending' },
}, options);

const commissionSchema = new mongoose.Schema({
  agent: { type: String, required: true, trim: true },
  deal: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'In Review', 'Paid'], default: 'Pending' },
  paidAt: { type: Date },
}, options);

module.exports = {
  User: mongoose.model('User', userSchema),
  Property: mongoose.model('Property', propertySchema),
  Client: mongoose.model('Client', clientSchema),
  Tenant: mongoose.model('Tenant', tenantSchema),
  Contract: mongoose.model('Contract', contractSchema),
  Commission: mongoose.model('Commission', commissionSchema),
};
