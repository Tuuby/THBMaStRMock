const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();

const openapiDocument = YAML.load(path.join(__dirname, 'MaStRSubmitUnitMock.yaml'));

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON request body
app.use(express.json());

// Validation rules
const validationRules = [
  body('user.username').notEmpty().withMessage('Username is required'),
  body('user.password').notEmpty().withMessage('Password is required'),
  body('personData.salutation').notEmpty().withMessage('Salutation is required'),
  body('personData.title').optional(),
  body('personData.firstName').notEmpty().withMessage('First name is required'),
  body('personData.lastName').notEmpty().withMessage('Last name is required'),
  body('personData.birthDate').isDate().withMessage('Birth date must be a valid date'),
  body('personData.email').isEmail().withMessage('Email must be a valid email address'),
  body('address.postalCode').notEmpty().withMessage('Postal code is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.houseNumber').notEmpty().withMessage('House number is required'),
  body('address.addressAddition').optional(),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.longitude').isNumeric().withMessage('Longitude must be a number'),
  body('address.latitude').isNumeric().withMessage('Latitude must be a number'),
  body('plantDetails.unitName').notEmpty().withMessage('Unit name is required'),
  body('plantDetails.commissioningDate').isDate().withMessage('Commissioning date must be a valid date'),
  body('plantDetails.grossPower').isNumeric().withMessage('Gross power must be a number'),
  body('plantDetails.inverterLS').notEmpty().withMessage('Inverter LS is required'),
  body('plantDetails.inverterPower').isNumeric().withMessage('Inverter Power is required'),
  body('plantDetails.batGrossPower').optional().isNumeric().withMessage('BAT gross power must be a number'),
  body('plantDetails.batInverter').optional().notEmpty().withMessage('BAT inverter is required'),
  body('plantDetails.batInverterPower').optional().isNumeric().withMessage('BAT inverter power is required'),
  body('plantDetails.storageCapacity').optional().isNumeric().withMessage('Storage capacity must be a number')
];

// SQLite database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      salutation TEXT NOT NULL,
      title TEXT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      birthDate DATE NOT NULL,
      email TEXT NOT NULL,
      postalCode TEXT NOT NULL,
      city TEXT NOT NULL,
      street TEXT NOT NULL,
      houseNumber TEXT NOT NULL,
      addressAddition TEXT,
      country TEXT NOT NULL,
      state TEXT NOT NULL,
      longitude REAL NOT NULL,
      latitude REAL NOT NULL,
      unitName TEXT NOT NULL,
      commissioningDate DATE NOT NULL,
      grossPower REAL NOT NULL,
      inverterLS TEXT NOT NULL,
      inverterPower REAL NOT NULL,
      batGrossPower REAL,
      batInverter TEXT,
      batInverterPower REAL,
      storageCapacity REAL
    )
  `);
});

// Mock submitUnit endpoint with validation and database storage
app.post('/submitUnit', validationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const unitData = req.body;

  // Insert unit data into the "units" table
  db.run(
    `INSERT INTO units (username, password, salutation, title, firstName, lastName, birthDate, email,
      postalCode, city, street, houseNumber, addressAddition, country, state, longitude, latitude,
      unitName, commissioningDate, grossPower, inverterLS, inverterPower, batGrossPower, batInverter,
      batInverterPower, storageCapacity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      unitData.user.username,
      unitData.user.password,
      unitData.personData.salutation,
      unitData.personData.title || null,
      unitData.personData.firstName,
      unitData.personData.lastName,
      unitData.personData.birthDate,
      unitData.personData.email,
      unitData.address.postalCode,
      unitData.address.city,
      unitData.address.street,
      unitData.address.houseNumber,
      unitData.address.addressAddition || null,
      unitData.address.country,
      unitData.address.state,
      unitData.address.longitude,
      unitData.address.latitude,
      unitData.plantDetails.unitName,
      unitData.plantDetails.commissioningDate,
      unitData.plantDetails.grossPower,
      unitData.plantDetails.inverterLS,
      unitData.plantDetails.inverterPower,
      unitData.plantDetails.batGrossPower || null,
      unitData.plantDetails.batInverter || null,
      unitData.plantDetails.batInverterPower || null,
      unitData.plantDetails.storageCapacity || null
    ],
    function (err) {
      if (err) {      
        console.error('Failed to insert unit data into the database:', err);
        return res.status(500).json({ error: 'Failed to store unit data' });
      }

      const unitId = this.lastID;
      res.status(200).json({ message: 'Unit data submitted successfully', unitId });
    });
});

// Retrieve all units
app.get('/units', (req, res) => {
  db.all('SELECT * FROM units', (err, rows) => {
    if (err) {
      console.error('Failed to retrieve units from the database:', err);
      return res.status(500).json({ error: 'Failed to retrieve units' });
    }

    res.status(200).json(rows);
  });
});

// Retrieve a single unit by ID
app.get('/units/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM units WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Failed to retrieve the unit from the database:', err);
      return res.status(500).json({ error: 'Failed to retrieve the unit' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Unit not found '});
    }

    res.status(200).json(row);
  });
});

app.put('/units/:id', validationRules, (req, res) => {
  const { id } = req.params;
  const unitData = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.run(
    `UPDATE units
    SET
      username = ?,
      password = ?,
      salutation = ?,
      title = ?,
      firstName = ?,
      lastName = ?,
      birthDate = ?,
      email = ?,
      postalCode = ?,
      city = ?,
      street = ?,
      houseNumber = ?,
      addressAddition = ?,
      country = ?,
      state = ?,
      longitude = ?,
      latitude = ?,
      unitName = ?,
      commissioningDate = ?,
      grossPower = ?,
      inverterLS = ?,
      inverterPower = ?,
      batGrossPower = ?,
      batInverter = ?,
      batInverterPower = ?,
      storageCapacity = ?
    WHERE id = ?
    `,
  [
    unitData.user.username,
    unitData.user.password,
    unitData.personData.salutation,
    unitData.personData.title || null,
    unitData.personData.firstName,
    unitData.personData.lastName,
    unitData.personData.birthDate,
    unitData.personData.email,
    unitData.address.postalCode,
    unitData.address.city,
    unitData.address.street,
    unitData.address.houseNumber,
    unitData.address.addressAddition || null,
    unitData.address.country,
    unitData.address.state,
    unitData.address.longitude,
    unitData.address.latitude,
    unitData.plantDetails.unitName,
    unitData.plantDetails.commissioningDate,
    unitData.plantDetails.grossPower,
    unitData.plantDetails.inverterLS,
    unitData.plantDetails.inverterPower,
    unitData.plantDetails.batGrossPower || null,
    unitData.plantDetails.batInverter || null,
    unitData.plantDetails.batInverterPower || null,
    unitData.plantDetails.storageCapacity || null,
    id
  ], function(err) {
    if (err) {
      console.error('Failed to update the unit in the database:', err);
      return res.status(500).json({ error: 'Failed to update the unit'});
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.status(200).json({ message: 'Unit updated successfully' });
  });
});

app.delete('/units/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM units WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Failed to delete the unit from the database:', err);
      return res.status(500).json({ error: 'Failed to delete the unit' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.status(200).json({ message: 'Unit deleted successfully' });
  })
})

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.listen(port, () => {
  console.log(`Mock service listening at http://localhost:${port}`);
});
