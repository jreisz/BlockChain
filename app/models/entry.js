const crypto = require("crypto");
const format = require('biguint-format');
const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    prev_hash: { type: String, required: true },
    hash: { type: String, required: true },
    message: { type: String, required: true },
    nonce: { type: String, required: true },
    createdAt: mongoose.Decimal128  ,
    updatedAt: mongoose.Decimal128 
}, {
    timestamps: { currentTime: () => format(crypto.randomBytes(10), 'dec') }    
});

module.exports = mongoose.model('entry', EntrySchema);