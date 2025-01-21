const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Decimal128 } = mongoose.Types;
const moment = require('moment-timezone');

const UserSchema = new Schema({
  login: { type: String, required: true, unique: true},
  balance: { type: String, required: false },
  agentBalance: { type: String, required: false },
  adminBalance: { type: String, required: false },
  currency: String,

  // Referencia al supervisor que creó al usuario
  supervisor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  activo: { type: Number, default: 1 },

  // Usuarios creados por este usuario 
  usuariosCreados: [{
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User' },
    rol: { type: String },
    login: {type: String, required: false},
    usuariosCreados: [{
      usuarioId: { type: Schema.Types.ObjectId, ref: 'User' },
      rol: { type: String },
      login: { type: String, required: false }
    }]
  }],

  movimientos: [{
    type: {
      type: String,
      enum: ['deposito', 'retiro']
    },
    date: {
      type: String,
      default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
    },
    monto: Number,
    usuarioResponsable: { type: Schema.Types.ObjectId, ref: 'User' },
    usuarioReceptor: { type: Schema.Types.ObjectId, ref: 'User' },
    nameResponsable: { type: String },
    nameReceptor: { type: String },
    balanceAntes: { type: Decimal128 },
    balanceDespues: { type: Decimal128 },
    transactionId: { type: String },
    rolResponsable: {type: String, requiered: false},
    rolReceptor: {type: String, requiered: false}
  }],

  nombre: String,
  apellido: String,
  password: String,
  email: String,
  rol: { type: String, enum: ['Admin', 'Agente', 'Jugador', 'Super'], required: true }, 

  session: {
    loginTime: { type: Date },
    logoutTime: { type: Date },
    duration: { type: Number } 
  },

  changes: [{
    field: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    date: {
      type: String,
      default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
    }
  }],

  passwordChanges: [{
    oldPassword: { type: String },
    newPassword: { type: String },
    date: {
      type: String,
      default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
    }
  }],

  notifications: [{
    title: { type: String },
    message: { type: String },
    type: { type: String }, 
    date: {
      type: String,
      default: () => moment().tz('America/Argentina/Buenos_Aires').toDate()
    },
    seen: { type: Boolean, default: false }
  }]
});

// Definición de índices
UserSchema.index({ login: 1 }, { unique: true });
UserSchema.index({ rol: 1 });
UserSchema.index({ supervisor: 1 });
UserSchema.index({ activo: 1 });
UserSchema.index({ "usuariosCreados.usuarioId": 1 });
UserSchema.index({ "usuariosCreados.rol": 1 });
UserSchema.index({ rol: 1, supervisor: 1 });
UserSchema.index({ "movimientos.date": 1 });

// Middleware para agregar el usuario a la lista de `usuariosCreados` del supervisor
UserSchema.pre('save', async function(next) {
  if (this.isNew && this.supervisor) {
    // Obtener todos los subusuarios creados por el usuario (si los tiene)
    const subUsuarios = await mongoose.model('User').find({ supervisor: this._id }).select('_id rol login balance');

    // Crear el objeto del usuario con subusuarios
    const usuarioCreado = {
      usuarioId: this._id,
      rol: this.rol,
      login: this.login,
      balance: this.balance,
      usuariosCreados: subUsuarios // Añadir subusuarios si existen
    };

    // Agregar el nuevo usuario con sus subusuarios a la lista de usuarios creados del supervisor
    await mongoose.model('User').findByIdAndUpdate(this.supervisor, {
      $addToSet: { usuariosCreados: usuarioCreado }
    });

    // Propagar la referencia del nuevo usuario a sus supervisores en la jerarquía
    let currentSupervisor = this.supervisor;
    while (currentSupervisor) {
      const supervisor = await mongoose.model('User').findById(currentSupervisor);
      if (supervisor && supervisor.supervisor) {
        currentSupervisor = supervisor.supervisor;

        // Agregar el nuevo usuario con sus subusuarios a los supervisores jerárquicos
        await mongoose.model('User').findByIdAndUpdate(currentSupervisor, {
          $addToSet: { usuariosCreados: usuarioCreado }
        });
      } else {
        currentSupervisor = null;
      }
    }
  }
  next();
});

const User = mongoose.model('User', UserSchema, 'User');

module.exports = User;