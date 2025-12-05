require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// 1. Connect Database
connectDB();

// 2. Middleware
app.use(cors()); // Critical: Allows Frontend (5173) to talk to Backend (5000)
app.use(express.json());

// 3. Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/leads', require('./routes/leads')); // This handles /stats too

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));