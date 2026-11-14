const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const demoUser = {
  email: 'admin@uae-realestate.com',
  password: 'Admin123!',
  name: 'Ayman Alamin',
  role: 'Manager',
  company: 'UAE Property Group',
};

const defaultProperties = [
  { id: 1, title: 'Palm Heights Villa', type: 'Villa', location: 'Palm Jumeirah', bedrooms: 5, bathrooms: 4, price: 'AED 9.8M', status: 'Available', owner: 'Private Investor' },
  { id: 2, title: 'Marina Bay Residence', type: 'Apartment', location: 'Dubai Marina', bedrooms: 2, bathrooms: 2, price: 'AED 2.4M', status: 'Rented', owner: 'UAE Property Group' },
  { id: 3, title: 'Business Bay Office', type: 'Office', location: 'Business Bay', bedrooms: 0, bathrooms: 2, price: 'AED 4.9M', status: 'Available', owner: 'Commercial Buyer' },
  { id: 4, title: 'City Walk Studio', type: 'Studio', location: 'Jumeirah', bedrooms: 1, bathrooms: 1, price: 'AED 1.1M', status: 'Booked', owner: 'Private Buyer' },
  { id: 5, title: 'Sharjah Family House', type: 'Villa', location: 'Sharjah', bedrooms: 4, bathrooms: 3, price: 'AED 3.7M', status: 'Available', owner: 'Family Investor' },
  { id: 6, title: 'Al Barsha Townhouse', type: 'Townhouse', location: 'Al Barsha', bedrooms: 3, bathrooms: 3, price: 'AED 2.9M', status: 'Under Renovation', owner: 'Private Owner' },
];

let properties = [...defaultProperties];

const createDashboard = () => ({
  stats: [
    { key: 'listed', label: 'Properties Listed', value: `${properties.length}`, trend: '+12.4%' },
    { key: 'occupied', label: 'Occupied Units', value: '176', trend: '+8.1%' },
    { key: 'revenue', label: 'Monthly Revenue', value: 'AED 4.8M', trend: '+15.9%' },
    { key: 'commissions', label: 'Pending Commissions', value: 'AED 680K', trend: '+6.3%' },
  ],
  salesPipeline: [
    { label: 'Qualified Leads', value: 84 },
    { label: 'Site Visits', value: 36 },
    { label: 'Negotiations', value: 18 },
    { label: 'Closed Deals', value: 11 },
  ],
  recentProperties: properties.slice(0, 4).map((item) => ({
    id: item.id,
    name: item.title,
    type: item.type,
    location: item.location,
    status: item.status,
    price: item.price,
    occupancy: item.status === 'Rented' ? 'Occupied' : 'Ready to move',
  })),
});

const clients = [
  { id: 1, name: 'Ahmed Al-Mansoori', type: 'Buyer', phone: '+971 50 123 4567', email: 'ahmed@example.com', status: 'Qualified', city: 'Dubai' },
  { id: 2, name: 'Sarah Rahman', type: 'Tenant', phone: '+971 55 901 2233', email: 'sarah@example.com', status: 'Active', city: 'Abu Dhabi' },
  { id: 3, name: 'Khalid Hassan', type: 'Investor', phone: '+971 56 561 1122', email: 'khalid@example.com', status: 'Hot Lead', city: 'Sharjah' },
  { id: 4, name: 'Mina Haddad', type: 'Seller', phone: '+971 50 717 9988', email: 'mina@example.com', status: 'Negotiating', city: 'Dubai' },
];

const contracts = [
  { id: 1, property: 'Marina Bay Residence', tenant: 'Sarah Rahman', rent: 'AED 18,500/mo', dueDate: '2026-12-15', status: 'Active' },
  { id: 2, property: 'Palm Heights Villa', tenant: 'Nabil Al-Sayed', rent: 'AED 42,000/mo', dueDate: '2026-12-24', status: 'Renewal' },
  { id: 3, property: 'Business Bay Office', tenant: 'Crest Advisory', rent: 'AED 31,000/mo', dueDate: '2026-12-30', status: 'Active' },
  { id: 4, property: 'City Walk Studio', tenant: 'Yasmin Ali', rent: 'AED 11,200/mo', dueDate: '2027-01-05', status: 'Pending' },
];

const commissions = [
  { id: 1, agent: 'Rami Malek', deal: 'Palm Heights Villa', amount: 'AED 350,000', status: 'Pending' },
  { id: 2, agent: 'Noor Khan', deal: 'City Walk Studio', amount: 'AED 120,000', status: 'Approved' },
  { id: 3, agent: 'Omar Salem', deal: 'Business Bay Office', amount: 'AED 260,000', status: 'In Review' },
  { id: 4, agent: 'Sara Ibrahim', deal: 'Marina Bay Residence', amount: 'AED 90,000', status: 'Paid' },
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'UAE Real Estate Platform API' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (email.toLowerCase() !== demoUser.email.toLowerCase() || password !== demoUser.password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    token: 'demo-token-uae-real-estate',
    user: {
      name: demoUser.name,
      email: demoUser.email,
      role: demoUser.role,
      company: demoUser.company,
    },
  });
});

app.get('/api/dashboard', (req, res) => {
  res.json(createDashboard());
});

app.get('/api/properties', (req, res) => {
  res.json(properties);
});

app.post('/api/properties', (req, res) => {
  const { title, type, location, bedrooms, bathrooms, price, status, owner } = req.body || {};

  if (!title || !type || !location || !price) {
    return res.status(400).json({ message: 'Title, type, location, and price are required' });
  }

  const newProperty = {
    id: Date.now(),
    title,
    type,
    location,
    bedrooms: Number(bedrooms || 0),
    bathrooms: Number(bathrooms || 0),
    price,
    status: status || 'Available',
    owner: owner || 'Private Owner',
  };

  properties = [newProperty, ...properties];
  res.status(201).json(newProperty);
});

app.put('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const propertyIndex = properties.findIndex((item) => item.id === Number(id));

  if (propertyIndex === -1) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const current = properties[propertyIndex];
  const updated = { ...current, ...req.body, id: current.id };
  properties[propertyIndex] = updated;

  res.json(updated);
});

app.delete('/api/properties/:id', (req, res) => {
  const { id } = req.params;
  const originalLength = properties.length;
  properties = properties.filter((item) => item.id !== Number(id));

  if (properties.length === originalLength) {
    return res.status(404).json({ message: 'Property not found' });
  }

  res.status(204).send();
});

app.get('/api/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/contracts', (req, res) => {
  res.json(contracts);
});

app.get('/api/commissions', (req, res) => {
  res.json(commissions);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`UAE Real Estate Platform running at http://localhost:${PORT}`);
});
