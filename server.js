require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Property, Client, Tenant, Contract, Commission } = require('./src/models');
const { requireAuth, allowRoles } = require('./src/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const staffRoles = ['admin', 'manager', 'agent'];
const collectionModels = { properties: Property, clients: Client, tenants: Tenant, contracts: Contract, commissions: Commission };

app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false }));

function serialize(record) {
  const item = record.toObject ? record.toObject() : record;
  if (item.price !== undefined) item.price = `AED ${Number(item.price).toLocaleString('en-AE')}`;
  if (item.rent !== undefined) item.rent = `AED ${Number(item.rent).toLocaleString('en-AE')}`;
  if (item.amount !== undefined) item.amount = `AED ${Number(item.amount).toLocaleString('en-AE')}`;
  if (item.dueDate) item.dueDate = new Date(item.dueDate).toISOString().slice(0, 10);
  return item;
}

function parseAmount(value) {
  if (typeof value === 'number') return value;
  const parsed = Number(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : NaN;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company } });
  } catch (error) { next(error); }
});

app.use('/api', requireAuth);

app.get('/api/dashboard', allowRoles(...staffRoles), async (req, res, next) => {
  try {
    const [listed, occupied, activeContracts, pendingCommissions, recentProperties] = await Promise.all([
      Property.countDocuments(), Tenant.countDocuments({ status: 'Current' }), Contract.countDocuments({ status: 'Active' }),
      Commission.aggregate([{ $match: { status: { $in: ['Pending', 'In Review'] } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Property.find().sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({ stats: [
      { key: 'listed', value: String(listed), trend: '' },
      { key: 'occupied', value: String(occupied), trend: '' },
      { key: 'revenue', value: 'AED 0', trend: '' },
      { key: 'commissions', value: `AED ${Number(pendingCommissions[0]?.total || 0).toLocaleString('en-AE')}`, trend: '' },
    ], activeContracts, salesPipeline: [], recentProperties: recentProperties.map((p) => ({ id: p.id, name: p.title, location: p.location, status: p.status, price: `AED ${Number(p.price).toLocaleString('en-AE')}` })) });
  } catch (error) { next(error); }
});

for (const [resource, Model] of Object.entries(collectionModels)) {
  const route = `/api/${resource}`;
  app.get(route, allowRoles(...staffRoles), async (req, res, next) => {
    try {
      const records = await Model.find().sort({ createdAt: -1 }).limit(500);
      res.json(records.map(serialize));
    } catch (error) { next(error); }
  });
  app.post(route, allowRoles('admin', 'manager', 'agent'), async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (resource === 'properties') body.price = parseAmount(body.price);
      if (resource === 'tenants' || resource === 'contracts') body.rent = parseAmount(body.rent);
      if (resource === 'commissions') body.amount = parseAmount(body.amount);
      if (resource === 'properties') body.createdBy = req.user.id;
      const record = await Model.create(body);
      res.status(201).json(serialize(record));
    } catch (error) { next(error); }
  });
  app.put(`${route}/:id`, allowRoles('admin', 'manager', 'agent'), async (req, res, next) => {
    try {
      const body = { ...req.body };
      if (resource === 'properties' && body.price !== undefined) body.price = parseAmount(body.price);
      if ((resource === 'tenants' || resource === 'contracts') && body.rent !== undefined) body.rent = parseAmount(body.rent);
      if (resource === 'commissions' && body.amount !== undefined) body.amount = parseAmount(body.amount);
      const record = await Model.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
      if (!record) return res.status(404).json({ message: 'Record not found' });
      res.json(serialize(record));
    } catch (error) { next(error); }
  });
  app.delete(`${route}/:id`, allowRoles('admin', 'manager'), async (req, res, next) => {
    try {
      const record = await Model.findByIdAndDelete(req.params.id);
      if (!record) return res.status(404).json({ message: 'Record not found' });
      res.status(204).end();
    } catch (error) { next(error); }
  });
}

app.get('/api/users', allowRoles('admin'), async (req, res, next) => {
  try { res.json(await User.find().select('name email role company active createdAt').sort({ createdAt: -1 })); }
  catch (error) { next(error); }
});
app.post('/api/users', allowRoles('admin'), async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body || {};
    if (!name || !email || !password || String(password).length < 12) return res.status(400).json({ message: 'Name, email, and a password of at least 12 characters are required' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash, role, company });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, company: user.company });
  } catch (error) { next(error); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.name === 'ValidationError' || error.name === 'CastError') return res.status(400).json({ message: 'Invalid request data' });
  if (error.code === 11000) return res.status(409).json({ message: 'A record with that email already exists' });
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure it.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
  await mongoose.connect(process.env.MONGODB_URI);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminPassword.length >= 12 && !(await User.exists({ email: adminEmail }))) {
    await User.create({ name: process.env.ADMIN_NAME || 'Platform Admin', email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: 'admin' });
    console.log(`Initial admin created: ${adminEmail}`);
  }
  app.listen(PORT, () => console.log(`UAE Real Estate Platform running on http://localhost:${PORT}`));
}

start().catch((error) => { console.error(error.message); process.exit(1); });
