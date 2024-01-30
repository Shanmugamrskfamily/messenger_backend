const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { authenticateJWT } = require('./config/middleware');
const authRouter = require('./routes/authRoutes');
const userRouter=require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRouter);
app.use('/user',authenticateJWT,userRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
