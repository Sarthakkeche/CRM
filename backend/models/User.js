const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    passwordHash: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'User', // Default role is 'User'
        enum: ['User', 'Admin'] // Possible roles
    },
});

module.exports = mongoose.model('user', UserSchema);