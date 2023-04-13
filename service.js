const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const { body, validationResult } = require('express-validator');

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
  body('personData.title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('personData.firstName').notEmpty().withMessage('First name is required'),
  body('personData.lastName').notEmpty().withMessage('Last name is required'),
  body('personData.birthDate').isDate().withMessage('Birth date must be a valid date'),
  body('personData.email').isEmail().withMessage('Email must be a valid email address'),
  body('address.postalCode').notEmpty().withMessage('Postal code is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.street').notEmpty().withMessage('Street is required'),
  body('address.houseNumber').notEmpty().withMessage('House number is required'),
  body('address.addressAddition').optional().notEmpty().withMessage('Address addition cannot be empty'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.longitude').isNumeric().withMessage('Longitude must be a number'),
  body('address.latitude').isNumeric().withMessage('Latitude must be a number'),
  body('plantDetails.unitName').notEmpty().withMessage('Unit name is required'),
  body('plantDetails.commissioningDate').isDate().withMessage('Commissioning date must be a valid date'),
  body('plantDetails.grossPower').isNumeric().withMessage('Gross power must be a number'),
  body('plantDetails.inverterLS').notEmpty().withMessage('Inverter LS is required'),
  body('plantDetails.batGrossPower').isNumeric().withMessage('BAT gross power must be a number'),
  body('plantDetails.batInverter').notEmpty().withMessage('BAT inverter is required'),
  body('plantDetails.storageCapacity').isNumeric().withMessage('Storage capacity must be a number')
];

// Mock submitUnit endpoint with validation
app.post('/submitUnit', validationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  res.status(200).json({ message: 'Unit data submitted successfully' });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.listen(port, () => {
  console.log(`Mock service listening at http://localhost:${port}`);
});
