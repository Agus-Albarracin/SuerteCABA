const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment-timezone');

const MyMovementsSchema = new Schema({
    
  date: {
    type: String,
    index: true // Índice para búsquedas por fecha
  },

  monto: {
    type: Number,
    required: true
  },

})

const MyMovements = mongoose.model('MyMovements', MyMovementsSchema, 'MyMovements');

module.exports = MyMovements;