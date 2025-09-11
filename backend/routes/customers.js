const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
    addCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} = require('../controllers/customerController');
const leadRoutes = require('./leads');

// All these routes are protected
router.use(auth);

router.route('/').post(addCustomer).get(getCustomers); // [cite: 19, 20]
router.route('/:id').get(getCustomerById).put(updateCustomer).delete(deleteCustomer); // [cite: 21, 22, 23]

// Nested routes for leads under a specific customer
router.use('/:customerId/leads', leadRoutes); // 

module.exports = router;