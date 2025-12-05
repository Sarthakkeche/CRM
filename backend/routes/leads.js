const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/authMiddleware');
const {
    addLead,
    getLeadsForCustomer,
    updateLead,
    getDashboardStats, // Make sure this is imported
    deleteLead,
} = require('../controllers/leadController');

// 1. STATS ROUTE (Must be first!)
// This matches: GET /api/leads/stats
router.get('/stats', auth, getDashboardStats);

// 2. General Lead Routes
// This matches: POST /api/leads/ or /api/customers/:id/leads/
router.route('/')
    .post(auth, addLead)
    .get(auth, getLeadsForCustomer);

// 3. Specific ID Routes (Must be last!)
// This matches: PUT /api/leads/:leadId
router.route('/:leadId')
    .put(auth, updateLead)
    .delete(auth, deleteLead);

module.exports = router;