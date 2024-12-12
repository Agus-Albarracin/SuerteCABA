const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment-timezone');

const MovementErrorSchema = new Schema({
  type: {
    type: String,
    enum: ['deposito_erroneo', 'retiro_erroneo'],
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
  MovementErrorSchema.index({ date: -1 });
  MovementErrorSchema.index({ date: -1, usuarioResponsable: 1, usuarioReceptor: 1, login: 1});
  MovementErrorSchema.index({ date: -1, usuarioResponsable: 1, usuarioReceptor: 1 });

const MovementError = mongoose.model('MovementError', MovementErrorSchema, 'MovementError');

module.exports = MovementError;