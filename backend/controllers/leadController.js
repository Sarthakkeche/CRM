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
    // 1. Total Leads (All leads in the system)
    const totalLeads = await Lead.countDocuments({ user: req.user.id });

    // 2. Opportunities (Leads that are officially 'Converted')
    // FIX: We specifically look for status 'Converted' now
    const opportunities = await Lead.countDocuments({ 
      user: req.user.id, 
      status: 'Converted' 
    });

    // 3. Customers (People in the Customers table)
    const totalCustomers = await Customer.countDocuments({ user: req.user.id });

    // 4. Lost Leads (For the charts)
    const lost = await Lead.countDocuments({ user: req.user.id, status: 'Lost' });

    // 5. Total Value (Sum of money from Converted leads)
    // This is a powerful aggregation for analytics
    const valueStats = await Lead.aggregate([
      { $match: { user: req.user._id, status: 'Converted' } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);
    const revenue = valueStats.length > 0 ? valueStats[0].total : 0;

    res.json({
      totalLeads,
      opportunities,
      totalCustomers,
      lost,
      revenue
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};