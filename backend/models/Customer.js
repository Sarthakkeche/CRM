const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String 
    },
    company: { 
        type: String 
    },
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', // Creates a relationship to the User model
        required: true
    },
});

module.exports = mongoose.model('customer', CustomerSchema);