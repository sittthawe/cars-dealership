require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI || 'mongodb://mongodb:27017/dealership';

app.use(cors());
app.use(express.json());

const dealerSchema = new mongoose.Schema(
  {
    dealer_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true }
  },
  { versionKey: false }
);

const reviewSchema = new mongoose.Schema(
  {
    dealer_id: { type: Number, required: true },
    name: { type: String, required: true },
    review: { type: String, required: true },
    purchase_date: { type: String, default: '' },
    car_make: { type: String, default: '' },
    car_model: { type: String, default: '' },
    car_year: { type: String, default: '' },
    sentiment: { type: String, default: 'neutral' },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const carSchema = new mongoose.Schema(
  {
    car_id: { type: Number, required: true, unique: true },
    dealer_id: { type: Number, required: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    body_type: { type: String, required: true },
    price_usd: { type: Number, required: true },
    mileage: { type: Number, required: true },
    color: { type: String, required: true },
    transmission: { type: String, required: true },
    fuel_type: { type: String, required: true }
  },
  { versionKey: false }
);

const Dealer = mongoose.model('Dealer', dealerSchema);
const Review = mongoose.model('Review', reviewSchema);
const Car = mongoose.model('Car', carSchema);

async function seedDealers() {
  const count = await Dealer.countDocuments();
  if (count > 0) {
    return;
  }

  await Dealer.insertMany([
    {
      dealer_id: 1,
      name: 'Empire Auto NYC',
      state: 'NY',
      city: 'New York',
      address: '100 5th Ave',
      phone: '212-555-0101'
    },
    {
      dealer_id: 2,
      name: 'Golden Gate Cars',
      state: 'CA',
      city: 'San Francisco',
      address: '200 Market St',
      phone: '415-555-0102'
    },
    {
      dealer_id: 3,
      name: 'Lone Star Motors',
      state: 'TX',
      city: 'Dallas',
      address: '300 Elm St',
      phone: '972-555-0103'
    },
    {
      dealer_id: 4,
      name: 'Sunshine Autos',
      state: 'FL',
      city: 'Miami',
      address: '400 Ocean Dr',
      phone: '305-555-0104'
    },
    {
      dealer_id: 5,
      name: 'Great Lakes Auto Hub',
      state: 'IL',
      city: 'Chicago',
      address: '500 Lake Shore Dr',
      phone: '312-555-0105'
    }
  ]);
}

async function seedCars() {
  const count = await Car.countDocuments();
  if (count > 0) {
    return;
  }

  await Car.insertMany([
    {
      car_id: 101,
      dealer_id: 1,
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      body_type: 'Sedan',
      price_usd: 27999,
      mileage: 12100,
      color: 'Silver',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 102,
      dealer_id: 1,
      make: 'Honda',
      model: 'CR-V',
      year: 2022,
      body_type: 'SUV',
      price_usd: 30400,
      mileage: 9800,
      color: 'Blue',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 103,
      dealer_id: 2,
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      body_type: 'Sedan',
      price_usd: 39990,
      mileage: 4200,
      color: 'White',
      transmission: 'Automatic',
      fuel_type: 'Electric'
    },
    {
      car_id: 104,
      dealer_id: 2,
      make: 'Ford',
      model: 'Mustang',
      year: 2021,
      body_type: 'Coupe',
      price_usd: 36500,
      mileage: 17600,
      color: 'Red',
      transmission: 'Manual',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 105,
      dealer_id: 3,
      make: 'Chevrolet',
      model: 'Silverado 1500',
      year: 2022,
      body_type: 'Truck',
      price_usd: 42900,
      mileage: 20100,
      color: 'Black',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 106,
      dealer_id: 3,
      make: 'Hyundai',
      model: 'Elantra',
      year: 2023,
      body_type: 'Sedan',
      price_usd: 23150,
      mileage: 7600,
      color: 'Gray',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 107,
      dealer_id: 4,
      make: 'BMW',
      model: 'X3',
      year: 2022,
      body_type: 'SUV',
      price_usd: 47500,
      mileage: 13200,
      color: 'White',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 108,
      dealer_id: 4,
      make: 'Kia',
      model: 'Sorento',
      year: 2021,
      body_type: 'SUV',
      price_usd: 29950,
      mileage: 22500,
      color: 'Green',
      transmission: 'Automatic',
      fuel_type: 'Hybrid'
    },
    {
      car_id: 109,
      dealer_id: 5,
      make: 'Nissan',
      model: 'Altima',
      year: 2020,
      body_type: 'Sedan',
      price_usd: 19800,
      mileage: 33100,
      color: 'Black',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    },
    {
      car_id: 110,
      dealer_id: 5,
      make: 'Jeep',
      model: 'Wrangler',
      year: 2023,
      body_type: 'SUV',
      price_usd: 41250,
      mileage: 8900,
      color: 'Orange',
      transmission: 'Automatic',
      fuel_type: 'Gasoline'
    }
  ]);
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/cars', async (req, res) => {
  const dealerId = req.query.dealer_id ? Number(req.query.dealer_id) : null;
  const make = req.query.make ? String(req.query.make).trim() : null;

  const filter = {};
  if (dealerId) {
    filter.dealer_id = dealerId;
  }
  if (make) {
    filter.make = new RegExp(`^${make}$`, 'i');
  }

  const cars = await Car.find(filter).sort({ year: -1, make: 1, model: 1 }).lean();
  res.json({ cars });
});

app.get('/dealers', async (req, res) => {
  const state = req.query.state;
  const filter = state ? { state: state.toUpperCase() } : {};
  const dealers = await Dealer.find(filter).sort({ state: 1, city: 1, dealer_id: 1 }).lean();
  res.json({ dealers });
});

app.get('/dealers/:dealerId', async (req, res) => {
  const dealerId = Number(req.params.dealerId);
  const dealer = await Dealer.findOne({ dealer_id: dealerId }).lean();
  if (!dealer) {
    return res.status(404).json({ error: 'dealer not found' });
  }
  return res.json({ dealer });
});

app.get('/dealers/:dealerId/reviews', async (req, res) => {
  const dealerId = Number(req.params.dealerId);
  const reviews = await Review.find({ dealer_id: dealerId }).sort({ created_at: -1 }).lean();
  res.json({ reviews });
});

app.post('/reviews', async (req, res) => {
  const payload = req.body || {};
  const dealerId = Number(payload.dealer_id);

  if (!dealerId || !payload.review || !payload.name) {
    return res.status(400).json({ error: 'dealer_id, name and review are required' });
  }

  const exists = await Dealer.exists({ dealer_id: dealerId });
  if (!exists) {
    return res.status(404).json({ error: 'dealer not found' });
  }

  const review = await Review.create({
    dealer_id: dealerId,
    name: payload.name,
    review: payload.review,
    purchase_date: payload.purchase_date || '',
    car_make: payload.car_make || '',
    car_model: payload.car_model || '',
    car_year: payload.car_year || '',
    sentiment: payload.sentiment || 'neutral'
  });

  return res.status(201).json({ review });
});

async function start() {
  try {
    await mongoose.connect(mongoUri);
    await seedDealers();
    await seedCars();
    app.listen(port, () => {
      console.log(`node-api listening on ${port}`);
    });
  } catch (error) {
    console.error('Failed to start node-api:', error);
    process.exit(1);
  }
}

start();
