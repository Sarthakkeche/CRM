const express = require('express');
// mergeParams allows us to access params from the parent router (e.g., :customerId)
const router = express.Router({ mergeParams: true }); 
const {
    addLead,
    getLeadsForCustomer,
    updateLead,
    deleteLead,
} = require('../controllers/leadController');

// No need to use auth middleware here as it's already applied in customers.js

router.route('/').post(addLead).get(getLeadsForCustomer);
router.route('/:leadId').put(updateLead).delete(deleteLead);

module.exports = router;