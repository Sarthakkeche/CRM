const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

// @desc    Add a lead for a specific customer
exports.addLead = async (req, res) => {
    const { title, description, status, value } = req.body;
    try {
        const customer = await Customer.findById(req.params.customerId);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Customer not found' });
        }
        const newLead = new Lead({
            customerId: req.params.customerId,
            title,
            description,
            status,
            value,
        });
        const lead = await newLead.save();
        res.json(lead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all leads for a customer
exports.getLeadsForCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.customerId);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Customer not found' });
        }
        const leads = await Lead.find({ customerId: req.params.customerId });
        res.json(leads);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a lead
exports.updateLead = async (req, res) => {
    try {
        let lead = await Lead.findById(req.params.leadId);
        if (!lead) {
            return res.status(404).json({ msg: 'Lead not found' });
        }
        // Verify user owns the parent customer
        const customer = await Customer.findById(lead.customerId);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        lead = await Lead.findByIdAndUpdate(req.params.leadId, { $set: req.body }, { new: true });
        res.json(lead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a lead
exports.deleteLead = async (req, res) => {
    try {
        let lead = await Lead.findById(req.params.leadId);
        if (!lead) {
            return res.status(404).json({ msg: 'Lead not found' });
        }
        // Verify user owns the parent customer
        const customer = await Customer.findById(lead.customerId);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await Lead.findByIdAndRemove(req.params.leadId);
        res.json({ msg: 'Lead removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // ANALYTICS STRATEGY: 
    // We are removing the "{ user: req.user.id }" filter for the Demo.
    // This ensures ALL data in the database appears on your dashboard.

    // 1. Get Customer Counts
    const totalCustomers = await Customer.countDocuments();

    // 2. Get Lead Metrics using Aggregation (Data Analyst Style)
    const leadStats = await Lead.aggregate([
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 }, // Count all leads
          // Count specific statuses using $cond (Condition)
          converted: { 
            $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] } 
          },
          lost: { 
            $sum: { $cond: [{ $eq: ["$status", "Lost"] }, 1, 0] } 
          },
          // Calculate Total Revenue from "Converted" leads
          revenue: { 
            $sum: { 
              $cond: [
                { $eq: ["$status", "Converted"] }, 
                { $ifNull: ["$value", 0] }, // Add value, default to 0 if missing
                0 
              ] 
            } 
          }
        }
      }
    ]);

    // 3. Process the Aggregation Result
    // If no leads exist, defaults to 0
    const stats = leadStats[0] || { totalLeads: 0, converted: 0, lost: 0, revenue: 0 };

    // 4. Send the Intelligence Report
    res.json({
      totalLeads: stats.totalLeads,
      opportunities: stats.converted, // Mapping "Converted" to "Opportunities" for UI
      lost: stats.lost,
      totalCustomers: totalCustomers,
      revenue: stats.revenue
    });

  } catch (err) {
    console.error("Analytics Error:", err.message);
    res.status(500).send('Server Error');
  }
};