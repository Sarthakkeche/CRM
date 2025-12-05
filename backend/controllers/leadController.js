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
    return res.json(lead);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
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
    return res.json(leads);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

// @desc    Update a lead
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // verify user owns the parent customer
    const customer = await Customer.findById(lead.customerId);
    if (!customer || customer.ownerId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    lead = await Lead.findByIdAndUpdate(
      req.params.leadId,
      { $set: req.body },
      { new: true }
    );

    return res.json(lead);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

// @desc    Delete a lead
exports.deleteLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.leadId);
    if (!lead) {
      return res.status(404).json({ msg: 'Lead not found' });
    }

    // verify user owns the parent customer
    const customer = await Customer.findById(lead.customerId);
    if (!customer || customer.ownerId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Lead.findByIdAndRemove(req.params.leadId);
    return res.json({ msg: 'Lead removed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
};

// @desc    Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({ ownerId: req.user.id });

    const leads = await Lead.find({}).populate('customerId');
    const userLeads = leads.filter(l => l.customerId?.ownerId?.toString() === req.user.id);

    const totalLeads = userLeads.length;
    let converted = 0;
    let lost = 0;
    let revenue = 0;

    userLeads.forEach(l => {
      if (l.status === 'Converted') converted++;
      else if (l.status === 'Lost') lost++;
      revenue += Number(l.value || 0);
    });

    return res.json({
      totalLeads,
      opportunities: converted,
      lost,
      totalCustomers,
      revenue
    });
  } catch (err) {
    console.error('Dashboard Stats Error:', err);
    return res.status(500).send('Server Error');
  }
};
