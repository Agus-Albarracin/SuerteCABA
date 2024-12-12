const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment-timezone');

const FinanzasSchema = new mongoose.Schema({
  fecha: {
    type: String,
    default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
  },
  monto: {
    type: Number,
    required: true, 
  },
  tipo: {
    type: String,
    required: true,
    enum: ['retiro', 'deposito'],
  },
  supervisor: { 
    type: String, 
    ref: 'User', 
    required: false 
  },
  usuariosCreados: [{
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User' },
    rol: { type: String}
  }],
});
module.exports = mongoose.model('Finanzas', FinanzasSchema);