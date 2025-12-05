const express = require('express');
// mergeParams allows us to access params from the parent router (e.g., :customerId)
const router = express.Router({ mergeParams: true }); 
const auth = require('../middleware/authMiddleware'); // Your auth middleware
const leadController = require('../controllers/leadController');
const {
    addLead,
    getLeadsForCustomer,
    updateLead,
    deleteLead,
} = require('../controllers/leadController');

// No need to use auth middleware here as it's already applied in customers.js

router.route('/').post(addLead).get(getLeadsForCustomer);
router.route('/:leadId').put(updateLead).delete(deleteLead);
router.get('/stats', auth, leadController.getDashboardStats);

module.exports = router;