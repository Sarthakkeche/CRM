// backend/routes/analytics.js
const express = require('express');
const router = express.Router();

// Import your models
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

// GET /api/analytics
// No 'auth' middleware here -> Data will definitely show for the demo
router.get('/', async (req, res) => {
  try {
    console.log("Analytics route hit! Fetching data...");

    // 1. Fetch ALL counts (No user filter)
    const totalLeads = await Lead.countDocuments();
    const opportunities = await Lead.countDocuments({ status: 'Converted' });
    const lost = await Lead.countDocuments({ status: 'Lost' });
    const totalCustomers = await Customer.countDocuments();

    // 2. Calculate Revenue (Sum of 'value' for Converted leads)
    const revenueAgg = await Lead.aggregate([
      { $match: { status: 'Converted' } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);
    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 3. Log results to server console so you can SEE it working
    console.log("Stats found:", { totalLeads, opportunities, revenue });

    res.json({
      totalLeads,
      opportunities,
      lost,
      totalCustomers,
      revenue
    });

  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router;