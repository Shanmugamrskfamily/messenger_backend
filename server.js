const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { authenticateJWT } = require('./config/middleware');
const routes = require('./routes/routes');
const userController = require('./controllers/userController');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

const corsOptions = {
  origin: ['http://localhost:4050', 'http://localhost:5000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', routes({ port: process.env.PORT || 5000 }));

app.use('/user',authenticateJWT,userController,routes({ port: process.env.PORT || 5000 }));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
