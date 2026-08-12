// A CRUD API for managing the planting of produce on a farm.
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve Swagger UI using your openapi.json
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));


// Seed data
const SEED_PRODUCE = [
  { id: 1, name: 'Maize', quantity: 5, unit: 'bags', season: 'Rainy', planted: true},
  { id: 2, name: 'Pepper', quantity: 10, unit: 'beds', season: 'Winter', planted: true},
  { id: 3, name: 'Rice', quantity: 15, unit: 'bags', season: 'Summer', planted: false},   
  { id: 4, name: 'Tomatoes', quantity: 3, unit: 'beds', season: 'Dry', planted: false},
  { id: 5, name: 'Cassava', quantity: 8, unit: 'rows', season: 'Rainy', planted: false},
];

const produce = SEED_PRODUCE.map((item) => ({ ...item }));

function resetProduce() {
  produce.length = 0;
  produce.push(...SEED_PRODUCE.map((item) => ({ ...item })));
}

// Example route
app.get('/', (req, res) => {
  res.json({
    name: 'Farmer Produce API',
    version: '1.0',
    endpoints: ['/produce']
  });
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/*
// Get Produce
app.get('/produce', (req, res) => {
  res.json(produce);
});
*/

// Get Produce by Search
app.get('/produce', (req, res) => {
  const { planted, search } = req.query;
  let result = produce;

// Filter by planted status
  if (req.query.planted !== undefined ) {
    if (req.query.planted !== 'true' && req.query.planted !== 'false') {
      return res.status(400).json({ error: 'planted must be true or false.' });
    }

    const planted = req.query.planted === 'true';
    result = result.filter((item) => item.planted === planted);
  }

// Filter by search term
  if (req.query.search !== undefined) {
    const searchTerm = String(req.query.search).trim();
    if (searchTerm === '') {
      return res.status(400).json({ error: 'search term cannot be empty.' });
    }
    const lower = searchTerm.toLowerCase();
    result = result.filter((item) => item.name.toLowerCase().includes(lower));
  }
  res.json(result);
});

// Get Produce by ID
app.get('/produce/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = produce.find(p => p.id === id);
  if (!item) {
    return res.status(404).json({ error: `Produce ${id} not found` });
  }
  res.json(item);
});

// Create produce
app.post('/produce', (req, res) => {
  const { name, quantity, unit, season, planted } = req.body;

  if (name === undefined || name === null || String(name).trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (quantity === undefined || quantity === null || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Quantity is required and must be a positive number' });
  }

  if (unit === undefined || unit === null || String(unit).trim() === '') {
    return res.status(400).json({ error: 'Unit is required' });
  }

  if (season === undefined || season === null || String(season).trim() === '') {
    return res.status(400).json({ error: 'Season is required' });
  }

  if (planted === undefined || typeof planted !== 'boolean') {
    return res.status(400).json({ error: 'Planted is required and must be a boolean' });
  }

  const id = produce.length === 0 ? 1 : Math.max(...produce.map(p => p.id)) + 1;
  const newProduce = { id, name, quantity, unit, season, planted };
  produce.push(newProduce);

  res.status(201).json(newProduce);
});


// Put produce
app.put('/produce/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, season, planted } = req.body;

  const produceIndex = produce.findIndex((p) => p.id === parseInt(id));

  if (produceIndex === -1) {
    return res.status(404).json({ error: 'Produce item not found' });
  }

  if (name === undefined || name === null || String(name).trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (quantity === undefined || quantity === null || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Quantity is required and must be a positive number' });
  }

  if (unit === undefined || unit === null || String(unit).trim() === '') {
    return res.status(400).json({ error: 'Unit is required' });
  }

  if (season === undefined || season === null || String(season).trim() === '') {
    return res.status(400).json({ error: 'Season is required' });
  }

  if (planted === undefined || typeof planted !== 'boolean') {
    return res.status(400).json({ error: 'Planted is required and must be a boolean' });
  }

  produce[produceIndex] = { ...produce[produceIndex], name, quantity, unit, season, planted };
  res.json(produce[produceIndex]);
});

// DELETE /produce/:id
app.delete('/produce/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = produce.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Produce ${id} not found` });
  }
  produce.splice(index, 1);
  res.status(204).send('Produce item deleted successfully');
});

// Stats
app.get('/stats', (req, res) => {
  const planted = produce.filter(p => p.planted).length;
  res.json({
    total: produce.length,
    planted,
    notPlanted: produce.length - planted
  });
});

// Reset
app.post('/reset', (req, res) => {
  resetProduce();
  res.json(produce);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api-docs`);
});
