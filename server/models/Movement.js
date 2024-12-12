const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment-timezone');

const MovementSchema = new Schema({
  type: {
    type: String,
    enum: ['deposito', 'retiro'],
    required: true,
    index: true // Índice para búsquedas por tipo
  },

  date: {
    type: String,
    index: true // Índice para búsquedas por fecha
  },

  monto: {
    type: Number,
    required: true
  },
  bonificacion: {
    type: String,
    required: false,
  },
  rolResponsable: {
    type: String,
    required: false,
  },
  rolReceptor: {
    type: String,
    required: false,
  },
  usuarioResponsable: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Índice para búsquedas por usuario responsable
  },
  usuarioReceptor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Índice para búsquedas por usuario receptor
  },
  nameResponsable: {
    type: String,
    required: true
  },
  balanceAntesResponsable: {
    type: String,
    required: true
  },
  balanceDespuesResponsable: {
    type: String,
    required: true
  },
  nameReceptor: {
    type: String,
    required: true
  },
  balanceAntesReceptor: {
    type: String,
    required: true
  },
  balanceDespuesReceptor: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    index: true // Índice para búsquedas por transactionId
  },
  supervisor: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: false,
    index: true // Índice para búsquedas por supervisor
  }
});

// Índices compuestos para optimizar consultas específicas
  MovementSchema.index({ date: -1 });
  MovementSchema.index({ date: -1, usuarioResponsable: 1, usuarioReceptor: 1, login: 1});
  MovementSchema.index({ date: -1, usuarioResponsable: 1, usuarioReceptor: 1 });

const Movement = mongoose.model('Movement', MovementSchema, 'Movement');

module.exports = Movement;