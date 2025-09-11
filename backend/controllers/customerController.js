const Customer = require('../models/Customer');
const Lead = require('../models/Lead');

// @desc    Add new customer [cite: 19]
exports.addCustomer = async (req, res) => {
    const { name, email, phone, company } = req.body;
    try {
        const newCustomer = new Customer({
            name,
            email,
            phone,
            company,
            ownerId: req.user.id,
        });
        const customer = await newCustomer.save();
        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    List customers with pagination and search [cite: 20]
exports.getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchQuery = req.query.search || '';

        const query = {
            ownerId: req.user.id,
            $or: [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
            ],
        };

        const customers = await Customer.find(query)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await Customer.countDocuments(query);

        res.json({
            customers,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    View single customer details including leads [cite: 21]
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Customer not found' });
        }
        const leads = await Lead.find({ customerId: req.params.id });
        res.json({ customer, leads });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update customer details [cite: 22]
exports.updateCustomer = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Customer not found' });
        }
        customer = await Customer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a customer [cite: 23]
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer || customer.ownerId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Customer not found' });
        }
        // Also delete associated leads
        await Lead.deleteMany({ customerId: req.params.id });
        await Customer.findByIdAndRemove(req.params.id);
        res.json({ msg: 'Customer and associated leads removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};