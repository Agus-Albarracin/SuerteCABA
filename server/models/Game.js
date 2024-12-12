const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
});

module.exports = mongoose.model('Game', GameSchema);