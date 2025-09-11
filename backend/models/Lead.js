const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    customerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'customer', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['New', 'Contacted', 'Converted', 'Lost'], 
        default: 'New' 
    },
    value: { 
        type: Number 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

module.exports = mongoose.model('lead', LeadSchema);